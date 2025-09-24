const { voteForSubmission, getTop3 } = require('./dataHelper');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { id } = req.body;
        
        try {
            const submission = await voteForSubmission(id);
            
            if (!submission) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            
            const top3 = getTop3();
            
            res.json({ 
                success: true, 
                submission,
                top3 
            });
        } catch (error) {
            console.error('Error voting:', error);
            res.status(500).json({ error: 'Failed to register vote' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}