# To Do

- [ ] Add code to control Wekinator directly from the app
    - Most important would be Dynamic Time Warping, which is difficult to track otherwise since you need one hand to press down the "+" button. From the Processing DTW explorer, the key code to start recording (or running) is...
    ```java
    if (isRecording) {
     isRecordingNow = true;
     OscMessage msg = new OscMessage("/wekinator/control/startDtwRecording");
     msg.add(currentClass); // output_1, output_2, etc...
     oscP5.send(msg, dest);
    } else {
        OscMessage msg = new OscMessage("/wekinator/control/startRunning");
        oscP5.send(msg, dest);
    }
    ```
    and the key code to stop recording the example is 
    ```java
    if (isRecordingNow) {
     isRecordingNow = false;
     OscMessage msg = new OscMessage("/wekinator/control/stopDtwRecording");
      oscP5.send(msg, dest);
    }
    ```
    - The easiest way do to this would be an empty `<div id="wekinator-control"></div> populated by javascript from `util.js`.
- [ ] Add music output option using [MusicVAE](https://magenta.tensorflow.org/music-vae)



## Not priority
- [ ] For better performance, switch to using the [tensorflow backend for tensorflow.js](https://github.com/tensorflow/tfjs/tree/master/tfjs-node)
    - I tried this, it made the application size 3x larger (~180 MB to over 600 MB on mac). It was also roughly a factor of two slower on my MBP16, probably because it uses the CPU, blocking the main execution thread? It may give a speed up if re-written to use a Web Worker thread? (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). 