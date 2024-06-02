<script lang="ts">
	import settingsStore from '$lib/Settings';
	import { emit } from '@tauri-apps/api/event';

	let timeDuration = $settingsStore.timeDuration;

	async function save() {
		$settingsStore.timeDuration = timeDuration;
		emit('settings-changed', { $settingsStore });
	}
</script>

<main>
	<div class="p-4 space-y-3">
		Time Duration (minutes)
		<label class="input input-bordered flex items-center gap-4">
			<input type="text" class="grow" bind:value={timeDuration} />
		</label>
	</div>
	<!-- fotter -->
	<div class="p-4 flex justify-end space-x-2">
		<button class="btn btn-primary" on:click={save}>Save</button>
	</div>
</main>
