<script>
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { onMount } from 'svelte';
	import Select from 'svelte-select';
	const appWindow = getCurrentWebviewWindow();

	const list = [
		{ id: 1, label: 'Item 1aaaaaaaaaaaaaaafdsafdsafdsafdsafdsafdsafdsafdsa' },
		{ id: 2, label: 'Item 2' },
		{ id: 3, label: 'Item 3' },
		{ id: 4, label: 'Item 4' },
		{ id: 5, label: 'Item 5' },
		{ id: 6, label: 'Item 6' }
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
	});

	let floatingConfig = {
		strategy: 'fixed'
	};
</script>

<main class="rounded-lg">
	<!-- <input
		id="inputTask"
		type="text"
		placeholder="Type task"
		class="input w-full  bg-inherit"
	/> -->
	<Select items={list} listAutoWidth={true} {floatingConfig} class="input" />
</main>

<svelte:window on:keydown|capture={onKeyDown} />

<style>
	:root {
		background-color: transparent !important;
	}
</style>
