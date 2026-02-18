/** DB の task テーブルに対応する型 */
export interface Task {
	id: number;
	name: string;
	work_time: number;
	break_time: number;
	auto_start: number;
	created_at?: string;
	updated_at?: string;
	deleted?: number;
}

/** UI 上の編集状態を含むタスク */
export interface TaskWithEdit extends Task {
	edit: boolean;
	label: string;
}

/** アプリ設定（config.json に永続化） */
export interface Settings {
	taskId: number;
	alertSound: boolean;
	alwaysOnTop: boolean;
}
