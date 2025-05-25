import { settings } from './SettingsStore';

export function SetSoundOn() {
	settings.updateSettings('alertSound', true);
}

export function SetSoundOff() {
	settings.updateSettings('alertSound', false);
}
