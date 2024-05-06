import { readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { writable, get, type Invalidator, type Subscriber } from 'svelte/store';

const FILENAME = 'config.json';
const defaultSettings = {
	alertSound: true,
	alwaysOnTop: false
};

class SettingsStore {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private store;

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.store = writable<Record<string, any>>(defaultSettings);
		this.load();
	}

	get settings() {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return get<Record<string, any>>(this.store);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set(key: string, value: any): any {
		this.store.update((settings) => {
			settings[key] = value;
			return settings;
		});
		this.save();
		return value;
	}

	subscribe(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		run: Subscriber<Record<string, any>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		invalidate?: Invalidator<Record<string, any>> | undefined
	) {
		return this.store.subscribe(run, invalidate);
	}

	private async load() {
		try {
			const config = await readTextFile(FILENAME, { dir: BaseDirectory.AppConfig });
			this.store.set(JSON.parse(config));
		} catch (e) {
			console.error(e);
			this.store.set(defaultSettings);
			this.save();
		}
	}

	private save() {
		writeTextFile(FILENAME, JSON.stringify(get(this.store)), { dir: BaseDirectory.AppConfig });
	}
}

export const settings = new SettingsStore();
