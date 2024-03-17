const { ipcRenderer } = require('electron');

// Assuming filePath is the path to the file you want to load
const filePath = 'Html/space-craft.html';

ipcRenderer.send('ready-to-show', filePath);


ipcMain.on('ready-to-create-space', (filePath) => {

});
