const {app, BrowserWindow,ipcMain} = require('electron')
const ElectronStore = require('electron-store');

ElectronStore.initRenderer();

ipcMain.handle('quit-app', () => {
    app.quit();
  });


app.whenReady().then(() => {
    const myWindow = new BrowserWindow(
        {
            fullscreen:true,
            
            webPreferences: {
                nodeIntegration : true,
                contextIsolation: false

            }
        }
    );
    myWindow.webContents.openDevTools();
    myWindow.setMenuBarVisibility(false);
    myWindow.loadFile('Html/initial.html');

    ipcMain.on('minimize', () => {
        myWindow.minimize()
      });


   

    
})

