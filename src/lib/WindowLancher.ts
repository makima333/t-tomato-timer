import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { currentMonitor } from '@tauri-apps/api/window';
import { PhysicalPosition } from '@tauri-apps/api/dpi';

export async function setTaskWindowLancher() {
  // Get the current monitor where the main window is located
  const monitor = await currentMonitor();
  const mainWindow = await WebviewWindow.getByLabel("tttimer");
  if (mainWindow === null) {
      console.warn('Main window not found, closing setTask window');
      return;
  }
  const { x: innerX, y: innerY } = await mainWindow.innerPosition();
  // Calculate the position of the setTask window based on the main window's position
  if (monitor === null) {
      console.warn('Monitor not found, closing setTask window');
      return;
  }
  const { width: monitorWidth, height: monitorHeight } = monitor.size;
  const setTaskHeightBuffer = 250;
  // setTask window flg top or bottom of the main window
  let setTaskWindowTop = false;
  if (innerY + setTaskHeightBuffer > monitorHeight) {
      setTaskWindowTop = true;
  }

  const setTaskWindow = new WebviewWindow('setTask', {
    url: '/setTask?bottom=' + setTaskWindowTop.toString(),
    title: 'Set Task',
    height: 400,
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
      // set window position to bottom of main window
      if (setTaskWindowTop) {
        await setTaskWindow.setPosition(new PhysicalPosition(innerX, innerY - 395));
      } else {
        await setTaskWindow.setPosition(new PhysicalPosition(innerX, innerY + 50));
      }

    }
  });
}
