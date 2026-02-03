<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { untrack } from 'svelte';
	import Select from 'svelte-select';

	import { settings } from '$lib/SettingsStore';
	import { taskStore } from '$lib/TaskStore';

	let task = $state<any>(null);
	let selectTaskPlaceholder = $state<string>('');
	let alertSound = $state<boolean>(false);
	let alwaysOnTop = $state<boolean>(false);
	let isInitialized = $state<boolean>(false);

	function handleTaskOptionClick(item: any) {
		if (item) task = item;
	}

	async function save() {
		// Update all settings and wait for file write to complete
		await settings.updateSettings('alertSound', alertSound);
		await settings.updateSettings('alwaysOnTop', alwaysOnTop);
		if (task) {
			await settings.updateSettings('taskId', task.id);
		} else {
			await settings.updateSettings('taskId', $settings.taskId);
		}

		// Emit event after all settings are saved
		await emit('settings-changed', { $settings });

		selectTaskPlaceholder = task ? task.name : 'Select Task';
		task = null;
	}

	// Load settings once on mount
	$effect(() => {
		untrack(async () => {
			await settings.loadSettings();
			await taskStore.fetchTasks();
			isInitialized = true;
		});
	});

	// Sync local state from store only on initial load
	$effect(() => {
		if (!isInitialized) return;

		untrack(() => {
			alertSound = $settings.alertSound;
			alwaysOnTop = $settings.alwaysOnTop;

			if ($settings.taskId) {
				const activeTask = $taskStore.find((t) => t.id === $settings.taskId);

				if (activeTask) {
					selectTaskPlaceholder = activeTask.name;
				} else {
					selectTaskPlaceholder = 'Select Task';
				}
			}
		});
	});

	let floatingConfig = {
		strategy: 'fixed'
	};
</script>

<main>
	<div class="p-4 space-y-2">
		<!-- alert sound -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={alertSound} />
			<span>Alert Sound</span>
		</label>
		<!-- always on top -->
		<label class="input input-bordered flex items-center gap-4">
			<input type="checkbox" bind:checked={alwaysOnTop} />
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
				on:focus={() => (task = null)}
			>
				<div slot="list" let:filteredItems>
					{#if !task}
						<div class="max-h-40 overflow-y-auto p-2">
							{#each filteredItems as item (item.id)}
								<div class="pt-1 pl-1">
									<button
										class="btn btn-ghost w-full justify-start"
										onclick={() => handleTaskOptionClick(item)}
									>
										{item.name}
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</Select>
			<!-- fotter -->
			<div class="p-4 flex justify-end space-x-2">
				<button class="btn btn-primary" onclick={save}>Save</button>
			</div>
		</div>
	</div>
</main>
