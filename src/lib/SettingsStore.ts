import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { writable, get } from 'svelte/store';

type SettingsType = {
	taskId: number;
	alertSound: boolean;
	alwaysOnTop: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
};

const defaultSettings: SettingsType = {
	taskId: 0,
	alertSound: true,
	alwaysOnTop: false
};

const FILENAME = 'config.json';
export const settingsStore = writable(defaultSettings);

// export async function loadSettings() {
// 	try {
// 		const config = await readTextFile(FILENAME, { baseDir: BaseDirectory.AppConfig });
// 		settingsStore.set(JSON.parse(config));
// 	} catch (error) {
// 		return defaultSettings;
// 	}
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export async function saveSettings(settings: Record<string, any>) {
// 	try {
// 		await writeTextFile(FILENAME, JSON.stringify(settings), { baseDir: BaseDirectory.AppConfig });
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// export async function updateSettings(key: string, value: unknown) {
// 	console.log('Updating settings...');
// 	console.log(key, value);
// 	settingsStore.update((settings) => {
// 		settings[key] = value;
// 		return settings;
// 	});
// 	await saveSettings(get(settingsStore));
// }

function createSettingsStore() {
	const { subscribe, set, update } = writable(defaultSettings);

	return {
		set,
		subscribe,
		async loadSettings() {
			console.log('Loading settings...');
			try {
				const config = await readTextFile(FILENAME, { baseDir: BaseDirectory.AppConfig });
				set(JSON.parse(config));
			} catch (error) {
				console.error(error);
				return defaultSettings;
			}
		},
		async updateSettings(key: string, value: unknown) {
			update((settings) => {
				settings[key] = value;
				return settings;
			});
			try {
				const settingsObj = get(settings);;
				await writeTextFile(FILENAME, JSON.stringify(settingsObj), {
					baseDir: BaseDirectory.AppConfig
				});
			} catch (error) {
				console.error(error);
			}
		}
	};
}

export const settings = createSettingsStore();
