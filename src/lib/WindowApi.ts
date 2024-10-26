import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

import { updateSettings } from './Settings';
const appWindow = getCurrentWebviewWindow()

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	updateSettings('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	updateSettings('alwaysOnTop', false);
}
