import Database  from '@tauri-apps/plugin-sql';

export class SqlBase {
    protected db: Database;

    protected constructor(db: Database) {
        this.db = db;
    }
    
    static async load(path: string): Promise<SqlBase> {
        const db = await Database.load(path);
        return new SqlBase(db);
    }

    async execute(query: string, params: any[] = []): Promise<any> {
        try {
            const result = await this.db.execute(query, params);
            return result;
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        } finally {
            this.db.close();
        }
    }

    async select(query: string, params: any[] = []): Promise<any> {
        try {
            const result = await this.db.select(query, params);
            return result;
        } catch (error) {
            console.error('Error querying database:', error);
            throw error;
        } finally {
            this.db.close();
        }
    }
}