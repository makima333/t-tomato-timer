<script lang="ts">
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';
	import { taskStore } from '$lib/TaskStore';
	import { settings } from '$lib/SettingsStore';
	import { emit } from '@tauri-apps/api/event';

	const appWindow = getCurrentWebviewWindow();

	let task: any = null;
	let selectTaskPlaceholder: string = '';

	function handleTaskOptionClick(item: any) {
		if (item) {
			task = item;
			// appWindow.close();
		}
	}

	async function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
		if (event.key === 'Enter') {
			if (task) {
				await settings.updateSettings('taskId', task.id);
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
	<Select
		id="active-task-select"
		items={$taskStore}
		label="name"
		listAutoWidth={true}
		{floatingConfig}
		class="input"
		placeholder={selectTaskPlaceholder || 'Select Task'}
		bind:value={task}
		searchable={task ? false : true}
	>
		<div slot="list" let:filteredItems>
			<div class="overflow-y-auto p-2 max-h-28">
				{#each filteredItems as item (item.id)}
					<div class="pt-1 pl-1">
						<button
							class="btn btn-ghost w-full justify-start"
							on:click={() => handleTaskOptionClick(item)}
						>
							{item.name}
						</button>
					</div>
				{/each}
			</div>
		</div>
	</Select>
</main>

<svelte:window on:keydown|capture={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
