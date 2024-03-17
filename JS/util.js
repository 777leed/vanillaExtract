const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
document.getElementById('close-app').addEventListener('click', () => {
  ipcRenderer.invoke('quit-app');
});
document.getElementById('minimize-app').addEventListener('click', () => {
ipcRenderer.send('minimize');
});



});