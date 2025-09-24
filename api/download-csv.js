const DataStore = require('../dataStore');
const dataStore = new DataStore();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const submissions = dataStore.getSubmissions();
    
    if (submissions.length === 0) {
      return res.status(400).json({ error: 'No submissions to download' });
    }
    
    // Create CSV content
    const csvHeader = 'ID,Name,Prompt,Votes,Timestamp\n';
    const csvRows = submissions.map(sub => {
      const name = sub.name.replace(/"/g, '""');
      const prompt = sub.prompt.replace(/"/g, '""');
      const timestamp = new Date(sub.timestamp).toLocaleString();
      return `${sub.id},"${name}","${prompt}",${sub.votes},"${timestamp}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="prompt-battle-submissions-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}