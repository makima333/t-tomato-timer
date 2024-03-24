import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { writable, derived } from 'svelte/store';

const FILENAME = 'config.json';
let initialized = false;

const defaultSettings = {
	alertSound: true,
	alwaysOnTop: false
};
export const Settings = writable(defaultSettings);

export async function initializeSettings() {
	if (initialized) return;
	try {
		const config = await readTextFile(FILENAME, { dir: BaseDirectory.AppConfig });
		Settings.set(JSON.parse(config));
	} catch (e) {
		console.error(e);
		Settings.set(defaultSettings);
	}
	initialized = true;
}

Settings.subscribe((value) => {
	if (!initialized) return; // 設定が初期化されるのを待つ
	writeTextFile(FILENAME, JSON.stringify(value), { dir: BaseDirectory.AppConfig });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UpdateSetting(key: string, value: any) {
	Settings.update((settings) => ({ ...settings, [key]: value }));
}

export const isSoundOn = derived(Settings, ($Settings) => $Settings.alertSound ?? true);
export const isAlwaysOnTop = derived(Settings, ($Settings) => $Settings.alwaysOnTop ?? false);
