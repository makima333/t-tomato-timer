<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import { TaskDBClient } from '$lib/sqls/task';
	import Save from '$icons/Save.svelte';
	import Delete from '$icons/Delete.svelte';

	let taskName = '';
	function createTaskStore() {
		const { subscribe, set, update } = writable<any>([]);

		return {
			set,
			subscribe,
			fetchTasks: async () => {
				const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
				const tasks = await taskDBClient.read();
				// add edit property to each task
				tasks.forEach((task: any) => {
					task.edit = false;
				});
				set(tasks);
			},
			addTask: async (taskName: string) => {
				const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
				const createResponse = await taskDBClient.create(taskName);
				update((tasks) => [createResponse, ...tasks]);
			},
			removeTask: async (taskId: number) => {
				const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
				const deleteResponse = await taskDBClient.delete(taskId);
				update((tasks) => tasks.filter((task: any) => task.id !== taskId));
			},
			editingTask: async (taskId: number, taskName: string) => {
				update((tasks) =>
					tasks.map((task: any) => {
						if (task.id === taskId) {
							task.edit = true;
							task.name = taskName;
						}
						return task;
					})
				);
			},
			cancelEditingTask: async (taskId: number) => {
				update((tasks) =>
					tasks.map((task: any) => {
						if (task.id === taskId) {
							task.edit = false;
						}
						return task;
					})
				);
			},
			updateTask: async (taskId: number, taskName: string) => {
				const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
				const updateResponse = await taskDBClient.update(taskId, taskName);
				update((tasks) =>
					tasks.map((task: any) => {
						if (task.id === taskId) {
							task.edit = false;
							task.name = taskName;
						}
						return task;
					})
				);
			},
			clearTasks: async () => {
				set([]);
			}
		};
	}

	const taskStore = createTaskStore();

	onMount(async () => {
		console.log('settings page');
		await taskStore.fetchTasks();
		console.log($taskStore);
	});

	async function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && event.isComposing === false) {
			// Fire your event here
			console.log('Enter key pressed');
			await taskStore.addTask(taskName);
		}
	}

	async function handleInputChange(taskId: number, event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.value.length > 0) {
			if (target.value !== $taskStore.find((task: any) => task.id === taskId).name) {
				// enable save button
				await taskStore.editingTask(taskId, target.value);
			} else {
				// disable save button
				await taskStore.cancelEditingTask(taskId);
			}
		}
	}

	async function handleSave(taskId: number, taskName: string) {
		console.log(taskName);
		await taskStore.updateTask(taskId, taskName);
	}

	async function handleDelete(taskId: number) {
		await taskStore.removeTask(taskId);
	}
</script>

<main>
	<!-- header -->
	<div class="p-4">
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
	<div class="overflow-x-auto h-80 ml-8">
		<table class="p-2 table">
			<thead>
				<tr>
					<th>Task Name</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each $taskStore as task}
					<tr>
						<td>
							<input
								type="text"
								value={task.name}
								on:input={(e) => handleInputChange(task.id, e)}
							/></td
						>
						<td>
							{#if task.edit}
								<button
									class="btn btn-ghost btn-sm"
									on:click={() => handleSave(task.id, task.name)}
								>
									<Save cls={''} />
								</button>
							{:else}
								<button class="btn btn-ghost btn-sm" disabled>
									<Save cls={''} />
								</button>
							{/if}
							<button on:click={() => handleDelete(task.id)} class="btn btn-ghost btn-sm">
								<Delete cls={''} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<!-- fotter -->
</main>
