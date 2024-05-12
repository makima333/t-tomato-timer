<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { appWindow } from '@tauri-apps/api/window';

	import MainMenu from '../components/MainMenu.svelte';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';

	import CloseButton from '../icons/Close.svelte';
	import PlayButton from '../icons/Play.svelte';
	import StopButton from '../icons/Stop.svelte';
	import PauseButton from '../icons/Pause.svelte';
	import MenuButton from '../icons/Menu.svelte';
	import AlertWav from '../assets/alert.wav';
	import { settings } from '$lib/Settings';
	import { SetAlwaysOnTopOn } from '$lib/WindowApi';

	const WORKTIME = 25;
	const BREAKTIME = 5;
	const INTERVAL = 1000 * 60;

	let time = writable(WORKTIME);
	let intervalId: number | undefined = undefined;
	let playPauseToggle = writable(true);
	let workBreakToggle = writable(true);
	let audioPlayer = new AudioPlayer(AlertWav, 2);

	$: isSoundOn = $settings['alertSound'] as boolean;
	$: if ($settings['alwaysOnTop']) {
		SetAlwaysOnTopOn();
	}

	// タイマーを開始する関数
	function startTimer() {
		// TODO: Timer Status Store
		if (intervalId === -1) {
			intervalId = undefined;
		} else {
			time.update((n) => n - 1);
		}
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(() => {
			time.update((n) => {
				if (n === 0) {
					if (isSoundOn) {
						audioPlayer.playAudio();
					}
					clearInterval(intervalId);
					intervalId = undefined;
					playPauseToggle.set(true);
					if ($workBreakToggle) {
						workBreakToggle.set(false);
						return BREAKTIME;
					}
					workBreakToggle.set(true);
					return WORKTIME;
				}
				return n - 1;
			});
		}, INTERVAL);
		playPauseToggle.set(false);
	}

	function toggleTimer() {
		if (intervalId === undefined || intervalId === -1) {
			startTimer();
		} else {
			pauseTimer();
		}
	}

	function pauseTimer() {
		clearInterval(intervalId);
		intervalId = -1;
		playPauseToggle.set(true);
	}

	function stopTimer() {
		clearInterval(intervalId);
		intervalId = undefined;
		time.set(WORKTIME);
		playPauseToggle.set(true);
		workBreakToggle.set(true);
	}

	function toggleDrawer() {
		document.getElementById('my-drawer-2')?.click();
	}

	function closeWindow() {
		appWindow.close();
	}

	let items = Array.from({ length: WORKTIME }, (_, i) => i + 1);

	time.subscribe((value) => {
		items = Array.from({ length: value }, (_, i) => i + 1);
	});

	const shortCutKeys = {
		Space: ' ',
		Esc: 'Escape'
	};

	function onkeydown(event: KeyboardEvent) {
		if (event.key in shortCutKeys) {
			event.preventDefault();
		}
		switch (event.key) {
			case shortCutKeys.Space:
				toggleTimer();
				break;
			case shortCutKeys.Esc:
				if ((document.getElementById('my-drawer-2') as HTMLInputElement)?.checked) {
					toggleDrawer();
				}
				stopTimer();
				break;
		}
	}

	const playPauseClickHandler = WithBlur(toggleTimer);
	const stopClickHandler = WithBlur(stopTimer);
	const menuClickHnadler = WithBlur(toggleDrawer);

	onDestroy(async () => {
		clearInterval(intervalId);
	});
</script>

<main class="drawer drawer-end bg-base-100 rounded-lg">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<div data-tauri-drag-region class="titlebar h-4 bg-slate-400 flex justify-between rounded-t-lg">
			<div></div>
			<button on:click={closeWindow} class="mr-2">
				<CloseButton />
			</button>
		</div>
		<div class="ml-4 flex flex-1 justify-between">
			<ul class="timeline w-[250px]">
				{#each items as { }}
					<li>
						<div class="timeline-middle">
							{#if $workBreakToggle === true}
								<div class={`w-1.5 h-3 mr-1 rounded-sm bg-info outline outline-1`}></div>
							{:else}
								<div class={`w-2 h-6 mr-1 rounded-sm bg-success outline outline-1`}></div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<div class="flex items-center justify-center" transition:fade>
				{#if $time < 10}
					0{$time}
				{:else}
					{$time}
				{/if}m
			</div>
			<div class="flex items-center justify-center">
				<button class="btn btn-sm btn-ghost mr-1" on:click={playPauseClickHandler}>
					{#if $playPauseToggle}
						<PlayButton />
					{:else}
						<PauseButton />
					{/if}
				</button>
				<button class="btn btn-sm btn-ghost mr-1" on:click={stopClickHandler}>
					<StopButton />
				</button>

				<button class="btn btn-sm btn-ghost" on:click={menuClickHnadler}>
					<MenuButton />
				</button>
			</div>
		</div>
	</div>
	<div class="drawer-side h-12">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class=" w-screen h-full bg-neutral text-base-content flex fles-1">
			<MainMenu closeDrawer={toggleDrawer} />
		</div>
	</div>
</main>

<svelte:window on:keydown={onkeydown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
