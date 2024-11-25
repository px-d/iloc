import { loadConfig } from '$lib';
import { err, ok, Result } from '@px-d/rsjs';
import { BaseDirectory, readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { getContext, setContext } from 'svelte';

export type Translation = {
	locale: string;

	translations: Record<string, string>;
	file: {
		baseDir: BaseDirectory;
		name: string;
	};
};

export class TranslationState {
	translationDir: string | null = null;
	baseDir: BaseDirectory | null = null;

	dirty = $state(false);

	translations = $state<Translation[]>([]);

	searchQuery = $state('');
	selectedTranslation = $state<null | number>(null);

	filteredKeys = $state<string[]>([]);

	keyset = $derived(() => {
		const set = new Set<string>();

		this.translations.forEach((translation) => {
			Object.keys(translation.translations).forEach((x) => set.add(x));
		});

		return Array.from(set).sort();
	});

	constructor() {
		// this.translationDir = dir;
		// this.baseDir = baseDir;
		$effect(() => {
			loadConfig().then((config) => {
				this.translationDir = config.messagesPath;

				this.loadTranslations().then((x) => {
					this.translations = x;
				});
			});
		});
		// watch(
		// 	'config.json',
		// 	(e) => {
		// 		if (e.type.modify.kind === 'data' && e.type.modify.mode === 'content') {
		// 			this.selectedTranslation = null;
		// 			this.translations = [];
		// 			this.searchQuery = '';
		// 			this.filteredKeys = [];
		// 			loadConfig().then((config) => {
		// 				console.log('loading cfg');

		// 				this.translationDir = config.messagesPath;

		// 				this.loadTranslations().then((x) => {
		// 					this.translations = x;
		// 				});
		// 			});
		// 		}
		// 	},
		// 	{ baseDir: BaseDirectory.AppConfig }
		// );

		$effect(() => {
			this.selectedTranslation = null;
			if (this.searchQuery === '') {
				this.filteredKeys = this.keyset();
				return;
			}

			const queries = this.searchQuery
				.split(',')
				.map((x) => x.trim())
				.filter((x) => x.length > 0);

			this.filteredKeys = this.keyset().filter((key) =>
				queries.some((query) => key.toLowerCase().includes(query.toLowerCase()))
			);
		});
	}

	/**
	 * Converts this:
	 * ```ts
	 * { user: { id: 1, name: 'string' }}
	 * ```
	 * to this:
	 * ```ts
	 * { user.id: 1, user.name: 'string' }
	 * ```
	 *
	 * @param input the object to flatten
	 */
	private flatten(input: Record<string, unknown>) {
		const result: Record<string, unknown> = {};

		const recurse = (cur: Record<string, unknown>, prop: string) => {
			if (Object(cur) !== cur || Array.isArray(cur)) {
				result[prop] = cur;
			} else {
				let isEmpty = true;
				for (const key in cur) {
					isEmpty = false;
					recurse(cur[key] as Record<string, unknown>, prop ? `${prop}.${key}` : key);
				}
				if (isEmpty && prop) {
					result[prop] = {};
				}
			}
		};

		recurse(input, '');
		return result;
	}

	async loadTranslations() {
		console.log('Loading Translations...');
		if (!this.translationDir) {
			return [];
		}

		const files = (await readDir(this.translationDir)).filter((file) =>
			file.name.endsWith('.json')
		);

		const x = await Promise.all(
			files.map(async (file) => {
				const text = await readTextFile(`${this.translationDir}/${file.name}`);
				return Result.wrap<Translation, string>(() => {
					return {
						locale: file.name.split('/').pop()?.replace('.json', '') || file.name,
						translations: this.flatten(JSON.parse(text)),
						file: {
							baseDir: BaseDirectory.AppData,
							name: `${this.translationDir}/${file.name}`
						}
					} as Translation;
				});
			})
		);

		return x.map((t) => (t.isOk ? t.unwrap() : null)).filter((x) => x !== null);
	}

	async populate(keyset: string[]) {
		for (const translation of this.translations) {
			for (const key of keyset) {
				if (!(key in translation.translations)) {
					translation.translations[key] = '';
				}
			}

			await this.save();
		}
	}

	async save() {
		for (const t of this.translations) {
			await writeTextFile(t.file.name, JSON.stringify(t.translations, null, 2), {
				baseDir: t.file.baseDir
			});
		}
	}

	async createNewTranslation(name: string): Promise<Result<boolean, string>> {
		if (!name.includes('.json')) {
			name = name + '.json';
		}

		name = name.replaceAll(' ', '_');

		await writeTextFile(`${this.translationDir}/${name}`, '{}');
		this.loadTranslations().then((x) => (this.translations = x));
		this.populate([]);
		return ok(true);
	}

	createNewKey(key: string): Result<boolean, string> {
		if (this.keyset().includes(key)) {
			return err('Key already exists.');
		}

		console.log('Creating key', `'${key}'`);

		const newKey = key.replaceAll(' ', '_');
		if (newKey.length === 0) return err('Key is empty');
		this.populate([newKey]);
		return ok(true);
	}

	async deleteKey(key: string) {
		for (const t of this.translations) {
			delete t.translations[key];

			await this.save();
		}

		this.dirty = true;
	}
	/**
	 * Searches through all translations and finds duplicate values

		@returns string[]
	 */
	getDuplicates() {
		const valueMap: Record<string, { locale: string; dupes: string[] }> = {};

		this.translations.forEach((translation) => {
			Object.entries(translation.translations).forEach(([key, value]) => {
				const stringValue = String(value);
				if (!valueMap[stringValue]) {
					valueMap[stringValue] = { locale: translation.locale, dupes: [] };
				}
				valueMap[stringValue].dupes.push(key);
			});
		});

		return Object.entries(valueMap).filter(([v, keys]) => keys.dupes.length > 1 && v !== '');
	}
}

const TRANSLATION_KEY = Symbol('TRANSLATIONS');

export function setTranslationState() {
	return setContext(TRANSLATION_KEY, new TranslationState());
}

export function getTranslationState() {
	return getContext<ReturnType<typeof setTranslationState>>(TRANSLATION_KEY);
}
