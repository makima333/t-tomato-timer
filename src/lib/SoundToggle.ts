import { updateSettings } from './Settings';

export function SetSoundOn() {
	updateSettings('alertSound', true);
}

export function SetSoundOff() {
	updateSettings('alertSound', false);
}
