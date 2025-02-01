<script lang="ts">
	import { onMount } from 'svelte';
	import Settings from '$components/Settings.svelte';
	import Task from '$components/Tasks.svelte';
	// import { taskStore } from './stores/taskStore'; // タスク管理用
	// import { settingsStore, updateSettings } from './stores/settingsStore'; // 設定管理用
	let currentTab = 'settings';

	onMount(async () => {});
</script>

<main class="p-2">
	<div role="tablist" class="tabs tabs-lifted">
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-interactive-supports-focus -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<a
			role="tab"
			class="tab {currentTab === 'settings' ? 'tab-active' : ''}"
			on:click={() => {
				currentTab = 'settings';
			}}
		>
			Settings
		</a>
		<!-- svelte-ignore a11y-missing-attribute -->
		<!-- svelte-ignore a11y-interactive-supports-focus -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<a
			role="tab"
			class="tab {currentTab === 'task' ? 'tab-active' : ''}"
			on:click={() => {
				currentTab = 'task';
			}}>Tasks</a
		>
		<!-- svelte-ignore a11y-missing-attribute -->
	</div>

	{#if currentTab === 'settings'}
		<Settings />
	{:else}
		<Task />
		<!-- <Task /> -->
	{/if}
</main>
