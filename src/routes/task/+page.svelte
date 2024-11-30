<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import { TaskDBClient } from '$lib/sqls/task';

	let taskNmae = '';

	function createTaskStore() {
		const { subscribe, set, update } = writable<any>([]);
		
		return {
			subscribe,
			fetchTasks: async () => {
				const taskDBClient = await TaskDBClient.load("sqlite:mydatabase.db");
				const tasks = await taskDBClient.read();
				set(tasks);
			},
			addTask: async (taskName: string) => {
				const taskDBClient = await TaskDBClient.load("sqlite:mydatabase.db");
				const createResponse = await taskDBClient.create(taskName)
				update((tasks) => [...tasks, createResponse])
			},
			removeTask: async (taskId: number) => {
				const taskDBClient = await TaskDBClient.load("sqlite:mydatabase.db");
				const deleteResponse = await taskDBClient.delete(taskId)
				update((tasks) => tasks.filter((task: any) => task.id !== taskId))
			},
			updateTask: async (taskId: number, taskName: string) => {
				const taskDBClient = await TaskDBClient.load("sqlite:mydatabase.db");
				const updateResponse = await taskDBClient.update(taskId, taskName)
				update((tasks) => tasks.map((task: any) => {
					if (task.id === taskId) {
						return updateResponse;
					}
					return task;
				}))
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
			await taskStore.addTask(taskNmae);
		}
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
				bind:value={taskNmae}
			/>
			<button class="">+</button>
		</label>
	</div>
	<!-- table -->
	<div class="overflow-x-auto h-80 ml-8">
		<table class="p-4 table">
			<thead>
				<tr>
					<th>Task Name</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each $taskStore as task}
					<tr>
						<td>{task.name}</td>
						<td>
							<button class="btn btn-primary">Edit</button>
							<button class="btn btn-error">Delete</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<!-- fotter -->
</main>
