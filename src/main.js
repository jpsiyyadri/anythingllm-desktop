const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require("child_process");


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = () => {
  // fetch the height and width of the screen
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const collectorChild = fork("./anything-llm/collector/index.js");

  collectorChild.on('message', (message) => {
    console.log('Message from collectorChild:', message);
  });

  collectorChild.on('error', (error) => {
    console.error('Error in collectorChild:', error);
  });

  collectorChild.on('exit', (code, signal) => {
    console.log(`Collector child process exited with code ${code} and signal ${signal}`);
  });

  const serverChild = fork("./anything-llm/server/index.js");

  serverChild.on('message', (message) => {
    console.log('Message from serverChild:', message);
    // if (message === 'server_ready') {
      // }
    });
    
    serverChild.on('error', (error) => {
      console.error('Error in serverChild:', error);
    });
    
    serverChild.on('exit', (code, signal) => {
      console.log(`Server child process exited with code ${code} and signal ${signal}`);
    });
    
    mainWindow.on('closed', () => {
      serverChild.kill();
      collectorChild.kill();
    });
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });
  };




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
