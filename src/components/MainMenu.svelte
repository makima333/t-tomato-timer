<script lang="ts">
	export let closeDrawer = () => {};

	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { LogicalSize } from '@tauri-apps/api/dpi';

	import { SetAlwaysOnTopOn, SetAlwaysOnTopOff } from '$lib/WindowApi';
	import { SetSoundOn, SetSoundOff } from '$lib/SoundToggle';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';
	import { settingsStore } from '$lib/Settings';

	import AlwaysOnTop from '../icons/AlwaysOnTop.svelte';
	import CloseMenu from '../icons/CloseMenu.svelte';
	import Settings from '../icons/Settings.svelte';
	import SoundOn from '../icons/SoundOn.svelte';
	import SoundOff from '../icons/SoundOff.svelte';
	import AlertWav from '../assets/alert.wav';
	const appWindow = getCurrentWebviewWindow();

	let audioPlayer = new AudioPlayer(AlertWav, 1);

	$: isAlwaysOnTop = $settingsStore.alwaysOnTop;
	$: isSoundOn = $settingsStore.alertSound;
	$: clsAlwaysOnTop = isAlwaysOnTop ? 'text-primary' : '';

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

	async function settingsClickHandler() {
		const settingsWindow = new WebviewWindow('settings', {
			url: '/settings',
			title: 'Settings',
			height: 400,
			width: 400,
			transparent: true,
			visible: false
		});
		settingsWindow.once('tauri://created', async function () {
			// delay 100ms
			await new Promise((resolve) => setTimeout(resolve, 500));
			await settingsWindow.setSize(new LogicalSize(400, 450));
		});
	}
</script>

<div class="flex items-center justify-center space-x-1 mx-4">
	<button class="btn btn-ghost btn-square" on:click={WithBlur(closeDrawer)}>
		<CloseMenu />
	</button>
	<button class="btn" on:click={toggleAlwaysOnTop}>
		<AlwaysOnTop cls={clsAlwaysOnTop} />
	</button>
	<button class="btn" on:click={handleClick}>
		{#if isSoundOn}
			<SoundOn />
		{:else}
			<SoundOff />
		{/if}
	</button>
	<button class="btn btn-ghost" on:click={settingsClickHandler}>
		<Settings />
	</button>
</div>
