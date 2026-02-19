<script lang="ts">
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { LogicalSize } from '@tauri-apps/api/dpi';

	import MainMenu from '../components/MainMenu.svelte';
	import * as Drawer from '$lib/components/ui/drawer';
	import { AudioPlayer } from '$lib/AudioPlay';
	import { WithBlur } from '$lib/WithBlur';
	import { setTaskWindowLancher } from '$lib/WindowLancher';
	import { settings } from '$lib/SettingsStore.svelte';
	import { TaskDBClient } from '$lib/sqls/task';
	import { TimerState } from '$lib/TimerState.svelte';

	import CloseButton from '../icons/Close.svelte';
	import PlayButton from '../icons/Play.svelte';
	import StopButton from '../icons/Stop.svelte';
	import PauseButton from '../icons/Pause.svelte';
	import MenuButton from '../icons/Menu.svelte';
	import AlertWav from '../assets/alert.wav';
	import { emit, listen } from '@tauri-apps/api/event';

	const appWindow = getCurrentWebviewWindow();

	const INTERVAL = 1000;
	// const INTERVAL = 100;

	const audioPlayer = new AudioPlayer(AlertWav, 2);

	const timer = new TimerState({
		audioPlayer,
		isSoundOn: () => settings.alertSound,
		interval: INTERVAL
	});

	let taskName = $state('');
	let previousTaskId = 0;
	let open = $state(false);

	function initialize() {
		const activeTaskId = settings.taskId;
		// Only emit if taskId has changed to prevent infinite loop
		if (activeTaskId !== previousTaskId) {
			emit('task-changed', { taskId: activeTaskId });
			previousTaskId = activeTaskId;
		}
	}

	// Always-on-top の同期
	$effect(() => {
		appWindow.setAlwaysOnTop(settings.alwaysOnTop);
	});

	// ウィンドウサイズを workTime に連動させる
	$effect(() => {
		appWindow.setSize(new LogicalSize(300 + timer.workTime * 10, 55));
	});

	function toggleDrawer() {
		open = !open;
	}

	function closeWindow() {
		appWindow.close();
	}

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
				timer.toggle();
				break;
			case shortCutKeys.Esc:
				if (open) {
					toggleDrawer();
				}
				timer.stop();
				break;
			case event.ctrlKey && shortCutKeys.keyT:
				setTaskWindowLancher();
				break;
		}
	}

	const playPauseClickHandler = WithBlur(() => timer.toggle());
	const stopClickHandler = WithBlur(() => timer.stop());
	const menuClickHandler = WithBlur(toggleDrawer);

	function closeDrawer() {
		open = false;
	}

	$effect(() => {
		const unsubscribe1 = listen('settings-changed', async () => {
			timer.stop();
			await settings.loadSettings();
			initialize();
		});

		const unsubscribe2 = listen('task-changed', async (event: { payload: { taskId: number } }) => {
			const taskId = event.payload?.taskId ?? 0;
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			const task = await taskDBClient.read(taskId);
			if (task.length > 0) {
				const { name, work_time, break_time, auto_start } = task[0];
				taskName = name;
				timer.configure(work_time, break_time, auto_start);
			} else {
				taskName = 'Pomodoro Timer';
			}
		});

		untrack(async () => {
			await settings.loadSettings();
			initialize();
		});

		getCurrentWebviewWindow().setShadow(false);

		return () => {
			unsubscribe1.then((fn) => fn());
			unsubscribe2.then((fn) => fn());
			timer.destroy();
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
					title="Set Task shortcut: Ctrl+T"
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
				{#each timer.dots as { }}
					<li>
						<div class="timeline-middle">
							{#if timer.isWorkPhase}
								<div
									class={`w-1.5 h-3 mr-1 rounded-sm ${timer.isPaused ? 'bg-slate-300' : 'bg-info'} outline outline-1`}
								></div>
							{:else}
								<div
									class={`w-2 h-3 mr-1 rounded-sm ${timer.isPaused ? 'bg-slate-300' : 'bg-success'} outline outline-1`}
								></div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<div class="flex items-center justify-center">
				<div class="flex items-center justify-center mr-1" transition:fade>
					{#if timer.isUnderOneMinute}
						{#if timer.displaySeconds < 10}
							0{timer.displaySeconds}
						{:else}
							{timer.displaySeconds}
						{/if}s
					{:else}
						{#if timer.displayMinutes < 10}
							0{timer.displayMinutes}
						{:else}
							{timer.displayMinutes}
						{/if}m
					{/if}
				</div>
				<button class="btn btn-sm btn-ghost mr-1" onclick={playPauseClickHandler}>
					{#if timer.isPaused}
						<PlayButton />
					{:else}
						<PauseButton />
					{/if}
				</button>
				<button class="btn btn-sm btn-ghost mr-1" onclick={stopClickHandler}>
					<StopButton />
				</button>

				<Drawer.Root bind:open direction="right">
					<Drawer.Trigger class="btn btn-sm btn-ghost" onclick={menuClickHandler}>
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
