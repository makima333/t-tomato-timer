import { UpdateSetting } from './Settings';

export function SetSoundOn() {
	UpdateSetting('alertSound', true);
}

export function SetSoundOff() {
	UpdateSetting('alertSound', false);
}
