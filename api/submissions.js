const { getSubmissions, getTotal, loadData } = require('./dataHelper');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        try {
            await loadData();
            res.json({
                submissions: getSubmissions(),
                total: getTotal()
            });
        } catch (error) {
            console.error('Error loading submissions:', error);
            res.status(500).json({ error: 'Failed to load submissions' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}