
// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, client, address, startTime;


let pose, handDetector;


Nucleus.track("useHandBox");

const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448
};


const pageStashName = 'useHandBox';

const initialStash = stash.get(pageStashName) || stashDefaults;
let myStash = initialStash; // This stash is updated as the form is updated...
initPage(myStash);


function getId(string) {
    return document.getElementById(string);
}

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
}

function handleOSCForm(event) {
    event.preventDefault();
    const formInputs = $(event.target).serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    myStash.oscPort = parseInt(oscParams['osc-port']);
    myStash.oscAddress = oscParams['osc-address'];
    stash.set(pageStashName, myStash); // Always update the stash!
    startOSCClient(oscParams, myStash);

     getId("sending-info").innerText = `Sending 4 values to ${myStash.oscAddress} port ${myStash.oscPort}`;
}



function startOSCClient(oscParams, myStash, inputParams) {
    if (client) {
        client.close();
    }
    address = oscParams['osc-address'];
    client = new window.Client('127.0.0.1', myStash.oscPort);
    client.address = myStash.oscAddress;
}


$("#osc-form").submit(handleOSCForm);

function sendMessage(client, pose) {
    const message = [0, 0, 0, 0, 0];
    client.send(client.address, pose.startPoint[0], pose.startPoint[1],
        pose.endPoint[0], pose.endPoint[1]);
}

const poseContainer = document.getElementById("pose-container");

async function init() {
    // load the handtrack model
    model = await handpose.load()
    handDetector = model.pipeline.boundingBoxDetector;

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new nPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    startTime = performance.now();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    ctx.strokeStyle =  "#27C42F";
}



async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    const elapsed = timestamp - startTime;
    ctx.drawImage(webcam.canvas, 0, 0);
    const image = tfCore.tidy(() => tfCore.browser.fromPixels(webcam.canvas).toFloat().expandDims(0));
    
    try {
        pose = await handDetector.estimateHandBounds(image);
    } finally {
        image.dispose();
    }

    

    if (pose) {
        ctx.strokeRect(pose.startPoint[0], pose.startPoint[1],
            pose.endPoint[0] - pose.startPoint[0],
            pose.endPoint[1] - pose.startPoint[1]);
        if (client) {
            sendMessage(client, pose);
        }
    }


    // splat out the message using inputParams
    if (elapsed < 1800000) {
        window.requestAnimationFrame(loop);
    } else {
        // Simple cleanup
        webcam.stop();
    }
}


function drawPoint(ctx, y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
  
function drawKeypoints(ctx, keypoints) {
    const keypointsArray = keypoints;
  
    for (let i = 0; i < keypointsArray.length; i++) {
      const y = keypointsArray[i][0];
      const x = keypointsArray[i][1];
      drawPoint(ctx, x - 2, y - 2, 3);
    }
  
const fingers = Object.keys(fingerLookupIndices);
for (let i = 0; i < fingers.length; i++) {
    const finger = fingers[i];
    const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
    drawPath(ctx, points, false);
}
}

function drawPath(ctx, points, closePath) {
const region = new Path2D();
region.moveTo(points[0][0], points[0][1]);
for (let i = 1; i < points.length; i++) {
    const point = points[i];
    region.lineTo(point[0], point[1]);
}

if (closePath) {
    region.closePath();
}
ctx.stroke(region);
}
