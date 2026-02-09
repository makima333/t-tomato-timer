<script lang="ts">
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { untrack } from 'svelte';
	import { taskStore } from '$lib/TaskStore';
	import { settings } from '$lib/SettingsStore';
	import { emit } from '@tauri-apps/api/event';
	import {
		Command,
		CommandEmpty,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command';

	const appWindow = getCurrentWebviewWindow();

	let value: any = null;
	let setTaskWindowBottom: boolean = false;
	let task = $state<any>(null);
	let selectTaskPlaceholder = $state<string>('');
	let searchTerm = $state<string>('');

	async function handleTaskOptionClick(item: any) {
		if (item) {
			await settings.updateSettings('taskId', item.id);
			await emit('settings-changed', { $settings });
			value = item;
			appWindow.close();
		}
	}

	function handleTriggerFocus() {
		task = null;
		value = null;
		searchTerm = '';
	}

	async function handleSelect(item: any) {
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
				await emit('settings-changed', { $settings });
				appWindow.close();
			}
		}
	}

	// Load data and focus on mount
	$effect(() => {
		untrack(() => {
			// tmp fix for focus issue
			// getCurrentWebviewWindow().hide();
			// getCurrentWebviewWindow().show();

			settings.loadSettings();
			taskStore.fetchTasks();
			// on focus,
			document.getElementById('active-task-select')?.focus();
		});
	});

	// Update placeholder when settings change
	$effect(() => {
		if ($settings.taskId) {
			const activeTask = $taskStore.find((t) => t.id === $settings.taskId);

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
		<Command>
			<CommandInput
				placeholder={placeholderText()}
				bind:value={searchTerm}
				onfocus={handleTriggerFocus}
			/>
			<CommandList>
				<CommandEmpty>No task found.</CommandEmpty>
				{#each $taskStore as item (item.id)}
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
