// experimentDesign.js

const CONFIG = {
    stimuli: {
        SQUARE_SIZE: 40, // Size of each square
        POSSIBLE_COLORS: [
            'rgb(255, 0, 0)',   // Red
            'rgb(0, 255, 0)',   // Green
            'rgb(0, 0, 255)',   // Blue
            'rgb(255, 0, 255)', // Magenta
            'rgb(255, 255, 0)', // Yellow
            'rgb(0, 255, 255)', // Cyan
            'rgb(255, 128, 0)', // Orange
            'rgb(255, 255, 255)',// White
            'rgb(0, 0, 0)'      // Black
        ],
    }
   
};

// Define six fixed locations in a circular pattern around the center of the canvas
(function generateFixedLocations() {
    const canvas = document.getElementById('canvas');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100; // Smaller radius to fit within the smaller canvas

    CONFIG.stimuli.POSSIBLE_LOCATIONS = []; // Reset possible locations

    for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6; // Divide the circle into six equal parts
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        CONFIG.stimuli.POSSIBLE_LOCATIONS.push({ x, y });
    }
})();

// Generate trials with fixed locations and unique colors
function createTrials(numTrials) {
    const trials = [];

    for (let i = 0; i < numTrials; i++) {
        const stimuli = [];
        const availableColors = [...CONFIG.stimuli.POSSIBLE_COLORS]; // Clone the color array to use without repetitions

        // Assign stimuli to the six predefined locations and distinct colors
        for (let j = 0; j < 6; j++) {
            const colorIndex = Math.floor(Math.random() * availableColors.length);
            const color = availableColors.splice(colorIndex, 1)[0]; // Pick and remove the color

            stimuli.push({
                xpos: CONFIG.stimuli.POSSIBLE_LOCATIONS[j].x,
                ypos: CONFIG.stimuli.POSSIBLE_LOCATIONS[j].y,
                rgb: color // Assign a unique color
            });
        }

        // Randomly pick one stimulus to change its color for the second array
        const changedStimulusIndex = Math.floor(Math.random() * stimuli.length);

        trials.push({
            stimuli: stimuli,
            changedStimulusIndex: changedStimulusIndex // This index will determine which stimulus changes color
        });
    }

    return trials;
}

function initializeExperimentData() {
    expStartTime = Date.now()
    data =  {
        subjectId: subjectId,
        numBlocks: numBlocks,
        trialData: trialData, // To store data for all trials
        startTime: expStartTime, // When the experiment starts
        expDuration: expDuration
    };
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

function logTrialData() {
    logCounter++;
    trialData.push({
        logCounter: logCounter,
        trialNumber: iTrial,
        blockNumber: blockNumber,
        trialStartTime: localStart, 
        trialEndTime: localEnd,
        stimuli: currentTrial,
        trialResult: trialResult,
        responseTime: responseTime,
        //timeOutReached: currentTimeoutId //unique Ids for timeoutIds
    });
    console.table(trialData)
}


// Check if a new location is adjacent to any previously selected locations
function isAdjacent(newLoc, selectedLocs) {
    const distanceThreshold = CONFIG.stimuli.SQUARE_SIZE; // Set threshold distance to avoid adjacent placement

    for (let loc of selectedLocs) {
        const distance = Math.sqrt(Math.pow(newLoc.x - loc.x, 2) + Math.pow(newLoc.y - loc.y, 2));
        if (distance < distanceThreshold) {
            return true;
        }
    }

    return false;
}

// Utility function to generate a random color
function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}
