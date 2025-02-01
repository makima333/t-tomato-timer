<script lang="ts">
	import { onMount } from 'svelte';

	import { taskStore } from '$lib/TaskStore';
	import Save from '$icons/Save.svelte';
	import Delete from '$icons/Delete.svelte';

	let taskName = '';

	onMount(async () => {
		await taskStore.fetchTasks();
	});

	async function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.isComposing === false && taskName.length > 0) {
			await taskStore.addTask(taskName);
			taskName = '';
		}
	}

	async function handleInputChange(taskId: number, fieldName: string, event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value.length > 0) {
			if (target.value !== $taskStore.find((task: any) => task.id === taskId)[fieldName]) {
				// enable save button
				await taskStore.editingTask(taskId, fieldName, target.value);
			} else {
				// disable save button
				await taskStore.cancelEditingTask(taskId);
			}
		}
	}

	async function handleSave(taskId: number) {
		const updatedTask = $taskStore.find((task: any) => task.id === taskId);
		const updates = {
			name: updatedTask.name,
			work_time: updatedTask.work_time,
			break_time: updatedTask.break_time,
			auto_start: updatedTask.auto_start
		};
		await taskStore.updateTask(taskId, updates);
	}

	async function handleDelete(taskId: number) {
		await taskStore.removeTask(taskId);
	}
</script>

<div>
	<!-- header -->
	<div class="p-2">
		<label class="input input-bordered flex items-center gap-2">
			<input
				type="text"
				class="grow"
				placeholder="Task name"
				on:keypress={handleKeyPress}
				bind:value={taskName}
			/>
			<button class="">+</button>
		</label>
	</div>
	<!-- table -->
	<div class="h-80 p-2 overflow-x-auto">
		<table class="table table-xs">
			<thead>
				<tr>
					<th class="w-1/3">Task Name</th>
					<th class="w-1/9">Work</th>
					<th class="w-1/9">Break</th>
					<th class="w-1/9">Times</th>
					<th class="w-2/9">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each $taskStore as task}
					<tr>
						<td>
							<input
								type="text"
								value={task.name}
								class="input w-full"
								on:input={(e) => handleInputChange(task.id, 'name', e)}
							/>
						</td>
						<td>
							<input
								type="number"
								value={task.work_time}
								class="input w-full"
								on:input={(e) => handleInputChange(task.id, 'work_time', e)}
							/>
						</td>
						<td>
							<input
								type="number"
								value={task.break_time}
								class="input w-full"
								on:input={(e) => handleInputChange(task.id, 'break_time', e)}
							/>
						</td>
						<td>
							<input
								type="number"
								value={task.auto_start}
								class="input w-full"
								on:input={(e) => handleInputChange(task.id, 'auto_start', e)}
							/>
						</td>
						<td>
							{#if task.edit}
								<button class="btn btn-ghost btn-xs" on:click={() => handleSave(task.id)}>
									<Save cls={''} />
								</button>
							{:else}
								<button class="btn btn-ghost btn-xs" disabled>
									<Save cls={''} />
								</button>
							{/if}
							<button on:click={() => handleDelete(task.id)} class="btn btn-ghost btn-xs">
								<Delete cls={''} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<!-- fotter -->
</div>
