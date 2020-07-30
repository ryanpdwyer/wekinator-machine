let client, address;

Nucleus.track("useAudioModel");


const stashDefaults = {
    oscAddress: "/wek/inputs",
    oscPort: 6448,
    tmUrl: "https://teachablemachine.withgoogle.com/models/4r858bxP0/"
};
const pageStashName = 'useAudioModel';

let initialStash = stash.get(pageStashName) || stashDefaults;
let myStash = initialStash;

initPage(myStash);

function initPage(state) {
    document.getElementById("osc-port").value = state.oscPort;
    document.getElementById("osc-address").value = state.oscAddress;
    document.getElementById('tm-url').value = state.tmUrl;
}

document.getElementById("restore-defaults").addEventListener('click', () => initPage(stashDefaults));

function startOSCClient(event) {
    if (client) {
        client.close();
    }
    const port = parseInt(document.getElementById("osc-port").value);
    address = document.getElementById("osc-address").value;
    myStash.oscAddress = address;
    myStash.oscPort = port;
    stash.set(pageStashName, myStash);
    client = new window.Client('127.0.0.1', port);
    document.getElementById("tm-button").removeAttribute("disabled");
}

document.getElementById("osc-button").addEventListener('click', startOSCClient);


    async function createModel(url) {
        const checkpointURL = url + "model.json"; // model topology
        const metadataURL = url + "metadata.json"; // model metadata

        const recognizer = speechCommands.create(
            "BROWSER_FFT", // fourier transform type, not useful to change
            undefined, // speech commands vocabulary feature, not useful for your models
            checkpointURL,
            metadataURL);

        // check that model and metadata are loaded via HTTPS requests.
        await recognizer.ensureModelLoaded();

        return recognizer;
    }

    async function init() {
        let url = document.getElementById("tm-url").value;
        if (!url.endsWith("/")){
            url = url+"/";
        }
        myStash.tmUrl = URL;
        stash.set(pageStashName, myStash);

        const recognizer = await createModel(url);
        const classLabels = recognizer.wordLabels(); // get class labels
        const labelContainer = document.getElementById("label-container");
        for (let i = 0; i < classLabels.length; i++) {
            labelContainer.appendChild(document.createElement("div"));
        }

        // listen() takes two arguments:
        // 1. A callback function that is invoked anytime a word is recognized.
        // 2. A configuration object with adjustable fields
        recognizer.listen(result => {
            const scores = result.scores; // probability of prediction for each class
            
            const iMax = argMax(scores);
            if (client) {
                client.send(address, iMax+1);
            }

            // render the probability scores per class
            for (let i = 0; i < classLabels.length; i++) {
                const classPrediction = classLabels[i] + ": " + result.scores[i].toFixed(2);
                labelContainer.childNodes[i].innerHTML = classPrediction;
                if (iMax === i) {
                    labelContainer.childNodes[i].classList.add("chosen-class");
                } else {
                    labelContainer.childNodes[i].classList.remove("chosen-class");
                }
            }
        }, {
            includeSpectrogram: true, // in case listen should return result.spectrogram
            probabilityThreshold: 0.75,
            invokeCallbackOnNoiseAndUnknown: true,
            overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
        });

        // Stop the recognition in 5 seconds.
        // setTimeout(() => recognizer.stopListening(), 5000);
    }