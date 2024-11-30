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

    async create(taskName: string): Promise<{id: number, name: string}> {
        const { lastInsertId } = await this.db.execute(
            `INSERT into ${TaskDBClient.TABLE_NAME} (name) VALUES ($1)`,
            [taskName]
        );

        return { id: lastInsertId, name: taskName };
    }

    async read(): Promise<any> {
        return this.db.select(`SELECT * FROM ${TaskDBClient.TABLE_NAME}`);
    }

    async update(taskId: number, taskName: string): Promise<any> {
        this.db.execute(
            `UPDATE ${TaskDBClient.TABLE_NAME} SET name = $1 WHERE id = $2`,
            [taskName, taskId]
        );
    }

    async delete(taskId: number): Promise<any> {
        this.db.execute(
            `UPDATE ${TaskDBClient.TABLE_NAME} SET deleted = true WHERE id = $1`,
            [taskId]
        );
    }
}