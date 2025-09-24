const { toggleVote, getTop3 } = require('./dataHelper');

module.exports = async function handler(req, res) {
    if (req.method === 'POST') {
        const { id, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        try {
            const result = await toggleVote(id, userId);
            
            if (!result) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            
            const top3 = getTop3();
            
            res.json({ 
                success: true, 
                submission: result.submission,
                hasVoted: result.hasVoted,
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