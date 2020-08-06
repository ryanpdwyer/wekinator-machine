


// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, client, address, startTime;


let pose;
// TO DO
// Features: Add saving feature, named presets?
// Split Position / Score inputs into two arrays since I have to filter them anyway

Nucleus.track("useHand");

const makeLabels = id => `
<label for="${id}">${camelCaseToTitleCase(id)}</label>
<input type="checkbox" id="${id}" name="${id}"/>`;

const parts =  ["thumb", "indexFinger", "middleFinger", "ringFinger", "pinky", "palmBase"];

const header = `<span>Hand Part</span><span>Position</span>\n`;

$("#osc-hand-grid").html(header+parts.map(makeLabels).join("\n"));

const zCheckbox = getId("zCheckbox");

const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448,
    checked: ["thumb", "indexFinger", "middleFinger", "ringFinger", "pinky", "palmBase"],
    z: false
};

const defaultSavedStashes = {
    '2D': {
        oscAddress: "/wek/inputs",
        oscPort: 6448,
        checked: ["thumb", "indexFinger", "middleFinger", "ringFinger", "pinky", "palmBase"],
        z: false
    },
    '3D': {
        oscAddress: "/wek/inputs",
        oscPort: 6448,
        checked: ["thumb", "indexFinger", "middleFinger", "ringFinger", "pinky", "palmBase"],
        z: true
    },
};

const pageStashName = 'useHand';
const pageSettingsStash = 'useHandSettings';

const initialStash = stash.get(pageStashName) || stashDefaults;
const initialSettingsStash = Object.assign(defaultSavedStashes, stash.get(pageSettingsStash));
let myStash = initialStash; // This stash is updated as the form is updated...
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
    state.checked.map(getId).map(check);
    zCheckbox.checked = state.z;
}

function saveSettingsHandler(event) {
    const formInputs = $("#osc-form").serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    const inputParams = formInputs.filter(x=>!isOscParam(x)&&(!x.name.includes("zCheckbox"))).map(x => x.name);

    prompt({title: "Save Settings", label: "Enter a name for these settings:"})
        .then(settingsName => {
            const settings = {};
            settings.oscPort = parseInt(oscParams['osc-port']);
            settings.oscAddress = oscParams['osc-address'];
            settings.checked = inputParams; // Update the checked boxes...
            settings.z = zCheckbox.checked;
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


function handleOSCForm(event) {
    event.preventDefault();
    const formInputs = $(event.target).serializeArray();
    const isOscParam = (x) => x.name.includes('osc');
    const oscParams = Object.fromEntries(
                formInputs.filter(isOscParam).map(x=>[x.name, x.value]));
    const inputParams = formInputs.filter(x=>!isOscParam(x)&&(!x.name.includes("zCheckbox"))).map(x => x.name);
    myStash.oscPort = parseInt(oscParams['osc-port']);
    myStash.oscAddress = oscParams['osc-address'];
    myStash.checked = inputParams; // Update the checked boxes...
    myStash.z = zCheckbox.checked; 
    stash.set(pageStashName, myStash); // Always update the stash!
    startOSCClient(oscParams, myStash, inputParams);
    const trackingPtsHandParts = {"thumb": 4, "indexFinger": 4, "middleFinger": 4, "ringFinger": 4, "pinky": 4, "palmBase": 1};
    const trackingPts = client.params.map(x => trackingPtsHandParts[x]).reduce((x,y)=>x+y, 0);
    if (client.z) {
        getId("sending-info").innerText = `Sending ${trackingPts*3} values to ${myStash.oscAddress} port ${myStash.oscPort}`;
    } else {
        getId("sending-info").innerText = `Sending ${trackingPts*2} values to ${myStash.oscAddress} port ${myStash.oscPort}`;
    }
}



function startOSCClient(oscParams, myStash, inputParams) {
    if (client) {
        client.close();
    }
    address = oscParams['osc-address'];
    client = new window.Client('127.0.0.1', myStash.oscPort);
    client.address = myStash.oscAddress;
    client.params = inputParams;
    client.z = myStash.z;
}


$("#osc-form").submit(handleOSCForm);

function sendMessage(client, pose) {

    const p = pose[0];
    const pose3D = client.params.map(x => p.annotations[x]);
    const pose2D = client.params.map(x => p.annotations[x].map(y=> y.slice(0, 2)));

    const poseMessage = client.z ? pose3D : pose2D;
    const message = poseMessage.flat(2);
    client.send(client.address, ...message);
}

// document.getElementById("osc-button").addEventListener('click', startOSCClient);

const poseContainer = document.getElementById("pose-container");

async function init() {
    // load the handtrack model
    model = await handpose.load()

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
}

/*

{
  handInViewConfidence: 0.9982486963272095,
  boundingBox: {
    topLeft: [ -40.86578481641354, -45.855087459100616 ],
    bottomRight: [ 415.84361513649935, 410.8543124938123 ]
  },
  landmarks: [
    [ 116.31553549423903, 348.57575795477874, -0.0012399330735206604 ],
    [ 169.48054239201076, 324.73665850642567, -7.55828332901001 ],
    [ 212.19064264494637, 282.43373449142103, -9.106935501098633 ],
    [ 243.504855661992, 244.16061420285007, -11.08784008026123 ],
    [ 276.9536515696301, 215.87363572444843, -13.02750015258789 ],
    [ 195.26606117888548, 208.80493726739138, 5.895618915557861 ],
    [ 213.20050810963778, 155.57775891631894, 7.997002601623535 ],
    [ 223.5353753735955, 121.1306334677281, 7.614046096801758 ],
    [ 232.01926159341957, 93.34729361181684, 6.653426170349121 ],
    [ 164.14838023447135, 199.93452639825523, 6.613336563110352 ],
    [ 181.5900738971143, 141.69629103412285, 10.246725082397461 ],
    [ 190.78877850810537, 102.46126303526512, 9.139193534851074 ],
    [ 198.61455020705782, 71.78218222574058, 8.162954330444336 ],
    [ 133.05668505428972, 200.6424413446508, 5.366909980773926 ],
    [ 144.115379508162, 147.8023393029993, 8.254778861999512 ],
    [ 150.42751812139593, 111.28772665658576, 7.86765193939209 ],
    [ 156.29326404411862, 81.95786886037621, 7.28717565536499 ],
    [ 100.6561081903356, 209.5266417632387, 2.572050094604492 ],
    [ 99.84108636935429, 166.6497286327903, 3.9576404094696045 ],
    [ 98.02417875045575, 138.12308873483687, 4.151775360107422 ],
    [ 98.30147870304567, 111.16399129779911, 4.44749116897583 ]
  ],
  annotations: {
    thumb: [
      [ 169.48054239201076, 324.73665850642567, -7.55828332901001 ],
      [ 212.19064264494637, 282.43373449142103, -9.106935501098633 ],
      [ 243.504855661992, 244.16061420285007, -11.08784008026123 ],
      [ 276.9536515696301, 215.87363572444843, -13.02750015258789 ]
    ],
    indexFinger: [
      [ 195.26606117888548, 208.80493726739138, 5.895618915557861 ],
      [ 213.20050810963778, 155.57775891631894, 7.997002601623535 ],
      [ 223.5353753735955, 121.1306334677281, 7.614046096801758 ],
      [ 232.01926159341957, 93.34729361181684, 6.653426170349121 ]
    ],
    middleFinger: [
      [ 164.14838023447135, 199.93452639825523, 6.613336563110352 ],
      [ 181.5900738971143, 141.69629103412285, 10.246725082397461 ],
      [ 190.78877850810537, 102.46126303526512, 9.139193534851074 ],
      [ 198.61455020705782, 71.78218222574058, 8.162954330444336 ]
    ],
    ringFinger: [
      [ 133.05668505428972, 200.6424413446508, 5.366909980773926 ],
      [ 144.115379508162, 147.8023393029993, 8.254778861999512 ],
      [ 150.42751812139593, 111.28772665658576, 7.86765193939209 ],
      [ 156.29326404411862, 81.95786886037621, 7.28717565536499 ]
    ],
    pinky: [
      [ 100.6561081903356, 209.5266417632387, 2.572050094604492 ],
      [ 99.84108636935429, 166.6497286327903, 3.9576404094696045 ],
      [ 98.02417875045575, 138.12308873483687, 4.151775360107422 ],
      [ 98.30147870304567, 111.16399129779911, 4.44749116897583 ]
    ],
    palmBase: [
      [
        116.31553549423903,
        348.57575795477874,
        -0.0012399330735206604
      ]
    ]
  }
}

*/

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    const elapsed = timestamp - startTime;
    ctx.drawImage(webcam.canvas, 0, 0);
    pose = await model.estimateHands(canvas);


    // Lots of stuff in here:

    
    if (client && pose && Array.isArray(pose) && pose.length > 0) {
        sendMessage(client, pose);
        drawKeypoints(ctx, pose[0].landmarks, pose[0].annotations);
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

// async function estimatePose() {
//     // Prediction #1: run input through posenet


//     if (pose) {

//     poseContainer.innerHTML = "";

//     const html = pose.keypoints.forEach(x => {
//         const p = document.createElement('p');
//         p.innerText = row(x);
//         poseContainer.appendChild(p);
//     });

//     }

//     drawPose(pose);

//     return pose;
// }

const fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
  };  // for rendering each finger as a polyline

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
  