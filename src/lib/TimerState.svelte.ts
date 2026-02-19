import { AudioPlayer } from './AudioPlay';

/** タイマーの状態を表す型 */
type TimerStatus = 'idle' | 'running' | 'paused';

/**
 * ポモドーロタイマーのロジックを管理する runes ベースのクラス。
 * `+page.svelte` から分離し、テスト・再利用を容易にする。
 */
export class TimerState {
	// --- 設定値（タスク切替時に外部からセットされる） ---
	workTime = $state<number>(25);
	breakTime = $state<number>(5);
	autoStartMax = $state<number>(0);

	// --- ランタイム状態 ---
	/** 残り時間（秒） */
	remaining = $state<number>(25 * 60);
	/** タイマーの状態 */
	status = $state<TimerStatus>('idle');
	/** true = 作業フェーズ、false = 休憩フェーズ */
	isWorkPhase = $state<boolean>(true);
	/** 自動スタート残りセッション数 */
	autoStartRemaining = $state<number>(0);

	// --- 導出値 ---
	/** タイマーが一時停止 or 停止中か */
	isPaused = $derived(this.status !== 'running');
	/** 表示用: 残り分 */
	displayMinutes = $derived(Math.floor(Math.max(0, this.remaining) / 60));
	/** 表示用: 残り秒（60未満の端数） */
	displaySeconds = $derived(Math.max(0, this.remaining) % 60);
	/** 残り1分未満かどうか */
	isUnderOneMinute = $derived(this.remaining >= 0 && this.remaining < 60);
	/** タイムラインのドット配列（分単位） */
	dots = $derived(
		Array.from(
			{
				length:
					this.status === 'idle'
						? this.remaining / 60
						: Math.floor(this.remaining / 60) + 1
			},
			(_, i) => i + 1
		)
	);

	// --- 内部 ---
	private intervalId: ReturnType<typeof setInterval> | undefined = undefined;
	private audioPlayer: AudioPlayer | null = null;
	private isSoundOn: () => boolean;
	private interval: number;

	constructor(opts: {
		audioPlayer: AudioPlayer;
		isSoundOn: () => boolean;
		interval?: number; 
	}) {
		this.audioPlayer = opts.audioPlayer;
		this.isSoundOn = opts.isSoundOn;
		this.interval = opts.interval ?? 1000;
	}

	/** タスク変更時に呼ぶ。タイマーは停止する。 */
	configure(workTime: number, breakTime: number, autoStart: number): void {
		this.workTime = workTime;
		this.breakTime = breakTime;
		this.autoStartMax = autoStart;
		this.stop();
	}

	/** タイマーを開始 or 再開する */
	start(): void {
		if (this.status === 'paused') {
			// paused → resume: 現在の remaining からそのまま再開
		} else if (this.status === 'idle') {
			// 最初のティックで即座に1減らす
			this.remaining -= 1;
		}

		this.clearInterval();
		this.intervalId = setInterval(() => this.tick(), this.interval);
		this.status = 'running';
	}

	/** 再生/一時停止をトグルする */
	toggle(): void {
		if (this.status === 'running') {
			this.pause();
		} else {
			this.start();
		}
	}

	/** 一時停止 */
	pause(): void {
		this.clearInterval();
		this.status = 'paused';
	}

	/** 停止してリセット */
	stop(): void {
		this.clearInterval();
		this.remaining = this.workTime * 60;
		this.status = 'idle';
		this.isWorkPhase = true;
		this.autoStartRemaining = this.autoStartMax;
	}

	/** クリーンアップ（$effect の return で呼ぶ） */
	destroy(): void {
		this.clearInterval();
	}

	// --- private ---

	private tick(): void {
		if (this.remaining <= -1) {
			this.onPhaseEnd();
			return;
		}
		this.remaining -= 1;
		if (this.remaining <= -1) {
			this.onPhaseEnd();
		}
	}

	private onPhaseEnd(): void {
		if (this.isSoundOn() && this.audioPlayer) {
			this.audioPlayer.playAudio();
		}

		this.clearInterval();
		this.status = 'idle';

		if (this.isWorkPhase) {
			// 作業 → 休憩
			this.isWorkPhase = false;
			this.remaining = this.breakTime * 60;
		} else {
			// 休憩 → 作業
			this.isWorkPhase = true;
			this.remaining = this.workTime * 60;
		}

		// 自動スタート処理
		if (this.autoStartRemaining > 0) {
			if (this.isWorkPhase) {
				// 作業フェーズに戻った → セッション消費
				this.autoStartRemaining--;
			}
			if (this.autoStartRemaining > 0) {
				this.start();
			} else {
				// 全セッション完了 → リセット
				this.autoStartRemaining = this.autoStartMax;
			}
		}
	}

	private clearInterval(): void {
		if (this.intervalId !== undefined) {
			clearInterval(this.intervalId);
			this.intervalId = undefined;
		}
	}
}
