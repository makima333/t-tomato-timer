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

	// focus on input field
	onMount(async () => {
		await appWindow.setFocus();
		document.getElementById('inputTask')?.focus();
		// add css class to inputTask
		document.getElementById('inputTask')?.classList.add('text-gray-700');
		document.getElementsByClassName('sv-control')[0].classList.add('h-16');
	});
</script>

<main class="rounded-lg">
	<!-- <input
		id="inputTask"
		type="text"
		placeholder="Type task"
		class="input w-full  bg-inherit"
	/> -->
	<Svelecte inputId="inputTask" bind:value={myValue} placeholder="Type task" options={list} class=""
	></Svelecte>
</main>

<svelte:window on:keydown={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
