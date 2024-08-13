<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { writable, get, derived } from 'svelte/store';
	import { appWindow, LogicalSize } from '@tauri-apps/api/window';

	import MainMenu from '../components/MainMenu.svelte';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';
	import { SetAlwaysOnTopOn } from '$lib/WindowApi';
	import settingsStore, { loadSettings } from '$lib/Settings';

	import CloseButton from '../icons/Close.svelte';
	import PlayButton from '../icons/Play.svelte';
	import StopButton from '../icons/Stop.svelte';
	import PauseButton from '../icons/Pause.svelte';
	import MenuButton from '../icons/Menu.svelte';
	import AlertWav from '../assets/alert.wav';
	import { listen } from '@tauri-apps/api/event';

	const WORKTIME = $settingsStore.timeDuration as number;
	const BREAKTIME = $settingsStore.breakDuration as number;
	const INTERVAL = 1000 * 60;
	// const INTERVAL = 100;

	let autoStartSessions = $settingsStore.autoStartSessions as number;
	let intervalId: number | undefined = undefined;
	const time = writable($settingsStore.timeDuration as number);
	const playPauseToggle = writable(true);
	const workBreakToggle = writable(true);
	const audioPlayer = new AudioPlayer(AlertWav, 2);

	$: time.update(() => $settingsStore.timeDuration as number);
	$: isSoundOn = $settingsStore['alertSound'] as boolean;
	$: if ($settingsStore['alwaysOnTop']) {
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
			let isFinished = false;
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
						isFinished = true;
						return BREAKTIME;
					}
					workBreakToggle.set(true);
					isFinished = true;
					return WORKTIME;
				}
				return n - 1;
			});
			if (isFinished && autoStartSessions > 0) {
				if (get(time) === WORKTIME) {
					autoStartSessions--;
				}
				if (autoStartSessions > 0) {
					startTimer();
				} else {
					autoStartSessions = $settingsStore.autoStartSessions as number;
				}
			}
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
		autoStartSessions = $settingsStore.autoStartSessions as number;
	}

	function toggleDrawer() {
		document.getElementById('my-drawer-2')?.click();
	}

	function closeWindow() {
		appWindow.close();
	}

	let worktimes = Array.from({ length: WORKTIME }, (_, i) => i + 1);

	time.subscribe((value) => {
		worktimes = Array.from({ length: value }, (_, i) => i + 1);
	});

	const shortCutKeys = {
		Space: ' ',
		Esc: 'Escape',
		Ctrl: 'Control',
		keyT: 't'
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
			case event.ctrlKey && shortCutKeys.keyT:
				console.log('Ctrl + key');
				break;
		}
	}

	$: appWindow.setSize(new LogicalSize(300 + WORKTIME * 10, 50));

	const playPauseClickHandler = WithBlur(toggleTimer);
	const stopClickHandler = WithBlur(stopTimer);
	const menuClickHnadler = WithBlur(toggleDrawer);

	onMount(() => {
		listen('settings-changed', async (event) => {
			stopTimer();
			$settingsStore = await loadSettings();
		});
	});

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
			<ul class="timeline">
				{#each worktimes as { }}
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
			<div class="flex items-center justify-center">
				<div class="flex items-center justify-center mr-1" transition:fade>
					{#if $time < 10}
						0{$time}
					{:else}
						{$time}
					{/if}m
				</div>
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
		<div class=" w-screen bg-base-100 h-full text-base-content flex fles-1">
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
