<script>
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';
	import { taskStore } from '$lib/TaskStore';
	import { settings } from '$lib/SettingsStore';

	const appWindow = getCurrentWebviewWindow();

	/** @type {{ id: number; label: string } | null } */
	let task = null;

	/**
	 * @param {{ id: number; label: string }} item
	 */
	function handleTaskOptionClick(item) {
		if (item) task = item;
	}

	/**
	 * @param {{ key: string; }} event
	 */
	async function onKeyDown(event) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
		if (event.key === 'Enter') {
			if (task) {
				await settings.updateSettings('taskId', task.id);
				appWindow.close();
			}
		}
	}

	// focus on input field
	onMount(async () => {
		// tmp fix for focus issue
		await getCurrentWebviewWindow().hide();
		await getCurrentWebviewWindow().show();
		await taskStore.fetchTasks();
		// on focus,
		document.getElementById('active-task-select').focus();
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
		bind:value={task}
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
