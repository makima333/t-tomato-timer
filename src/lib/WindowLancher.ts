import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { currentMonitor } from '@tauri-apps/api/window';

export async function setTaskWindowLancher() {
  // Get the current monitor where the main window is located
  const monitor = await currentMonitor();
  
  const setTaskWindow = new WebviewWindow('setTask', {
    url: '/setTask',
    title: 'Set Task',
    height: 200,
    width: 500,
    decorations: false,
    transparent: true,
    resizable: false,
    shadow: false,
    // Don't set position here to allow centering on the current monitor
  });
  
  setTaskWindow.once('tauri://created', async function () {
		console.log(monitor)
    if (monitor) {
      // TODO: Get the monitor's size and position
      await setTaskWindow.center();
    }
  });
}
