import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { writable } from 'svelte/store';

const FILENAME = 'config.json';
const defaultSettings = {
	autoStartSessions: 3,
	alertSound: true,
	alwaysOnTop: false,
	timeDuration: 25,
	breakDuration: 5
};

export async function loadSettings() {
	try {
		const config = await readTextFile(FILENAME, { dir: BaseDirectory.AppConfig });
		return JSON.parse(config);
	} catch (error) {
		return defaultSettings;
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveSettings(settings: Record<string, any>) {
	try {
		await writeTextFile(FILENAME, JSON.stringify(settings), { dir: BaseDirectory.AppConfig });
	} catch (error) {
		console.error(error);
	}
}

export function updateSettings(key: string, value: unknown) {
	settingsStore.update((settings) => {
		settings[key] = value;
		return settings;
	});
}

const initialSettings = await loadSettings();
const settingsStore = writable(initialSettings);
settingsStore.subscribe((value) => {
	saveSettings(value);
});

export default settingsStore;
