const { getTop3, loadData } = require('./dataHelper');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            await loadData();
            res.json({ top3: getTop3() });
        } catch (error) {
            console.error('Error loading top3:', error);
            res.status(500).json({ error: 'Failed to load top 3' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}