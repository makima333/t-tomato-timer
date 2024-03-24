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
	import { isSoundOn, isAlwaysOnTop } from '$lib/Settings';

	function toggleAlwaysOnTop() {
		if ($isAlwaysOnTop) {
			SetAlwaysOnTopOff();
		} else {
			SetAlwaysOnTopOn();
		}
	}

	$: clsAlwaysOnTop = $isAlwaysOnTop ? 'text-primary' : '';

	let audioPlayer = new AudioPlayer(AlertWav, 1);

	function handleClick() {
		if ($isSoundOn) {
			SetSoundOff();
		} else {
			audioPlayer.playAudio();
			SetSoundOn();
		}
	}
</script>

<div>
	<button class="btn" on:click={closeDrawer}>
		<CloseMenu />
	</button>
	<button class="btn" on:click={toggleAlwaysOnTop}>
		<AlwaysOnTop cls={clsAlwaysOnTop} />
	</button>
	<button class="btn" on:click={handleClick}>
		{#if $isSoundOn}
			<SoundOn />
		{:else}
			<SoundOff />
		{/if}
	</button>
</div>
