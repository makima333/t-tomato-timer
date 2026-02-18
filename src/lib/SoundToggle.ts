import { settings } from './SettingsStore.svelte';

export function SetSoundOn(): void {
	settings.updateSettings('alertSound', true);
}

export function SetSoundOff(): void {
	settings.updateSettings('alertSound', false);
}
