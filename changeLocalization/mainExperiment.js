// mainExperiment.js

let trialEnded = false;
let currentTrial = null;
let mainCanvas = document.getElementById('canvas');
let mainCtx = mainCanvas.getContext('2d');
let isShowingOriginalArray = true; // Flag to determine if the original or changed array is shown
let correctResponses = 0;
let incorrectResponses = 0;
let logCounter = 0;
let blockNumber = 0;
let numBlocks = 2;
let subjectId = 'test'
let trialData = [];
let expStartTime;
let expEndTime;
let expDuration = [];
let clickedCorrectly;
let iTrial = 0;
let trials;
let changedSquare;
let trialResult

let fixationLength = 500; // 500 ms fixation
let SHOW_DURATION = 250; // Time in milliseconds to display the original array
let HIDE_DURATION = 1000;  // Time in milliseconds to hide the array before showing the changed one
let CHANGE_DURATION = 1000;
let localStart;
let localEnd;


// Start the experiment when the button is clicked
document.getElementById("startExperimentButton").addEventListener("click", function() {
    document.getElementById("startExperimentButton").style.display = "none"; // Hide start button
    document.querySelector('.canvas-container').style.display = "flex"; // Show the canvas
    
    initializeExperimentData();
    startBlock(); // Begin the experiment
    
});

function startBlock() {
    trials = createTrials(5); // Generate 10 trials
    iTrial = 0;
    blockNumber++

    function runNextTrial() {
        if (iTrial < trials.length) {
            currentTrial = trials[iTrial];
            iTrial++;
            showInterTrialInterval(); // Show the fixation cross during the intertrial interval
        } else if (blockNumber <= numBlocks - 1) {
            startBlock(); // Start a new block
        } else {
            expEndTime = Date.now()
            expDuration.push(expEndTime - expStartTime)
            console.log("Experiment completed");
            console.log(`Correct Responses: ${correctResponses}`);
            console.log(`Incorrect Responses: ${incorrectResponses}`);
            console.table(data)
        }
    }

    runNextTrial(); // Start the first trial

    // Intertrial interval where only the fixation cross is shown
    function showInterTrialInterval() {
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); // Clear the canvas
        drawFixationCross(); // Draw the fixation cross

        // Wait for 500 ms before showing the original array
        setTimeout(showOriginalArray, fixationLength);
    }

    // Show the original array
    function showOriginalArray() {
        isShowingOriginalArray = true;
        renderStimuli();

        setTimeout(() => {
            mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); // Hide the array
            setTimeout(showChangedArray, HIDE_DURATION); // Show the changed array after the hide duration
        }, SHOW_DURATION);
    }

    // Show the changed array
    function showChangedArray() {
        isShowingOriginalArray = false;
        replaceColorInChangedStimulus(); // Replace the color for the changed stimulus
        renderStimuli(); // Render the changed stimuli with the new color
        trialEnded = false; // Reset trial state
        trialStartTime = Date.now();
        localStart = getCurrentTime();
    
        // Allow clicks after the changed array is displayed
        mainCanvas.addEventListener('click', handleClick);
    }

    // Replace the color of the stimulus that changes, ensuring it doesn't repeat a color in the array
    function replaceColorInChangedStimulus() {
        // Get the colors already present in the original array
        const currentColors = currentTrial.stimuli.map(stim => stim.rgb);

        // Filter the available colors to exclude those already used in the array
        const availableColors = CONFIG.stimuli.POSSIBLE_COLORS.filter(color => !currentColors.includes(color));

        // Randomly pick a new color for the changed stimulus
        const newColorIndex = Math.floor(Math.random() * availableColors.length);
        const newColor = availableColors[newColorIndex];

        // Replace the color of the changed stimulus
        currentTrial.stimuli[currentTrial.changedStimulusIndex].rgb = newColor;
    }

    // Handle the click to advance the trial and determine if it's correct or not
    function handleClick(event) {
        if (!trialEnded) {
            const rect = mainCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
    
            clickedCorrectly = false; // Reset to false before each click
    
            // Check if the click is within the bounds of any stimulus
            for (let index = 0; index < currentTrial.stimuli.length; index++) {
                const stim = currentTrial.stimuli[index];
                if (isWithinBounds(x, y, stim.xpos, stim.ypos)) {
                    if (index === currentTrial.changedStimulusIndex) {
                        clickedCorrectly = true; // Correct if they clicked the changed stimulus
                    }
                    break;
                }
            }
    
            if (clickedCorrectly) {
                correctResponses++;
                console.log("Correct response!");
            } else {
                incorrectResponses++;
                console.log("Incorrect response!");
            }
            trialResult = clickedCorrectly ? 'Correct': 'Error'
    
            trialEnded = true; // Mark the trial as ended
            trialEndTime = Date.now();
            localEnd = getCurrentTime();
            responseTime = trialEndTime - trialStartTime;
            mainCanvas.removeEventListener('click', handleClick); // Remove click handler
            logTrialData(); // Log the trial data, including clickedCorrectly
            setTimeout(runNextTrial, CHANGE_DURATION); // Advance to the next trial after a short delay
        }
    }

    // Render stimuli on the canvas
function renderStimuli() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height); // Clear canvas

    // Draw the fixation cross in the center of the canvas
    drawFixationCross();

    currentTrial.stimuli.forEach((stim, index) => {
        let color = stim.rgb;

        // Change the color of one stimulus when the array is shown again (changed array)
        if (!isShowingOriginalArray && index === currentTrial.changedStimulusIndex) {
            color = stim.rgb; // The color has already been replaced by `replaceColorInChangedStimulus`
        }

        drawSquare(stim.xpos, stim.ypos, color);
    });
}
    
    // Function to draw a square
    function drawSquare(x, y, color) {
        mainCtx.fillStyle = color;
        mainCtx.fillRect(x - CONFIG.stimuli.SQUARE_SIZE / 2, y - CONFIG.stimuli.SQUARE_SIZE / 2, CONFIG.stimuli.SQUARE_SIZE, CONFIG.stimuli.SQUARE_SIZE);
    }
    
    // Function to draw the fixation cross in the center of the canvas
    function drawFixationCross() {
        const centerX = mainCanvas.width / 2;
        const centerY = mainCanvas.height / 2;
        const crossSize = 20; // Length of each line of the cross
    
        // Set the color for the fixation cross
        mainCtx.fillStyle = 'black';
    
        // Draw the vertical line
        mainCtx.fillRect(centerX - 2, centerY - crossSize / 2, 4, crossSize);
    
        // Draw the horizontal line
        mainCtx.fillRect(centerX - crossSize / 2, centerY - 2, crossSize, 4);
    }
    

    // Check if click is within stimulus bounds
    function isWithinBounds(x, y, stimX, stimY) {
        const halfSize = CONFIG.stimuli.SQUARE_SIZE / 2;
        return x >= stimX - halfSize && x <= stimX + halfSize &&
               y >= stimY - halfSize && y <= stimY + halfSize;
    }
}
