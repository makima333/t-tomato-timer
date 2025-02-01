// src/lib/stores/taskStore.ts
import { writable } from 'svelte/store';
import { TaskDBClient } from '$lib/sqls/task';

function createTaskStore() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { subscribe, set, update } = writable<any[]>([]);

	return {
		subscribe,
		set,
		fetchTasks: async () => {
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			const tasks = await taskDBClient.readAll();
			// 「編集中かどうか」のフラグを各タスクに付与
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			tasks.forEach((task: any) => {
				task.edit = false;
			});
			set(tasks);
		},
		addTask: async (taskName: string) => {
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			const createResponse = await taskDBClient.create(taskName);
			const addedTask = {
				id: createResponse.id,
				name: createResponse.name,
				work_time: 25,
				break_time: 5,
				auto_start: 0,
				edit: false
			};
			update((tasks) => [addedTask, ...tasks]);
		},
		removeTask: async (taskId: number) => {
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			await taskDBClient.delete(taskId);
			update((tasks) => tasks.filter((task) => task.id !== taskId));
		},
		editingTask: async (taskId: number, fieldKey: string, editingValue: string) => {
			update((tasks) =>
				tasks.map((task) => {
					if (task.id === taskId) {
						task.edit = true;
						task[fieldKey] = editingValue;
					}
					return task;
				})
			);
		},
		cancelEditingTask: async (taskId: number) => {
			update((tasks) =>
				tasks.map((task) => {
					if (task.id === taskId) {
						task.edit = false;
					}
					return task;
				})
			);
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		updateTask: async (taskId: number, updates: { [key: string]: any }) => {
			const taskDBClient = await TaskDBClient.load('sqlite:mydatabase.db');
			await taskDBClient.update(taskId, updates);
			update((tasks) =>
				tasks.map((task) => {
					if (task.id === taskId) {
						// 変更後に編集フラグを下げる
						task.edit = false;
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

export const taskStore = createTaskStore();
