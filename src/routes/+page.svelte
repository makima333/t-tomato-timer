<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { appWindow } from '@tauri-apps/api/window';

	import MainMenu from '../components/MainMenu.svelte';
	import { AudioPlayer } from '$lib/AudioPlay';

	import CloseButton from '../icons/Close.svelte';
	import PlayButton from '../icons/Play.svelte';
	import StopButton from '../icons/Stop.svelte';
	import PauseButton from '../icons/Pause.svelte';
	import MenuButton from '../icons/Menu.svelte';
	import AlertWav from '../assets/alert.wav';
	import { initializeSettings, isAlwaysOnTop, isSoundOn } from '$lib/Settings';
	import { SetAlwaysOnTopOn } from '$lib/WindowApi';

	const WORKTIME = 25;
	const BREAKTIME = 5;
	const INTERVAL = 1000 * 60;

	let time = writable(WORKTIME);
	let intervalId: number | undefined = undefined;
	let playPauseToggle = writable(true);
	let workBreakToggle = writable(true);

	let audioPlayer = new AudioPlayer(AlertWav, 2);

	(async () => {
		await initializeSettings();
		if ($isAlwaysOnTop) {
			SetAlwaysOnTopOn();
		}
	})();

	// タイマーを開始する関数
	function startTimer() {
		if (intervalId) {
			clearInterval(intervalId);
		}
		intervalId = setInterval(() => {
			time.update((n) => {
				if (n === 0) {
					if ($isSoundOn) {
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
		if (intervalId === undefined) {
			startTimer();
		} else {
			pauseTimer();
		}
	}

	// タイマーを一時停止する関数
	function pauseTimer() {
		clearInterval(intervalId);
		intervalId = undefined;
		playPauseToggle.set(true);
	}

	// タイマーを停止する関数
	function stopTimer() {
		clearInterval(intervalId);
		intervalId = undefined;
		time.set(WORKTIME);
		playPauseToggle.set(true);
		workBreakToggle.set(true);
	}

	function closeDrawer() {
		document.getElementById('my-drawer-2')?.click();
	}

	function closeWindow() {
		appWindow.close();
	}

	let items = Array.from({ length: WORKTIME }, (_, i) => i + 1);

	time.subscribe((value) => {
		items = Array.from({ length: value }, (_, i) => i + 1);
	});

	onDestroy(async () => {
		clearInterval(intervalId);
	});
</script>

<main class="drawer drawer-end">
	<input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<div data-tauri-drag-region class="titlebar h-4 bg-slate-400 flex justify-between">
			<div></div>
			<button on:click={closeWindow}>
				<CloseButton />
			</button>
		</div>
		<div class="ml-4 py-2 flex flex-1 justify-between">
			<ul class="timeline w-[300px]">
				{#each items as { }}
					<li>
						<div class="timeline-middle">
							{#if $workBreakToggle === true}
								<div
									class={`w-2 h-6 mr-1 rounded-sm bg-info outline outline-1`}
									out:fade={{ duration: 300 }}
								></div>
							{:else}
								<div
									class={`w-2 h-6 mr-1 rounded-sm bg-success outline outline-1`}
									out:fade={{ duration: 300 }}
								></div>
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
				<button class="btn btn-sm btn-ghost mr-1" on:click={toggleTimer}>
					{#if $playPauseToggle}
						<PlayButton />
					{:else}
						<PauseButton />
					{/if}
				</button>
				<button class="btn btn-sm btn-ghost mr-1" on:click={stopTimer}>
					<StopButton />
				</button>
				<label for="my-drawer-2" class="btn btn-sm btn-ghost drawer-button ml-5">
					<MenuButton />
				</label>
			</div>
		</div>
	</div>
	<div class="drawer-side">
		<label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="menu menu-horizontal w-screen h-full bg-neutral text-base-content flex fles-1">
			<MainMenu {closeDrawer} />
		</div>
	</div>
</main>
