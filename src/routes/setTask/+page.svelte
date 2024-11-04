<script>
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { onMount } from 'svelte';
	import Svelecte from 'svelecte';
	const appWindow = getCurrentWebviewWindow()

	const list = [
		{ id: 1, name: 'Item 1' },
		{ id: 2, name: 'Item 2' }
	];

	/**
	 * @type {null}
	 */
	let myValue = null;
	/**
	 * @param {{ key: string; }} event
	 */
	function onKeyDown(event) {
		if (event.key === 'Escape') {
			appWindow.close();
		}
		if (event.key === 'Enter') {
			console.log(myValue);
		}
	}
	// location.reload();

	// focus on input field
	onMount(async () => {
		// tmp fix for focus issue
		await getCurrentWebviewWindow().hide();
		await getCurrentWebviewWindow().show();
		document.getElementById('inputTask')?.focus();
	});
</script>

<main class="rounded-lg">
	<!-- <input
		id="inputTask"
		type="text"
		placeholder="Type task"
		class="input w-full  bg-inherit"
	/> -->
	<Svelecte 
		inputId="inputTask"
		 bind:value={myValue} 
		 placeholder="Type task" 
		 options={list} 
	></Svelecte>
</main>

<svelte:window on:keydown={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
