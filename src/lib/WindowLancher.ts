import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { currentMonitor } from '@tauri-apps/api/window';
import { PhysicalPosition } from '@tauri-apps/api/dpi';

export async function setTaskWindowLancher() {
  console.log('Launching Set Task Window...');
  const setTaskWindow = new WebviewWindow('setTask', {
    url: '/setTask',
    title: 'Set Task',
    height: 200,
    width: 500,
    decorations: false
  });

  
  
  setTaskWindow.once('tauri://created', async function () {
    const monitor = await currentMonitor();
    console.log('Current monitor info:', monitor);
    if (monitor) {
      const { x: posx, y: posy } = monitor.position;
      const {width, height} = monitor.size;
      console.log('Monitor position:', posx===0, posy===0);
        // Position the window at the center of the monitor
        await setTaskWindow.setPosition(
          new PhysicalPosition(
            posx + (width - 500) / 2,
            posy + (height - 200) / 2
          )
        )
    } else {
      console.warn('No monitor information available');
      await setTaskWindow.center();
    }
  });
}
