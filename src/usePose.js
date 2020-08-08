


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, client, address, startTime;

// TO DO
// Features: Add saving feature, named presets?
// Split Position / Score inputs into two arrays since I have to filter them anyway

Nucleus.track("usePose");

const makeLabels = id => `
<label for="${id}">${camelCaseToTitleCase(id)}</label>
<input type="checkbox" id="${id}" name="${id}"/>
<input type="checkbox" id="${id}-score" name="${id}-score"/>`;

const parts =  ["nose", "leftEye", "rightEye", "leftEar", "rightEar",
"leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist",
"rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle",
"rightAnkle"];

const header = `<span>Body Part</span><span>Position</span><span>Probability</span>\n`;

$("#osc-part-grid").html(header+parts.map(makeLabels).join("\n"));

const partsEls = parts.map(getId).concat(parts.map(x => getId(x+'-score')));

const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448,
    checked: ['nose', 'nose-score'],
};

const defaultSavedStashes = {
    'Nose': {
        oscAddress: "/wek/inputs",
        oscPort: 6448,
        checked: ['nose', 'nose-score'],
    },
    'Face': {
    oscAddress: "/wek/inputs",
    oscPort: 6448,
    checked: ['nose', 'nose-score', "leftEye", "rightEye", "leftEar", "rightEar",
    "leftEye-score", "rightEye-score", "leftEar-score", "rightEar-score"]
    },
    'Upper Body': {
        oscAddress: "/wek/inputs",
        oscPort: 6448,
        checked: ['nose', 'nose-score', "leftEye", "rightEye", "leftEar", "rightEar",
        "leftEye-score", "rightEye-score", "leftEar-score", "rightEar-score",
        "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist",
        "rightWrist", "leftShoulder-score", "rightShoulder-score", "leftElbow-score",
        "rightElbow-score", "leftWrist-score", "rightWrist-score"]
    },
};

const pageStashName = 'usePose';
const pageSettingsStash = 'usePoseSettings';

const initialStash = stash.get(pageStashName) || stashDefaults;
const initialSettingsStash = Object.assign(defaultSavedStashes, stash.get(pageSettingsStash));
let myStash = initialStash;
const mySettingsStash = initialSettingsStash;

initPage(myStash);
updateSavedSettings(mySettingsStash);

function updateSavedSettings(stash) {
    const el = getId("formSettings");
    const createOption = key => {
        const opt = document.createElement('option');
        opt.value=key;
        opt.innerText=key;
        return opt;
    };
    el.innerHTML = "";
    Object.keys(stash).map(createOption).forEach(x => {el.append(x)});
}

function check(element) {
    element.checked = true;
}

function uncheck(element) {
    element.checked = false;
}

function getId(string) {
    return document.getElementById(string);
}

function selectedStashHandler(event) {
    const id = event.target.value;
    myStash = mySettingsStash[id];
    initPage(myStash);
    getId("saveFormSettingsButton").disabled = true;
}

getId("formSettings").addEventListener('change', selectedStashHandler);

$("#osc-form").change(event => {
    getId('formSettings').selectedIndex = -1;
    getId("saveFormSettingsButton").disabled = false;
    });

getId("saveFormSettingsButton").addEventListener('click', saveSettingsHandler);

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
    partsEls.map(uncheck);
    state.checked.map(getId).map(check);
}

function saveSettingsHandler(event) {
    const formInputs = $("#osc-form").serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    const inputParams = formInputs.filter(x=>!isOscParam(x)).map(x => x.name);
    prompt({title: "Save Settings", label: "Enter a name for these settings:"})
        .then(settingsName => {
            const settings = {};
            settings.oscPort = parseInt(oscParams['osc-port']);
            settings.oscAddress = oscParams['osc-address'];
            settings.checked = inputParams; // Update the checked boxes...
            mySettingsStash[settingsName] = settings;
            stash.set(pageSettingsStash, mySettingsStash);
            updateSavedSettings(mySettingsStash);
            getId('formSettings').selectedIndex = getId("formSettings").querySelectorAll("option").length-1; // New settings are the last choice.
        })
        .catch();
    
    
}

function camelCaseToTitleCase(in_camelCaseString) {
        var result = in_camelCaseString                         // "ToGetYourGEDInTimeASongAboutThe26ABCsIsOfTheEssenceButAPersonalIDCardForUser456InRoom26AContainingABC26TimesIsNotAsEasyAs123ForC3POOrR2D2Or2R2D"
            .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")           // "To Get YourGEDIn TimeASong About The26ABCs IsOf The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times IsNot AsEasy As123ForC3POOrR2D2Or2R2D"
            .replace(/([A-Z][a-z])([A-Z])/g, "$1 $2")           // "To Get YourGEDIn TimeASong About The26ABCs Is Of The Essence ButAPersonalIDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([a-z])([A-Z]+[a-z])/g, "$1 $2")          // "To Get Your GEDIn Time ASong About The26ABCs Is Of The Essence But APersonal IDCard For User456In Room26AContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([A-Z]+)([A-Z][a-z][a-z])/g, "$1 $2")     // "To Get Your GEDIn Time A Song About The26ABCs Is Of The Essence But A Personal ID Card For User456In Room26A ContainingABC26Times Is Not As Easy As123ForC3POOr R2D2Or2R2D"
            .replace(/([a-z]+)([A-Z0-9]+)/g, "$1 $2")           // "To Get Your GEDIn Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3POOr R2D2Or 2R2D"
            
            // Note: the next regex includes a special case to exclude plurals of acronyms, e.g. "ABCs"
            .replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, "$1 $2") // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"
            .replace(/([0-9])([A-Z][a-z]+)/g, "$1 $2")          // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456In Room 26A Containing ABC 26Times Is Not As Easy As 123For C3PO Or R2D2Or 2R2D"  

            // Note: the next two regexes use {2,} instead of + to add space on phrases like Room26A and 26ABCs but not on phrases like R2D2 and C3PO"
            .replace(/([A-Z]{2,})([0-9]{2,})/g, "$1 $2")        // "To Get Your GED In Time A Song About The 26ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
            .replace(/([0-9]{2,})([A-Z]{2,})/g, "$1 $2")        // "To Get Your GED In Time A Song About The 26 ABCs Is Of The Essence But A Personal ID Card For User 456 In Room 26A Containing ABC 26 Times Is Not As Easy As 123 For C3PO Or R2D2 Or 2R2D"
            .trim();


  // capitalize the first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}


const testForm = '[{"name":"nose","value":"on"},{"name":"nose-score","value":"on"},{"name":"osc-address","value":"/wek/inputs"},{"name":"osc-port","value":"6448"}]';

function handleOSCForm(event) {
    event.preventDefault();
    const formInputs = $(event.target).serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    const inputParams = formInputs.filter(x=>!isOscParam(x)).map(x => x.name);
    myStash.oscPort = parseInt(oscParams['osc-port']);
    myStash.oscAddress = oscParams['osc-address'];
    myStash.checked = inputParams; // Update the checked boxes...
    stash.set(pageStashName, myStash); // Always update the stash!
    startOSCClient(oscParams, myStash, inputParams);
    const scores = client.params.filter(x => x.includes('score')).map(x => x.split('-')[0]);
    const positions = client.params.filter(x => !x.includes('score'));
    getId("sending-info").innerText = `Sending ${scores.length + positions.length*2} values to ${myStash.oscAddress} port ${myStash.oscPort}: ${scores.map(x=>x+'.prob').join(" ")} ${positions.map(x=>x+".x"+" "+x+".y").join(" ")}`;
}



function startOSCClient(oscParams, myStash, inputParams) {
    if (client) {
        client.close();
    }
    address = oscParams['osc-address'];
    client = new window.Client('127.0.0.1', myStash.oscPort);
    client.address = myStash.oscAddress;
    client.params = inputParams;
}


$("#osc-form").submit(handleOSCForm);

function sendMessage(client, pose) {
    const keypointsObj = Object.fromEntries(
        pose.keypoints.map(x => [x.part, {x: x.position.x, y: x.position.y, score: x.score}
            ]));

    // Array of items to pass scores
    const scores = client.params.filter(x => x.includes('score')).map(x => x.split('-')[0]);
    const positions = client.params.filter(x => !x.includes('score'));

    const scoresMessage = scores.map(x => keypointsObj[x].score);
    const positionsMessage = positions.map( x => [keypointsObj[x].x, keypointsObj[x].y]);
    const message = scoresMessage.concat(positionsMessage.flat());
    client.send(client.address, ...message);

    // const keypoints = pose.keypoints.filter(x => client.params.any(p => p.includes(x.part)));

    // const message = client.params.map(x => keypointsObj[x]);
}

// document.getElementById("osc-button").addEventListener('click', startOSCClient);

const poseContainer = document.getElementById("pose-container");

async function init() {
    URL = "https://teachablemachine.withgoogle.com/models/4r858bxP0/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    startTime = performance.now();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    const elapsed = timestamp - startTime;
    const pose = await estimatePose();
    if (client && pose) {
        sendMessage(client, pose);
    }
    // client.send(address, message);
    // splat out the message using inputParams
    if (elapsed < 180000) {
        window.requestAnimationFrame(loop);
    } else {
        // Simple cleanup
        webcam.stop();
    }
}

async function estimatePose() {
    // Prediction #1: run input through posenet
    const row = x => `${x.part} ${x.score.toFixed(3)}, pos (${x.position.x.toFixed(1)}, ${x.position.y.toFixed(1)})`;

    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

    // const template = {'<>':'','html':'${part} ${score.toFixed(2)}'};
// 

    if (pose) {

    poseContainer.innerHTML = "";

    const html = pose.keypoints.forEach(x => {
        const p = document.createElement('p');
        p.innerText = row(x);
        poseContainer.appendChild(p);
    });

    }

    drawPose(pose);

    return pose;
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}