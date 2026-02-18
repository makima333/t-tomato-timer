import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import type { Settings } from './types';

const FILENAME = 'config.json';

const defaultSettings: Settings = {
	taskId: 0,
	alertSound: true,
	alwaysOnTop: false
};

class SettingsState {
	taskId = $state<number>(defaultSettings.taskId);
	alertSound = $state<boolean>(defaultSettings.alertSound);
	alwaysOnTop = $state<boolean>(defaultSettings.alwaysOnTop);

	async loadSettings(): Promise<void> {
		console.log('Loading settings...');
		try {
			const config = await readTextFile(FILENAME, { baseDir: BaseDirectory.AppConfig });
			const parsed: Settings = JSON.parse(config);
			this.taskId = parsed.taskId ?? defaultSettings.taskId;
			this.alertSound = parsed.alertSound ?? defaultSettings.alertSound;
			this.alwaysOnTop = parsed.alwaysOnTop ?? defaultSettings.alwaysOnTop;
		} catch (error) {
			console.error(error);
			this.taskId = defaultSettings.taskId;
			this.alertSound = defaultSettings.alertSound;
			this.alwaysOnTop = defaultSettings.alwaysOnTop;
		}
	}

	async updateSettings<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
		this[key] = value;
		try {
			const settingsObj: Settings = {
				taskId: this.taskId,
				alertSound: this.alertSound,
				alwaysOnTop: this.alwaysOnTop
			};
			await writeTextFile(FILENAME, JSON.stringify(settingsObj), {
				baseDir: BaseDirectory.AppConfig
			});
		} catch (error) {
			console.error(error);
		}
	}
}

export const settings = new SettingsState();
