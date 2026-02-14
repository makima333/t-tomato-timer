<script lang="ts">
	import { fade } from 'svelte/transition';
	import { writable, get } from 'svelte/store';
	import { untrack } from 'svelte';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { LogicalSize } from '@tauri-apps/api/dpi';

	import MainMenu from '../components/MainMenu.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';
	import { SetAlwaysOnTopOn, SetAlwaysOnTopOff } from '$lib/WindowApi';
	import { setTaskWindowLancher } from '$lib/WindowLancher';
	import { settings } from '$lib/SettingsStore';
	import { TaskDBClient } from '$lib/sqls/task';

	import CloseButton from '../icons/Close.svelte';
	import PlayButton from '../icons/Play.svelte';
	import StopButton from '../icons/Stop.svelte';
	import PauseButton from '../icons/Pause.svelte';
	import MenuButton from '../icons/Menu.svelte';
	import AlertWav from '../assets/alert.wav';
	import { emit, listen } from '@tauri-apps/api/event';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	const appWindow = getCurrentWebviewWindow();

	const INTERVAL = 1000 * 60;
	// const INTERVAL = 100;

	const timerStore = writable({ workTime: 25, breakTime: 5, autoStartSessions: 0 });
	let taskName = $state('');
	let activeTaskId = $state($settings.taskId as number);
	let previousTaskId = 0;
	let autoStartSessions = $state<number>(0);
	let workTime = $state($timerStore.workTime as number);
	let breakTime = $state($timerStore.breakTime as number);
	let open = $state(false);

	function initialize() {
		activeTaskId = $settings.taskId as number;
		workTime = $timerStore.workTime as number;
		breakTime = $timerStore.breakTime as number;
		autoStartSessions = $timerStore.autoStartSessions as number;

		// Only emit if taskId has changed to prevent infinite loop
		if (activeTaskId !== previousTaskId) {
			emit('task-changed', { taskId: activeTaskId });
			previousTaskId = activeTaskId;
		}
	}

	let intervalId: number | undefined = undefined;
	const time = writable($timerStore.workTime as number);
	const playPauseToggle = writable(true);
	const workBreakToggle = writable(true);
	const audioPlayer = new AudioPlayer(AlertWav, 2);

	let isSoundOn = $derived($settings.alertSound as boolean);

	$effect(() => {
		time.update(() => $timerStore.workTime as number);
	});

	$effect(() => {
		if ($settings.alwaysOnTop) {
			appWindow.setAlwaysOnTop(true);
		} else {
			appWindow.setAlwaysOnTop(false);
		}
	});

	$effect(() => {
		autoStartSessions = $timerStore.autoStartSessions as number;
	});

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
						return $timerStore.breakTime as number;
					}
					workBreakToggle.set(true);
					isFinished = true;
					return $timerStore.workTime as number;
				}
				return n - 1;
			});
			// 自動スタートの処理
			if (isFinished && autoStartSessions > 0) {
				if (get(time) === $timerStore.workTime) {
					autoStartSessions--;
				}
				if (autoStartSessions > 0) {
					startTimer();
				} else {
					autoStartSessions = $timerStore.autoStartSessions as number;
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
		time.set($timerStore.workTime);
		playPauseToggle.set(true);
		workBreakToggle.set(true);
		autoStartSessions = $settings.autoStartSessions as number;
	}

	function toggleDrawer() {
		open = !open;
	}

	function closeWindow() {
		// appWindow.close();
	}

	let worktimes = $state(Array.from({ length: $timerStore.workTime as number }, (_, i) => i + 1));

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
				if (open) {
					toggleDrawer();
				}
				stopTimer();
				break;
			case event.ctrlKey && shortCutKeys.keyT:
				setTaskWindowLancher();
				break;
		}
	}

	$effect(() => {
		// console.log('workTime changed:', $timerStore.workTime);
		appWindow.setSize(new LogicalSize(300 + ($timerStore.workTime as number) * 10, 55));
	});

	const playPauseClickHandler = WithBlur(toggleTimer);
	const stopClickHandler = WithBlur(stopTimer);
	const menuClickHnadler = WithBlur(toggleDrawer);

	function closeDrawer() {
		open = false;
	}

	$effect(() => {
		const unsubscribe1 = listen('settings-changed', async (event) => {
			stopTimer();
			await settings.loadSettings();
			// Reload all settings including task details
			initialize();
		});

		const unsubscribe2 = listen('task-changed', async (event: { payload: { taskId: number } }) => {
			const taskId = event.payload?.taskId ?? 0;
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			const task = await taskDBClient.read(taskId);
			if (task.length > 0) {
				const { id, name, work_time, break_time, auto_start } = task[0];
				taskName = name;
				timerStore.set({
					workTime: work_time,
					breakTime: break_time,
					autoStartSessions: auto_start
				});
			} else {
				taskName = 'Pomodoro Timer';
			}
			stopTimer();
		});

		untrack(async () => {
			await settings.loadSettings();
			initialize();
		});

		getCurrentWebviewWindow().setShadow(false);

		return () => {
			unsubscribe1.then((fn) => fn());
			unsubscribe2.then((fn) => fn());
			clearInterval(intervalId);
		};
	});
</script>

<main class="bg-slate-50 rounded-sm min-h-screen">
	<div class="rounded-2xl">
		<div data-tauri-drag-region class="titlebar h-5 bg-slate-200 flex justify-between rounded-t-sm">
			<div data-tauri-drag-region class="text-black pl-2">
				<span
					data-tauri-drag-region
					class="badge badge-sm pb-2 badge-ghost text-black bg-inherit border-transparent z-50"
					style="cursor: default;"
				>
					{#if taskName === 'Pomodoro Timer'}
						Pomodoro Timer
					{:else}
						tttimer -- {taskName}
					{/if}
				</span>
			</div>
			<button onclick={closeWindow} class="mr-2">
				<CloseButton />
			</button>
		</div>
		<div class="ml-4 flex flex-1 justify-between text-slate-500">
			<ul class="timeline">
				{#each worktimes as { }}
					<li>
						<div class="timeline-middle">
							{#if $workBreakToggle === true}
								<div class={`w-1.5 h-3 mr-1 rounded-sm bg-info outline outline-1`}></div>
							{:else}
								<div class={`w-2 h-3 mr-1 rounded-sm bg-success outline outline-1`}></div>
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
				<button class="btn btn-sm btn-ghost mr-1" onclick={playPauseClickHandler}>
					{#if $playPauseToggle}
						<PlayButton />
					{:else}
						<PauseButton />
					{/if}
				</button>
				<button class="btn btn-sm btn-ghost mr-1" onclick={stopClickHandler}>
					<StopButton />
				</button>

				<Drawer.Root bind:open direction="right">
					<Drawer.Trigger class="btn btn-sm btn-ghost" onclick={menuClickHnadler}>
						<MenuButton />
					</Drawer.Trigger>
					<Drawer.Content>
						<div class="p-2 bg-base-100/50">
							<MainMenu {closeDrawer} />
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>
		</div>
	</div>
</main>

<svelte:window {onkeydown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
