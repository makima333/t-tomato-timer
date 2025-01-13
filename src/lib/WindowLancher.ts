import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export async function setTaskWindowLancher() {
	const setTaskWindow = new WebviewWindow('setTask', {
		url: '/setTask',
		title: 'Set Task',
		height: 200,
		width: 500,
		decorations: false,
		transparent: true,
		resizable: false,
		shadow: false,
		center: true
	});
	setTaskWindow.once('tauri://created', async function () {
		await setTaskWindow.center();
	});
}
