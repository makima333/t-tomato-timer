import { appWindow } from '@tauri-apps/api/window';

import { settings } from './Settings';

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	settings.set('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	settings.set('alwaysOnTop', false);
}
