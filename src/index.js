const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

console.log(app.getName());

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


const preLoadFiles = {
  "index.html": "preload.js",
  "teachable-pose.html": "preload-tm-only.js",
  "teachable-image.html": "preload-tm-only.js",
  "teachable-audio.html": "preload-tm-only.js",
  "pose.html": "preload-tm-only.js",
  "face.html": "preload.js",
  "hand2.html": "preload.js",
  "hand-box.html": "preload.js",
  "music.html": "preload.js"
};

ipcMain.handle('new-window', async (event, arg) => {

    const callingWindow = BrowserWindow.getFocusedWindow();
    const windowBounds = callingWindow.getBounds();

  
  const mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowBounds.x,
    y: windowBounds.y,
    webPreferences: {
      preload: path.join(__dirname, preLoadFiles[arg])
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, arg));

  callingWindow.close();
})

ipcMain.handle('new-home-window', async (event) => {
  
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, preLoadFiles['index.html'])
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

})



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, preLoadFiles['index.html'])
    }
  });

  let menu = Menu.getApplicationMenu();

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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
