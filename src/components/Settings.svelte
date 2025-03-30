<script lang="ts">
	import { onMount } from 'svelte';
	import { emit } from '@tauri-apps/api/event';
	import Select from 'svelte-select';

	import { loadSettings, settingsStore, updateSettings } from '$lib/Settings';
	import { taskStore } from '$lib/TaskStore';

	let task: any;
	let selectTaskPlaceholder: string = '';

	function handleTaskOptionClick(item: any) {
		if (item) task = item;
	}

	async function save() {
		updateSettings('alertSound', $settingsStore.alertSound);
		updateSettings('alwaysOnTop', $settingsStore.alwaysOnTop);
		if (task) {
			updateSettings('taskId', task.id);
		} else {
			updateSettings('taskId', $settingsStore.taskId);
		}
		emit('settings-changed', { $settingsStore });

		selectTaskPlaceholder = task ? task.name : 'Select Task';
		task = null;
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
				class="input input-bordered max-w-sm"
				placeholder={selectTaskPlaceholder}
				items={$taskStore}
				label="name"
				bind:value={task}
				on:focus={() => (task = null)}
			>
				<div slot="list" let:filteredItems>
					{#if !task}
						<div class="max-h-40 overflow-y-auto p-2">
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
					{/if}
				</div>
			</Select>
		</div>
		<!-- fotter -->
		<div class="p-4 flex justify-end space-x-2">
			<button class="btn btn-primary" on:click={save}>Save</button>
		</div>
	</div>
</main>
