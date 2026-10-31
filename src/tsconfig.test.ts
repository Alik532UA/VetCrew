// src/tsconfig.test.ts — GATE-TS-STRICT
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import config from '../svelte.config.js';

/** Зібраний tsconfig — з extends, як його бачить svelte-check, а не текст файлу. */
const file = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const { options } = ts.parseJsonConfigFileContent(file.config, ts.sys, process.cwd());
/** Родина strict: кожен прапорець окремо вимикає свій клас помилок і за strict: true. */
const STRICT_FAMILY = [
	'noImplicitAny',
	'strictNullChecks',
	'strictFunctionTypes',
	'strictBindCallApply',
	'strictPropertyInitialization',
	'noImplicitThis',
	'useUnknownInCatchVariables',
	'alwaysStrict',
	'strictBuiltinIteratorReturn'
] as const;
/** Поза strict (§ 1.1); allowJs і checkJs — щоб svelte-check бачив JS-модулі й тести, що їх імпортують. */
const REQUIRED = ['noUncheckedIndexedAccess', 'noImplicitReturns', 'allowJs', 'checkJs'] as const;

describe('tsconfig: прапорці § 1.1', () => {
	it('перевірка жива: tsconfig.json прочитано', () => {
		expect(file.error, 'tsconfig.json не читається').toBeUndefined();
		expect(Object.keys(options).length).toBeGreaterThan(0);
	});

	it('strict увімкнений, і жоден прапорець його родини не вимкнено окремо', () => {
		const strict = options.strict ?? Number(ts.versionMajorMinor.split('.')[0]) >= 6;
		expect(strict, 'strict вимкнено').toBe(true);
		expect(STRICT_FAMILY.filter((flag) => options[flag] === false), 'вимкнено окремо').toEqual([]);
	});

	it('прапорці поза strict увімкнені', () => {
		expect(REQUIRED.filter((flag) => options[flag] !== true)).toEqual([]);
	});

	it('svelte.config.js примушує руни в коді проєкту й лишає бібліотекам їхній режим (§ 1.1.1)', () => {
		const runes = config.compilerOptions?.runes;
		const modeOf = (filename: string) => (typeof runes === 'function' ? runes({ filename }) : runes);
		expect(modeOf('src/lib/components/ui/Card.svelte'), 'без рун компонент у синтаксисі Svelte 4 проходить check і lint').toBe(true);
		expect(modeOf('node_modules/some-lib/Widget.svelte'), 'runes: true для node_modules ламає бібліотеки без рун').toBeUndefined();
	});
});

