const DataStore = require('../dataStore');
const dataStore = new DataStore();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.json({
      submissions: dataStore.getSubmissions(),
      total: dataStore.getTotal()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}