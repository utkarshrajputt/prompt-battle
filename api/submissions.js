const { getSubmissions, getTotal, loadData } = require('./dataHelper');

module.exports = async function handler(req, res) {
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