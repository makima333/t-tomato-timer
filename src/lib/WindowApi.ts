import { appWindow } from '@tauri-apps/api/window';

import { updateSettings } from './Settings';

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	updateSettings('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	updateSettings('alwaysOnTop', false);
}
