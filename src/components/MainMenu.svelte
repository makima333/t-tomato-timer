<script lang="ts">
	let { closeDrawer = () => {} }: { closeDrawer?: (event?: MouseEvent) => void } = $props();

	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { LogicalSize } from '@tauri-apps/api/dpi';

	import { SetAlwaysOnTopOn, SetAlwaysOnTopOff } from '$lib/WindowApi';
	import { SetSoundOn, SetSoundOff } from '$lib/SoundToggle';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';
	import { settings } from '$lib/SettingsStore';

	import AlwaysOnTop from '../icons/AlwaysOnTop.svelte';
	import CloseMenu from '../icons/CloseMenu.svelte';
	import Settings from '../icons/Settings.svelte';
	import SoundOn from '../icons/SoundOn.svelte';
	import SoundOff from '../icons/SoundOff.svelte';
	import AlertWav from '../assets/alert.wav';

	let audioPlayer = new AudioPlayer(AlertWav, 1);

	let isAlwaysOnTop = $derived($settings.alwaysOnTop);
	let isSoundOn = $derived($settings.alertSound);
	let clsAlwaysOnTop = $derived(isAlwaysOnTop ? 'text-primary' : '');

	function toggleAlwaysOnTop() {
		if (isAlwaysOnTop) {
			SetAlwaysOnTopOff();
		} else {
			SetAlwaysOnTopOn();
		}
	}

	function handleClick() {
		if (isSoundOn) {
			SetSoundOff();
		} else {
			audioPlayer.playAudio();
			SetSoundOn();
		}
	}

	const clickSettingsHandler = WithBlur(lauchSettingsWindow);

	async function lauchSettingsWindow() {
		const settingsWindow = new WebviewWindow('settings', {
			url: '/settings',
			title: 'Settings',
			height: 600,
			width: 750,
			visible: false
		});
		settingsWindow.once('tauri://created', async function () {
			// delay 500ms
			await new Promise((resolve) => setTimeout(resolve, 500));
			await settingsWindow.show();
			await settingsWindow.setSize(new LogicalSize(750, 600));
		});
	}
</script>

<div class="flex items-center justify-center space-x-1">
	<button class="btn btn-square" onclick={WithBlur(closeDrawer)}>
		<CloseMenu />
	</button>
	<button class="btn" onclick={WithBlur(toggleAlwaysOnTop)}>
		<AlwaysOnTop cls={clsAlwaysOnTop} />
	</button>
	<button class="btn" onclick={WithBlur(handleClick)}>
		{#if isSoundOn}
			<SoundOn />
		{:else}
			<SoundOff />
		{/if}
	</button>
	<button class="btn" onclick={clickSettingsHandler}>
		<Settings />
	</button>
</div>
