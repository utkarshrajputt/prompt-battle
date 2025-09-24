const { addSubmission } = require('./dataHelper');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, prompt } = req.body;
        
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'Prompt cannot be empty' });
        }
        
        try {
            const submission = await addSubmission(name, prompt);
            res.json({ success: true, submission });
        } catch (error) {
            console.error('Error adding submission:', error);
            res.status(500).json({ error: 'Failed to save submission' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}