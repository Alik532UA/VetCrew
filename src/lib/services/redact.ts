// src/lib/services/redact.ts — одна редакція для журналу, звіту й телеметрії
const SENSITIVE_KEY =
	/pass(?:word)?|token|secret|authorization|cookie|session|e-?mail|phone|api[-_]?key/i;
const MASK = '[redacted]';
/** Пошта, зокрема закодована в адресі чи тілі форми (`john%40example.com`). */
const EMAIL = /\b([\w.%+-])[\w.%+-]*?(?:@|%40)([\w-]+(?:\.[\w-]+)*\.[a-z]{2,})\b/gi;
/** Пара `ключ=значення` — у `?` і `#` абсолютної чи відносної адреси, у рядку параметрів, у тілі форми. */
const PAIR = /(^|[?&#;\s])([^=&#;\s"'<>]+)=([^&#;\s"'<>]*)/g;
/** Пара `"ключ": значення` у рядку JSON (тіло відповіді в повідомленні про збій). */
const JSON_PAIR = /("((?:[^"\\]|\\.)*)"\s*:\s*)("(?:[^"\\]|\\.)*"|-?\d[\d.eE+-]*|true|false|null)/g;

/** Ключ параметра — розкодований: `pass%77ord` — той самий пароль. */
function sensitive(key: string): boolean {
	try {
		return SENSITIVE_KEY.test(decodeURIComponent(key));
	} catch {
		// log-exempt: редакцію кличе логер; ключ із битим кодуванням перевіряється як є
		return SENSITIVE_KEY.test(key);
	}
}

/** Чутливі параметри адрес (і в `?`, і в `#`, куди OAuth кладе токен), пари в JSON і пошта в тексті — масковано. */
function redactText(text: string): string {
	return text
		.replace(/https?:\/\/[^\s"'<>]+/gi, (address) => {
			try {
				const url = new URL(address);
				if (url.password) url.password = MASK;
				return url.href;
			} catch {
				// log-exempt: редакцію кличе логер; рядок, що не розбирається як адреса, лишається як є — це не збій
				return address;
			}
		})
		.replace(PAIR, (pair: string, lead: string, key: string) =>
			sensitive(key) ? `${lead}${key}=${MASK}` : pair
		)
		.replace(JSON_PAIR, (pair: string, head: string, key: string) =>
			sensitive(key) ? `${head}"${MASK}"` : pair
		)
		.replace(EMAIL, (_, first: string, domain: string) => `${first}***@${domain}`);
}

/**
 * Копія значення без PII. Ключі-секрети масковано, помилка зберігає `name`,
 * `message`, `stack`, `cause` і власні перелічувані поля, цикл позначається
 * замість нескінченного обходу. `ancestors` — лише предки поточного вузла:
 * спільне посилання не є циклом.
 */
export function redact(value: unknown, ancestors: WeakSet<object> = new WeakSet()): unknown {
	if (typeof value === 'string') return redactText(value);
	// JSON.stringify кидає на BigInt, а функція з іменем toJSON підмінила б запис.
	if (typeof value === 'bigint' || typeof value === 'symbol') return String(value);
	if (typeof value === 'function') return '[function]';
	if (value === null || typeof value !== 'object') return value;
	if (ancestors.has(value)) return '[circular]';
	ancestors.add(value);
	try {
		// `name`, `message`, `stack`, `cause` не перелічувані: Object.entries(new Error('x')) — порожній масив.
		// Перелічувані (`code` у FirebaseError) проходять ту саму редакцію, що й звичайний об'єкт.
		if (value instanceof Error) {
			return {
				...(redact({ ...value }, ancestors) as Record<string, unknown>),
				name: value.name,
				message: redactText(value.message),
				stack: value.stack === undefined ? undefined : redactText(value.stack),
				cause: redact(value.cause, ancestors)
			};
		}
		if (Array.isArray(value)) return value.map((item) => redact(item, ancestors));
		if (value instanceof Map) return redact(Object.fromEntries(value), ancestors);
		if (value instanceof Set) return redact([...value], ancestors);
		// Екземпляр класу — рядком: `URL` дає адресу, `URLSearchParams` — `token=…&page=2`, і пари маскує редакція тексту.
		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) return redactText(String(value));
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				SENSITIVE_KEY.test(key) ? MASK : redact(item, ancestors)
			])
		);
	} finally {
		ancestors.delete(value);
	}
}
