<script lang="ts">
	import { onMount } from 'svelte';
	import { emit } from '@tauri-apps/api/event';
	import Select from 'svelte-select';

	import { loadSettings, settingsStore, updateSettings } from '$lib/Settings';
	import { taskStore } from '$lib/TaskStore';

	let task: any;
	let selectTaskPlaceholder: string = '';

	async function save() {
		updateSettings('alertSound', $settingsStore.alertSound);
		updateSettings('alwaysOnTop', $settingsStore.alwaysOnTop);
		updateSettings('taskId', task.id);
		emit('settings-changed', { $settingsStore });
	}

	onMount(async () => {
		await loadSettings();
		await taskStore.fetchTasks();

		if ($settingsStore.taskId) {
			const activeTask = $taskStore.find((t) => t.id === $settingsStore.taskId);
			if (activeTask) {
				selectTaskPlaceholder = activeTask.name;
			} else {
				selectTaskPlaceholder = 'Select Task';
			}
		}
	});
</script>

<main>
	<div class="p-4 space-y-2">
		<!-- alert sound -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={$settingsStore.alertSound} />
			<span>Alert Sound</span>
		</label>
		<!-- always on top -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={$settingsStore.alwaysOnTop} />
			<span>Always on Top</span>
		</label>
		<!-- task -->
		<div>
			<label for="active-task-select">Active Task</label>
			<Select
				id="active-task-select"
				class="input input-bordered"
				placeholder={selectTaskPlaceholder}
				items={$taskStore}
				label="name"
				bind:value={task}
			/>
		</div>
		<!-- fotter -->
		<div class="p-4 flex justify-end space-x-2">
			<button class="btn btn-primary" on:click={save}>Save</button>
		</div>
	</div>
</main>
