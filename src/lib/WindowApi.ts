import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { settings } from './SettingsStore.svelte';
const appWindow = getCurrentWebviewWindow();

export function SetAlwaysOnTopOn(): void {
	appWindow.setAlwaysOnTop(true);
	settings.updateSettings('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff(): void {
	appWindow.setAlwaysOnTop(false);
	settings.updateSettings('alwaysOnTop', false);
}
