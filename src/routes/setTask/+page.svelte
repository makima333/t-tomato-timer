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
	let setTaskWindowBottom: boolean = false;

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
		// get parameter from URL
		const urlParams = new URLSearchParams(window.location.search);
		const bottom = urlParams.get('bottom');
		if (bottom) {
			setTaskWindowBottom = bottom === 'true';
			console.log('setTaskWindowBottom:', setTaskWindowBottom);
		}

		// tmp fix for focus issue
		await getCurrentWebviewWindow().hide();
		await getCurrentWebviewWindow().show();

		await settings.loadSettings();
		await taskStore.fetchTasks();

		// Select コンポーネントにフォーカス
		setTimeout(() => {
			const selectElement = document.getElementById('active-task-select');
			if (selectElement) {
				selectElement.focus();
			}
		}, 100);

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

<main
	class="min-h-screen flex"
	class:flex-col={true}
	class:justify-end={setTaskWindowBottom}
	class:justify-start={!setTaskWindowBottom}
>
	<div class="w-full" class:mb-2={setTaskWindowBottom} class:mt-2={!setTaskWindowBottom}>
		<Select
			id="active-task-select"
			items={$taskStore}
			itemId="id"
			{floatingConfig}
			bind:value
			placeholder={selectTaskPlaceholder || 'Select Task'}
			class="w-full bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		>
			<div slot="item" let:item>
				<button
					on:click={async () => await handleTaskOptionClick(item)}
					class="w-full text-left py-2 hover:bg-gray-100 focus:bg-gray-100 transition-colors duration-150"
				>
					{item.label}
				</button>
			</div>
		</Select>
	</div>
</main>

<svelte:window on:keydown|capture={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
