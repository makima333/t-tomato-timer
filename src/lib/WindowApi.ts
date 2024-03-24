import { appWindow } from '@tauri-apps/api/window';

import { UpdateSetting } from './Settings';

export function SetAlwaysOnTopOn() {
	appWindow.setAlwaysOnTop(true);
	UpdateSetting('alwaysOnTop', true);
}

export function SetAlwaysOnTopOff() {
	appWindow.setAlwaysOnTop(false);
	UpdateSetting('alwaysOnTop', false);
}
