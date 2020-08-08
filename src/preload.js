const { Client } = require('node-osc-wek');
const { ipcRenderer } = require('electron');

const Nucleus = require('nucleus-nodejs');

const handpose = require('@tensorflow-models/handpose');

const nPose = require("@teachablemachine/pose");

const tf = require('@tensorflow/tfjs');

const facemesh = require('@tensorflow-models/facemesh');

Nucleus.init('5f2224c4d0fd75181c446024', {
  	disableInDev: true, 
  });

tf.setBackend('webgl');



window.Client = Client;
window.openExternal = require('electron').shell.openExternal;
window.Nucleus = Nucleus;
window.prompt = require('electron-prompt');

window.handpose = handpose;
window.nPose = nPose;
window.tfCore = tf;
window.tf = tf;
window.facemesh = facemesh;
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