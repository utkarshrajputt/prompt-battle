const { deleteSubmission } = require('./dataHelper');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'DELETE') {
        const { id } = req.body;
        
        try {
            const success = await deleteSubmission(parseInt(id));
            
            if (!success) {
                return res.status(404).json({ error: 'Submission not found' });
            }
            
            res.json({ 
                success: true, 
                message: 'Submission deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting submission:', error);
            res.status(500).json({ error: 'Failed to delete submission' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}