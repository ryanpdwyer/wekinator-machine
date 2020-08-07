const { Client } = require('node-osc-wek');
const { ipcRenderer } = require('electron');

const Nucleus = require('nucleus-nodejs');

Nucleus.init('5f2224c4d0fd75181c446024', {
  	disableInDev: true, 
  });



window.Client = Client;
window.openExternal = require('electron').shell.openExternal;
window.Nucleus = Nucleus;
window.prompt = require('electron-prompt');
window.invoke = ipcRenderer.invoke;

// See https://github.com/electron-userland/devtron
if (process.env.NODE_ENV === 'development') {
	window.require = require;
	window.process = process;
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  Nucleus.appStarted();
});