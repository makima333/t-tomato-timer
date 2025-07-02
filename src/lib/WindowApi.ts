import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { settings } from './SettingsStore';
const appWindow = getCurrentWebviewWindow()

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	settings.updateSettings('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	settings.updateSettings('alwaysOnTop', false);
}
