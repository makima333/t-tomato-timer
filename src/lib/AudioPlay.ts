export class AudioPlayer {
	private audio: HTMLAudioElement;
	private playCount: number = 0;
	private repeatTimes: number;

	constructor(audioSrc: string, repeatTimes: number) {
		this.audio = new Audio();
		this.audio.src = audioSrc;
		this.repeatTimes = repeatTimes;

		this.audio.addEventListener('ended', () => {
			if (this.playCount < this.repeatTimes) {
				this.playAudio();
			} else {
				this.resetPlayCount();
			}
		});
	}

	playAudio() {
		if (this.playCount < this.repeatTimes) {
			this.audio.load();
			this.audio.play();
			this.playCount++;
		}
	}

	resetPlayCount() {
		this.playCount = 0;
	}
}
