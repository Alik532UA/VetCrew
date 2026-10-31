// src/lib/services/logService.svelte.ts
import { browser, dev } from '$app/environment';
import { redact } from './redact';
import { safeSessionStorage } from './storage';
import { APP_VERSION } from '../config/version';

type Level = 'info' | 'warn' | 'error';

export interface LogEntry {
	time: string;
	level: Level;
	category: string;
	message: string;
	data: unknown[];
}

const CAPACITY = 1000;
/** У дзеркало — лише хвіст буфера: сховище ділиться з рештою застосунку. */
const MIRRORED = 200;
const MIRROR_KEY = 'log';

/** Вивід info у консоль за категорією — лише в dev; у production консоль бачить тільки error. */
const CONSOLE_CATEGORIES: Record<string, boolean> = { ui: true, network: true, storage: false, i18n: false };

const safeJson = (value: unknown): string => {
	try {
		return JSON.stringify(value);
	} catch {
		// log-exempt: серіалізатор самого логера — запис про його збій ішов би через нього ж
		return '[unserializable]';
	}
};

class LogService {
	errorCount = $state(0);
	/** Ідентифікатор збірки на сервері, якщо його вже прочитано (VERSIONING § 2.2). */
	servedVersion = $state<string | null>(null);
	#entries: LogEntry[] = [];
	#mirror = browser;
	/** Фасад сховища сам пише в журнал про збій запису — без цього прапорця це була б рекурсія. */
	#persisting = false;

	info(category: string, message: string, ...data: unknown[]): void {
		this.#write('info', category, message, data);
	}
	warn(category: string, message: string, ...data: unknown[]): void {
		this.#write('warn', category, message, data);
	}
	error(category: string, message: string, ...data: unknown[]): void {
		this.#write('error', category, message, data);
	}

	#write(level: Level, category: string, message: string, data: unknown[]): void {
		try {
			const entry: LogEntry = {
				time: new Date().toISOString(),
				level,
				category,
				message: String(redact(message)),
				data: data.map((item) => redact(item))
			};
			this.#entries.push(entry);
			if (this.#entries.length > CAPACITY) this.#entries.shift();
			if (level === 'error') this.errorCount += 1;
			this.#toConsole(entry);
			this.#persist();
		} catch {
			// log-exempt: логер не кидає ніколи (§ 1.5), а записати збій запису нікуди, крім нього самого
		}
	}

	#toConsole(entry: LogEntry): void {
		if (!dev && entry.level !== 'error') return;
		if (dev && entry.level === 'info' && CONSOLE_CATEGORIES[entry.category] === false) return;
		console[entry.level](`[${entry.category}] ${entry.message}`, ...entry.data);
	}

	#persist(): void {
		if (!this.#mirror || this.#persisting) return;
		this.#persisting = true;
		try {
			// false — квота чи заблоковане сховище: дзеркало вимикається до кінця сесії, буфер працює.
			if (!safeSessionStorage.set(MIRROR_KEY, safeJson(this.#entries.slice(-MIRRORED)))) this.#mirror = false;
		} finally {
			this.#persisting = false;
		}
	}

	get entries(): readonly LogEntry[] {
		return this.#entries;
	}

	getReport(): string {
		const served = this.servedVersion ? ` (served: ${this.servedVersion})` : '';
		const ver = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : APP_VERSION;
		const header = [
			'--- LOG REPORT ---',
			`DATE: ${new Date().toISOString()}`,
			`URL: ${browser ? String(redact(location.href)) : '-'}`,
			`DEVICE: ${browser ? navigator.userAgent : '-'}`,
			`VERSION: ${ver}${served}`,
			`ONLINE: ${browser ? String(navigator.onLine) : '-'}`,
			'---'
		];
		const lines = this.#entries.map(
			(e) =>
				`[${e.time}] [${e.level.toUpperCase()}] [${e.category.toUpperCase()}] ${e.message}` +
				(e.data.length ? ` ${safeJson(e.data)}` : '')
		);
		return [...header, ...lines].join('\n');
	}
}

export const logService = new LogService();

