import { TaskDBClient } from '$lib/sqls/task';
import type { Task, TaskWithEdit } from './types';

const DB_PATH = 'sqlite:mydatabase.db';

class TaskState {
	tasks = $state<TaskWithEdit[]>([]);

	async fetchTasks(): Promise<void> {
		const taskDBClient = await TaskDBClient.load(DB_PATH);
		const rows: Task[] = await taskDBClient.readAll();
		const mapped: TaskWithEdit[] = rows.map((row) => ({
			...row,
			edit: false,
			label: row.name
		}));
		mapped.sort((a, b) => a.name.localeCompare(b.name));
		this.tasks = mapped;
	}

	async addTask(taskName: string): Promise<void> {
		const taskDBClient = await TaskDBClient.load(DB_PATH);
		const created = await taskDBClient.create(taskName);
		const newTask: TaskWithEdit = {
			id: created.id,
			name: created.name,
			work_time: 25,
			break_time: 5,
			auto_start: 0,
			edit: false,
			label: created.name
		};
		this.tasks = [newTask, ...this.tasks];
	}

	async removeTask(taskId: number): Promise<void> {
		const taskDBClient = await TaskDBClient.load(DB_PATH);
		await taskDBClient.delete(taskId);
		this.tasks = this.tasks.filter((t) => t.id !== taskId);
	}

	editingTask(taskId: number, fieldKey: string, editingValue: string): void {
		this.tasks = this.tasks.map((task) => {
			if (task.id === taskId) {
				return { ...task, edit: true, [fieldKey]: editingValue };
			}
			return task;
		});
	}

	cancelEditingTask(taskId: number): void {
		this.tasks = this.tasks.map((task) => {
			if (task.id === taskId) {
				return { ...task, edit: false };
			}
			return task;
		});
	}

	async updateTask(taskId: number, updates: Partial<Task>): Promise<void> {
		const taskDBClient = await TaskDBClient.load(DB_PATH);
		await taskDBClient.update(taskId, updates);
		this.tasks = this.tasks.map((task) => {
			if (task.id === taskId) {
				return { ...task, ...updates, edit: false };
			}
			return task;
		});
	}

	clearTasks(): void {
		this.tasks = [];
	}
}

export const taskStore = new TaskState();
