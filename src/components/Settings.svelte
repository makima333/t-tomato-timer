<script lang="ts">
	import { onMount } from 'svelte';
	import { emit } from '@tauri-apps/api/event';
	import Select from 'svelte-select';

	import { settings } from '$lib/SettingsStore';
	import { taskStore } from '$lib/TaskStore';

	let task: any;
	let selectTaskPlaceholder: string = '';

	async function save() {
		await settings.updateSettings('alertSound', $settings.alertSound);
		await settings.updateSettings('alwaysOnTop', $settings.alwaysOnTop);
		if (task) {
			await settings.updateSettings('taskId', task.id);
		} else {
			await settings.updateSettings('taskId', $settings.taskId);
		}
		await emit('settings-changed', { $settings });

		selectTaskPlaceholder = task ? task.name : 'Select Task';
		task = null;
	}

	onMount(async () => {
		await settings.loadSettings();
		await taskStore.fetchTasks();

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

<main>
	<div class="p-4 space-y-2">
		<!-- alert sound -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={$settings.alertSound} />
			<span>Alert Sound</span>
		</label>
		<!-- always on top -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={$settings.alwaysOnTop} />
			<span>Always on Top</span>
		</label>
		<!-- task -->
		<div>
			<div class="py-2">Active Task</div>
			<Select
				class="input input-bordered max-w-sm"
				items={$taskStore}
				itemId="id"
				{floatingConfig}
				bind:value={task}
				placeholder={selectTaskPlaceholder}
			></Select>
		</div>
		<!-- fotter -->
		<div class="p-4 flex justify-end space-x-2">
			<button class="btn btn-primary" on:click={save}>Save</button>
		</div>
	</div>
</main>
