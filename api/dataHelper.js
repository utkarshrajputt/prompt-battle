const { promises: fs } = require('fs');
const path = require('path');

let globalData = {
    submissions: [],
    submissionCounter: 0
};

const dataFile = path.join('/tmp', 'submissions.json');

async function loadData() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const parsed = JSON.parse(data);
        globalData.submissions = parsed.submissions || [];
        globalData.submissionCounter = parsed.submissionCounter || 0;
    } catch (error) {
        // File doesn't exist, use in-memory data
        console.log('Using in-memory storage');
    }
}

async function saveData() {
    try {
        const data = {
            submissions: globalData.submissions,
            submissionCounter: globalData.submissionCounter,
            lastUpdated: new Date().toISOString()
        };
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

async function addSubmission(name, prompt) {
    await loadData();
    const submission = {
        id: ++globalData.submissionCounter,
        name: name && name.trim() ? name.trim() : 'Anonymous',
        prompt: prompt.trim(),
        timestamp: new Date().toISOString(),
        votes: 0
    };
    
    globalData.submissions.push(submission);
    await saveData();
    return submission;
}

async function voteForSubmission(id) {
    await loadData();
    const submission = globalData.submissions.find(s => s.id === id);
    if (!submission) return null;
    
    submission.votes++;
    await saveData();
    return submission;
}

function getSubmissions() {
    return globalData.submissions.sort((a, b) => b.votes - a.votes);
}

function getTop3() {
    const sortedSubmissions = globalData.submissions.sort((a, b) => b.votes - a.votes);
    return sortedSubmissions.slice(0, 3).filter(s => s.votes > 0);
}

function getTotal() {
    return globalData.submissions.length;
}

module.exports = {
    addSubmission,
    voteForSubmission,
    getSubmissions,
    getTop3,
    getTotal,
    loadData
};

// For ES modules compatibility
module.exports.default = module.exports;