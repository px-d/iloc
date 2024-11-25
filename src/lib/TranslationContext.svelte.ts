import { loadConfig } from '$lib';
import { err, ok, Result } from '@px-d/rsjs';
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { getContext, setContext } from 'svelte';

export type Translation = {
	locale: string;

	translations: Record<string, string>;
	file: {
		path: string;
	};
};

export class TranslationState {
	translationDir: string | null = null;

	dirty: boolean = $state(false);

	translations: Translation[] = $state([]);

	searchQuery = $state('');
	selectedTranslationIndex: null | number = $state(null);

	/**
	 * A reactive store that holds an array of filtered keys.
	 */
	filteredKeys: string[] = $state([]);

	/**
	 * A derived store that computes a sorted array of unique translation keys.
	 *
	 * This store iterates over all translations and collects all unique keys
	 * from the `translations` objects. The keys are then sorted in ascending order.
	 *
	 * @returns {string[]} A sorted array of unique translation keys.
	 */
	keyset = $derived(() => {
		const set = new Set<string>();

		this.translations.forEach((translation) => {
			Object.keys(translation.translations).forEach((x) => set.add(x));
		});

		return Array.from(set).sort();
	});

	constructor() {
		$effect(() => {
			loadConfig().then((config) => {
				this.translationDir = config.messagesPath;

				this.loadTranslations().then((x) => {
					this.translations = x;
					this.save();
					this.populate(this.keyset());
				});
			});
		});

		$effect(() => {
			if (this.searchQuery === '') {
				this.filteredKeys = this.keyset();
				return;
			}

			const queries = this.searchQuery
				.split(',')
				.map((x) => x.trim())
				.filter((x) => x.length > 0);

			const queryKey = this.keyset().filter((key) =>
				queries.some((query) => key.toLowerCase().includes(query.toLowerCase()))
			);

			const queryValue = this.translations.flatMap((translation) => {
				return Object.entries(translation.translations)
					.map(([key, value]) => {
						if (
							queries.some((query) => key.toLowerCase().includes(query.toLowerCase())) ||
							queries.some((query) => value.toLowerCase().includes(query.toLowerCase()))
						) {
							return key;
						}
						return null;
					})
					.filter((x) => x !== null);
			});

			this.filteredKeys = Array.from(new Set([...queryKey, ...queryValue]));
		});
	}

	/**
	 * Flattens a nested object into a single level object with dot-separated keys.
	 *
	 * @param input - The nested object to flatten.
	 * @returns A new object with flattened keys.
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

		const translationsResult = await Promise.all(
			files.map(async (file) => {
				const text = await readTextFile(`${this.translationDir}/${file.name}`);
				return Result.wrap<Translation, string>(() => {
					return {
						locale: file.name.split('/').pop()?.replace('.json', '') || file.name,
						translations: this.flatten(JSON.parse(text)),
						file: {
							path: `${this.translationDir}/${file.name}`,
							name: file.name
						}
					} as Translation;
				});
			})
		);

		return translationsResult.map((t) => (t.isOk ? t.unwrap() : null)).filter((x) => x !== null);
	}

	async populate(keyset: string[]) {
		console.log('Populating translations...');
		for (const translation of this.translations) {
			for (const key of keyset) {
				if (!(key in translation.translations)) {
					console.log('Adding', key);
					translation.translations[key] = '';
				}
			}

			await this.save();
		}
	}

	async save() {
		await Promise.all(this.translations.map(this.save_single));
	}

	async save_single(t: Translation) {
		await writeTextFile(t.file.path, JSON.stringify(t.translations, null, 2));
	}

	async createNewLocale(name: string): Promise<Result<boolean, string>> {
		if (!name.includes('.json')) {
			name = name + '.json';
		}

		name = name.replaceAll(' ', '_');

		console.log('Creating new locale', name);

		await writeTextFile(`${this.translationDir}/${name}`, '{}');

		await this.loadTranslations().then((x) => (this.translations = x));
		this.populate(this.keyset());
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
	 * Clears the translation for the specified key in all translations.
	 *
	 * @param key - The key of the translation to clear.
	 * @returns A promise that resolves when the translations have been saved.
	 */
	async clearKey(key: string) {
		for (const t of this.translations) {
			t.translations[key] = '';
		}

		await this.save();
	}

	/**
	 * Searches through all translations and finds duplicate values

		@returns string[]
	 */
	getDuplicates() {
		const dupes: Record<string, { locale: string; key: string }[]> = {};

		this.translations.forEach((translation) => {
			Object.entries(translation.translations).forEach(([key, value]) => {
				if (!dupes[value]) {
					dupes[value] = [];
				}
				dupes[value].push({ locale: translation.locale, key });
			});
		});

		const filteredDupes: Record<string, { locale: string; key: string }[]> = {};

		Object.entries(dupes).forEach(([value, keys]) => {
			if (keys.length > 1 && value.trim() !== '') {
				filteredDupes[value] = keys;
			}
		});
		
		return filteredDupes
		console.log(filteredDupes[0]);

		// const valueMap: Record<string, { locale: string; dupes: string[] }> = {};

		// this.translations.forEach((translation) => {
		// 	Object.entries(translation.translations).forEach(([key, value]) => {
		// 		if (!valueMap[value]) {
		// 			valueMap[value] = { locale: translation.locale, dupes: [] };
		// 		}
		// 		valueMap[value].dupes.push(key);
		// 	});
		// });

		// return Object.entries(valueMap).filter(([v, keys]) => keys.dupes.length > 1 && v !== '');
	}
}

const TRANSLATION_KEY = Symbol('TRANSLATIONS');

export function setTranslationState() {
	return setContext(TRANSLATION_KEY, new TranslationState());
}

export function getTranslationState() {
	return getContext<ReturnType<typeof setTranslationState>>(TRANSLATION_KEY);
}
