import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { writable, get } from 'svelte/store';

type SettingsType = {
	autoStartSessions: number;
	alertSound: boolean;
	alwaysOnTop: boolean;
	timeDuration: number;
	breakDuration: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
};

const defaultSettings: SettingsType = {
	autoStartSessions: 3,
	alertSound: true,
	alwaysOnTop: false,
	timeDuration: 25,
	breakDuration: 5
};

const FILENAME = 'config.json';
export const settingsStore = writable(defaultSettings);

export async function loadSettings() {
	try {
		const config = await readTextFile(FILENAME, { baseDir: BaseDirectory.AppConfig });
		settingsStore.set(JSON.parse(config));
	} catch (error) {
		return defaultSettings;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveSettings(settings: Record<string, any>) {
	try {
		await writeTextFile(FILENAME, JSON.stringify(settings), { baseDir: BaseDirectory.AppConfig });
	} catch (error) {
		console.error(error);
	}
}

export function updateSettings(key: string, value: unknown) {
	settingsStore.update((settings) => {
		settings[key] = value;
		return settings;
	});
	saveSettings(get(settingsStore));
}
