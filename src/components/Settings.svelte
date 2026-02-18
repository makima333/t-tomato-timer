<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { untrack } from 'svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	import { settings } from '$lib/SettingsStore.svelte';
	import { taskStore } from '$lib/TaskStore.svelte';
	import type { TaskWithEdit } from '$lib/types';
	import {
		Command,
		CommandEmpty,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';

	let task = $state<TaskWithEdit | null>(null);
	let selectTaskPlaceholder = $state<string>('');
	let alertSound = $state<boolean>(false);
	let alwaysOnTop = $state<boolean>(false);
	let isInitialized = $state<boolean>(false);
	let open = $state<boolean>(false);
	let searchTerm = $state<string>('');
	let triggerRef = $state<HTMLButtonElement>(null!);

	function handleTaskOptionClick(item: TaskWithEdit) {
		if (item) task = item;
	}

	function handleTriggerFocus() {
		task = null;
		searchTerm = '';
		open = true;
	}

	function handleSelect(item: TaskWithEdit) {
		handleTaskOptionClick(item);
		open = false;
	}

	async function save() {
		await settings.updateSettings('alertSound', alertSound);
		await settings.updateSettings('alwaysOnTop', alwaysOnTop);
		if (task) {
			await settings.updateSettings('taskId', task.id);
		}

		await emit('settings-changed', {});

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
			alertSound = settings.alertSound;
			alwaysOnTop = settings.alwaysOnTop;

			if (settings.taskId) {
				const activeTask = taskStore.tasks.find((t) => t.id === settings.taskId);

				if (activeTask) {
					selectTaskPlaceholder = activeTask.name;
				} else {
					selectTaskPlaceholder = 'Select Task';
				}
			}
		});
	});

	const placeholderText = () => selectTaskPlaceholder || 'Select Task';
</script>

<main>
	<div class="p-4 space-y-2">
		<!-- alert sound -->
		<div class="space-x-2">
			<input type="checkbox" class="checkbox" bind:checked={alertSound} />
			<span>Alert Sound</span>
		</div>
		<!-- always on top -->
		<div class="space-x-2">
			<input type="checkbox" class="checkbox" bind:checked={alwaysOnTop} />
			<span>Always on Top</span>
		</div>

		<!-- task -->
		<div>
			<div class="py-2">Active Task</div>
			<Popover bind:open>
				<PopoverTrigger onfocus={handleTriggerFocus} bind:ref={triggerRef}>
					{#snippet child({ props })}
						<span {...props} class="truncate input">{task ? task.name : placeholderText()}</span>
					{/snippet}
				</PopoverTrigger>
				<PopoverContent class="p-0 w-72" align="start">
					<Command>
						<CommandInput placeholder="Search task..." bind:value={searchTerm} />
						<CommandList>
							<CommandEmpty>No task found.</CommandEmpty>
							{#each taskStore.tasks as item (item.id)}
								<CommandItem value={String(item.name)} onSelect={() => handleSelect(item)}>
									{item.name}
								</CommandItem>
							{/each}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			<!-- fotter -->
			<div class="p-4 flex justify-end space-x-2">
				<button class="btn btn-primary" onclick={save}>Save</button>
			</div>
		</div>
	</div>
</main>
