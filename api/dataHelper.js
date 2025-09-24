const { promises: fs } = require('fs');
const path = require('path');

let globalData = {
    submissions: [],
    submissionCounter: 0
};

// Use /tmp for Vercel, but handle errors gracefully
const dataFile = path.join('/tmp', 'submissions.json');

async function loadData() {
    try {
        const data = await fs.readFile(dataFile, 'utf8');
        const parsed = JSON.parse(data);
        globalData.submissions = parsed.submissions || [];
        globalData.submissionCounter = parsed.submissionCounter || 0;
    } catch (error) {
        // File doesn't exist or can't be read, use in-memory data
        console.log('Using in-memory storage:', error.message);
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
        // If we can't write to file, continue with in-memory only
        console.log('Could not save to file, using in-memory only:', error.message);
    }
}

async function addSubmission(name, prompt) {
    await loadData();
    const submission = {
        id: ++globalData.submissionCounter,
        name: name && name.trim() ? name.trim() : 'Anonymous',
        prompt: prompt.trim(),
        timestamp: new Date().toISOString(),
        votes: 0,
        votedUsers: [] // Track which users have voted
    };
    
    globalData.submissions.push(submission);
    await saveData();
    return submission;
}

async function toggleVote(id, userId) {
    await loadData();
    const submission = globalData.submissions.find(s => s.id === id);
    if (!submission) return null;
    
    // Initialize votedUsers array if it doesn't exist (for backward compatibility)
    if (!submission.votedUsers) {
        submission.votedUsers = [];
    }
    
    const userIndex = submission.votedUsers.indexOf(userId);
    
    if (userIndex === -1) {
        // User hasn't voted, add their vote
        submission.votedUsers.push(userId);
        submission.votes++;
    } else {
        // User has voted, remove their vote
        submission.votedUsers.splice(userIndex, 1);
        submission.votes--;
    }
    
    await saveData();
    return {
        submission,
        hasVoted: userIndex === -1 // true if they just voted, false if they just unvoted
    };
}

async function deleteSubmission(id) {
    await loadData();
    const index = globalData.submissions.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    globalData.submissions.splice(index, 1);
    await saveData();
    return true;
}

function hasUserVoted(submissionId, userId) {
    const submission = globalData.submissions.find(s => s.id === submissionId);
    if (!submission || !submission.votedUsers) return false;
    return submission.votedUsers.includes(userId);
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
    toggleVote,
    deleteSubmission,
    hasUserVoted,
    getSubmissions,
    getTop3,
    getTotal,
    loadData
};

// For ES modules compatibility
module.exports.default = module.exports;