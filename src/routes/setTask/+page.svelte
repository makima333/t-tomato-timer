<script>
	import { appWindow, LogicalSize } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';
	/**
	 * @param {{ key: string; }} event
	 */
	function onKeyDown(event) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
	}

	// focus on input field
	onMount(async () => {
		await appWindow.setFocus();
		console.log('focus');
		console.log(document.getElementById('inputTask'));
		document.getElementById('inputTask')?.focus();
	});
</script>

<main class="bg-gray-100 rounded-lg">
	<input
		id="inputTask"
		type="text"
		placeholder="Type task"
		class="input w-full text-gray-700 bg-inherit"
	/>
</main>

<svelte:window on:keydown={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
