const fs = require('fs').promises;
const path = require('path');

class DataStore {
    constructor() {
        this.dataFile = path.join(__dirname, 'data', 'submissions.json');
        this.submissions = [];
        this.submissionCounter = 0;
        this.init();
    }

    async init() {
        try {
            // Create data directory if it doesn't exist
            await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
            
            // Load existing data
            await this.loadData();
        } catch (error) {
            console.log('Initializing new data store');
            await this.saveData();
        }
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            const parsed = JSON.parse(data);
            this.submissions = parsed.submissions || [];
            this.submissionCounter = parsed.submissionCounter || 0;
            console.log(`Loaded ${this.submissions.length} submissions from storage`);
        } catch (error) {
            console.log('No existing data found, starting fresh');
            this.submissions = [];
            this.submissionCounter = 0;
        }
    }

    async saveData() {
        try {
            const data = {
                submissions: this.submissions,
                submissionCounter: this.submissionCounter,
                lastUpdated: new Date().toISOString()
            };
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    async addSubmission(name, prompt) {
        const submission = {
            id: ++this.submissionCounter,
            name: name && name.trim() ? name.trim() : 'Anonymous',
            prompt: prompt.trim(),
            timestamp: new Date().toISOString(),
            votes: 0
        };
        
        this.submissions.push(submission);
        await this.saveData();
        return submission;
    }

    async voteForSubmission(id) {
        const submission = this.submissions.find(s => s.id === id);
        if (!submission) {
            return null;
        }
        
        submission.votes++;
        await this.saveData();
        return submission;
    }

    getSubmissions() {
        return this.submissions.sort((a, b) => b.votes - a.votes);
    }

    getTop3() {
        const sortedSubmissions = this.submissions.sort((a, b) => b.votes - a.votes);
        return sortedSubmissions.slice(0, 3).filter(s => s.votes > 0);
    }

    getTotal() {
        return this.submissions.length;
    }
}

module.exports = DataStore;