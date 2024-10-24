import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

import { UpdateSetting } from './Settings';
const appWindow = getCurrentWebviewWindow()

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	UpdateSetting('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	UpdateSetting('alwaysOnTop', false);
}
