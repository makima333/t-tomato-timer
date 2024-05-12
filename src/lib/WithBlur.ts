export function WithBlur(handler: (event?: MouseEvent) => void) {
	return function (event: MouseEvent): void {
		// カスタム処理
		if (handler) {
			handler(event);
		}
		// HTMLButtonElement等の具体的な要素型にキャストが必要
		(event.currentTarget as HTMLElement).blur();
	};
}
