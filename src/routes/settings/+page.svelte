<script lang="ts">
	import Settings from '$components/Settings.svelte';
	import Task from '$components/Tasks.svelte';
	let currentTab = $state('settings');
</script>

<main class="p-2">
	<div role="tablist" class="tabs tabs-lifted">
		<!-- svelte-ignore a11y_missing_attribute -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<a
			role="tab"
			class="tab {currentTab === 'settings' ? 'tab-active' : ''}"
			onclick={() => {
				currentTab = 'settings';
			}}
		>
			Settings
		</a>
		<!-- svelte-ignore a11y_missing_attribute -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<a
			role="tab"
			class="tab {currentTab === 'task' ? 'tab-active' : ''}"
			onclick={() => {
				currentTab = 'task';
			}}>Tasks</a
		>
	</div>

	{#if currentTab === 'settings'}
		<Settings />
	{:else}
		<Task />
		<!-- <Task /> -->
	{/if}
</main>
