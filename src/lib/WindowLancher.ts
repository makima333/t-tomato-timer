import { WebviewWindow, LogicalSize } from '@tauri-apps/api/window';

export async function setTaskWindowLancher() {
	const setTaskWindow = new WebviewWindow('setTask', {
		url: '/setTask',
		title: 'Set Task',
		height: 500,
		width: 400,
		decorations: false,
		transparent: true,
		resizable: false,
		center: true
	});
	setTaskWindow.once('tauri://created', async function () {
		await setTaskWindow.center();
	});
}
