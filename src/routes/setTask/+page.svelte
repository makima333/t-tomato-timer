<script lang="ts">
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { taskStore } from '$lib/TaskStore.svelte';
	import { settings } from '$lib/SettingsStore.svelte';
	import { emit } from '@tauri-apps/api/event';
	import type { TaskWithEdit } from '$lib/types';
	import {
		Command,
		CommandEmpty,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command';

	const appWindow = getCurrentWebviewWindow();

	let value: TaskWithEdit | null = null;
	let setTaskWindowBottom: boolean = page.url.searchParams.get('bottom') === 'true';
	let task = $state<TaskWithEdit | null>(null);
	let selectTaskPlaceholder = $state<string>('');
	let searchTerm = $state<string>('');

	async function handleTaskOptionClick(item: TaskWithEdit) {
		if (item) {
			await settings.updateSettings('taskId', item.id);
			await emit('settings-changed', {});
			value = item;
			appWindow.close();
		}
	}

	function handleTriggerFocus() {
		task = null;
		value = null;
		searchTerm = '';
	}

	async function handleSelect(item: TaskWithEdit) {
		task = item;
		value = item;
		await handleTaskOptionClick(item);
	}

	async function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
		if (event.key === 'Enter') {
			if (value) {
				await settings.updateSettings('taskId', value.id);
				await emit('settings-changed', {});
				appWindow.close();
			}
		}
	}

	// Load data and focus on mount
	$effect(() => {
		untrack(async () => {
			await settings.loadSettings();
			await taskStore.fetchTasks();
			await getCurrentWebviewWindow().show();
			document.getElementById('bits-c3')?.focus();
		});
	});

	// Update placeholder when settings change
	$effect(() => {
		if (settings.taskId) {
			const activeTask = taskStore.tasks.find((t) => t.id === settings.taskId);

			if (activeTask) {
				selectTaskPlaceholder = activeTask.name;
			} else {
				selectTaskPlaceholder = 'Select Task';
			}
		}
	});

	const placeholderText = () => selectTaskPlaceholder || 'Select Task';
</script>

<main
	class="min-h-screen flex"
	class:flex-col={true}
	class:justify-end={setTaskWindowBottom}
	class:justify-start={!setTaskWindowBottom}
>
	<div id="active-task-select" class="w-full">
		<Command class={`bg-base-100 border-none${setTaskWindowBottom ? ' flex-col-reverse' : ''}`}>
			<CommandInput
				placeholder={placeholderText()}
				bind:value={searchTerm}
				onfocus={handleTriggerFocus}
			/>
			<CommandList class="bg-base-100">
				<CommandEmpty>No task found.</CommandEmpty>
				{#each taskStore.tasks as item (item.id)}
					<CommandItem value={String(item.name)} onSelect={() => handleSelect(item)}>
						{item.name}
					</CommandItem>
				{/each}
			</CommandList>
		</Command>
	</div>
</main>

<svelte:window onkeydown={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
