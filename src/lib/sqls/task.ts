import { SqlBase } from './base';
import Database from '@tauri-apps/plugin-sql';

export class TaskDBClient extends SqlBase {
	private static TABLE_NAME = 'task';

	private constructor(db: Database) {
		super(db);
	}

	static async load(path: string): Promise<TaskDBClient> {
		const db = await Database.load(path);
		return new TaskDBClient(db);
	}

	async create(taskName: string): Promise<{ id: number; name: string }> {
		const { lastInsertId } = await this.db.execute(
			`INSERT INTO ${TaskDBClient.TABLE_NAME} (name) VALUES ($1)`,
			[taskName]
		);

		return { id: lastInsertId, name: taskName };
	}

	async readAll(): Promise<any> {
		// 論理削除されていないタスクのみ取得
		return this.db.select(`SELECT * FROM ${TaskDBClient.TABLE_NAME} WHERE deleted = 0`);
	}

	async read(taskId: number): Promise<any> {
		// 論理削除されていないタスクのみ取得
		return this.db.select(
			`SELECT * FROM ${TaskDBClient.TABLE_NAME} WHERE id = $1 AND deleted = 0`,
			[taskId]
		);
	}

	async update(taskId: number, updates: { [key: string]: any }): Promise<any> {
		const fields = Object.keys(updates)
			.map((field, index) => `${field} = $${index + 1}`)
			.join(', ');
		const values = Object.values(updates);
		return this.db.execute(
			`UPDATE ${TaskDBClient.TABLE_NAME} SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1}`,
			[...values, taskId]
		);
	}

	async delete(taskId: number): Promise<any> {
		// 論理削除（`deleted` フラグを 1 に設定）
		return this.db.execute(
			`UPDATE ${TaskDBClient.TABLE_NAME} SET deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
			[taskId]
		);
	}

	async restore(taskId: number): Promise<any> {
		// 論理削除の復元（`deleted` フラグを 0 に設定）
		return this.db.execute(
			`UPDATE ${TaskDBClient.TABLE_NAME} SET deleted = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
			[taskId]
		);
	}
}
