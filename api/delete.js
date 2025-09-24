const { deleteSubmission } = require('./dataHelper');

export default async function handler(req, res) {
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