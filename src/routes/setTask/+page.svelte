<script lang="ts">
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';
	import { taskStore } from '$lib/TaskStore';
	import { settings } from '$lib/SettingsStore';
	import { emit } from '@tauri-apps/api/event';

	const appWindow = getCurrentWebviewWindow();

	let value: any = null;
	let selectTaskPlaceholder: string = '';

	async function handleTaskOptionClick(item: any) {
		if (item) {
			await settings.updateSettings('taskId', item.id);
			await emit('settings-changed', { $settings });
			value = item;
			appWindow.close();
		}
	}

	async function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
		if (event.key === 'Enter') {
			if (value) {
				await settings.updateSettings('taskId', value.id);
				await emit('settings-changed', { $settings });
				appWindow.close();
			}
		}
	}

	// focus on input field
	onMount(async () => {
		// tmp fix for focus issue
		await getCurrentWebviewWindow().hide();
		await getCurrentWebviewWindow().show();

		await settings.loadSettings();
		await taskStore.fetchTasks();
		// on focus,
		document.getElementById('active-task-select')?.focus();

		if ($settings.taskId) {
			const activeTask = $taskStore.find((t) => t.id === $settings.taskId);

			if (activeTask) {
				selectTaskPlaceholder = activeTask.name;
			} else {
				selectTaskPlaceholder = 'Select Task';
			}
		}
	});

	let floatingConfig = {
		strategy: 'fixed'
	};
</script>

<main class="rounded-lg">
	<Select id="active-task-select" items={$taskStore} itemId="id" {floatingConfig} bind:value>
		<div slot="item" let:item let:index>
			<button
				on:click={async () => await handleTaskOptionClick(item)}
				class="w-full text-left px-2"
			>
				{item.label}
			</button>
		</div>
	</Select>
</main>

<svelte:window on:keydown|capture={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
