import { settings } from './Settings';

export function SetSoundOn() {
	settings.set('alertSound', true);
}

export function SetSoundOff() {
	settings.set('alertSound', false);
}
