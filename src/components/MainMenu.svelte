<script lang="ts">
	export let closeDrawer = () => {};

	import { SetAlwaysOnTopOn, SetAlwaysOnTopOff } from '$lib/WindowApi';
	import { SetSoundOn, SetSoundOff } from '$lib/SoundToggle';
	import { AudioPlayer } from '$lib/AudioPlay';

	import AlwaysOnTop from '../icons/AlwaysOnTop.svelte';
	import CloseMenu from '../icons/CloseMenu.svelte';
	import SoundOn from '../icons/SoundOn.svelte';
	import SoundOff from '../icons/SoundOff.svelte';
	import AlertWav from '../assets/alert.wav';
	import { settings } from '$lib/Settings';

	let audioPlayer = new AudioPlayer(AlertWav, 1);

	$: isAlwaysOnTop = $settings.alwaysOnTop;
	$: isSoundOn = $settings.alertSound;
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
</script>

<div class="flex items-center justify-center space-x-1">
	<button class="btn btn-ghost btn-square" on:click={closeDrawer}>
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
</div>
