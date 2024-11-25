import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

const ConfigSchema = z.object({
	messagesPath: z.string().min(1).default('set-me')
});

export const loadConfig = async () => {
	if (!(await exists('', { baseDir: BaseDirectory.AppConfig }))) {
		await mkdir('', { baseDir: BaseDirectory.AppConfig });
	}
	if (!(await exists('config.json', { baseDir: BaseDirectory.AppConfig }))) {
		console.log('Config doesnt exist!');
		await writeTextFile('config.json', JSON.stringify(ConfigSchema.parse({}), null, 2), {
			baseDir: BaseDirectory.AppConfig
		});
	}

	const content = await readTextFile('config.json', { baseDir: BaseDirectory.AppConfig });
	return JSON.parse(content);
};
