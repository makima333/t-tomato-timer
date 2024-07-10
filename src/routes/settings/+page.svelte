<script lang="ts">
	import settingsStore from '$lib/Settings';
	import { emit } from '@tauri-apps/api/event';

	let timeDuration = $settingsStore.timeDuration;
	let breakDuration = $settingsStore.breakDuration;
	let autoStartSessions = $settingsStore.autoStartSessions;

	async function save() {
		$settingsStore.timeDuration = timeDuration;
		$settingsStore.breakDuration = breakDuration;
		$settingsStore.autoStartSessions = autoStartSessions;
		emit('settings-changed', { $settingsStore });
	}
</script>

<main>
	<div>
		<div class="p-4">
			Time Duration (minutes)
			<label class="input input-bordered flex items-center gap-4">
				<input type="number" class="grow" bind:value={timeDuration} />
			</label>
		</div>
		<div class="p-4">
			Break Duration (minutes)
			<label class="input input-bordered flex items-center gap-4">
				<input type="number" class="grow" bind:value={breakDuration} />
			</label>
		</div>
		<div class="p-4">
			Auto Start Sessions
			<label class="input input-bordered flex items-center gap-4">
				<input type="number" class="grow" bind:value={autoStartSessions} />
			</label>
		</div>
	</div>
	<!-- fotter -->
	<div class="p-4 flex justify-end space-x-2">
		<button class="btn btn-primary" on:click={save}>Save</button>
	</div>
</main>
