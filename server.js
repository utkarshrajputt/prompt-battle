const express = require('express');
const path = require('path');
const DataStore = require('./dataStore');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize data store
const dataStore = new DataStore();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Submit a new prompt
app.post('/submit', async (req, res) => {
  const { name, prompt } = req.body;
  
  // Prevent empty submissions
  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt cannot be empty' });
  }
  
  try {
    const submission = await dataStore.addSubmission(name, prompt);
    res.json({ success: true, submission });
  } catch (error) {
    console.error('Error adding submission:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Get all submissions
app.get('/submissions', (req, res) => {
  res.json({
    submissions: dataStore.getSubmissions(),
    total: dataStore.getTotal()
  });
});

// Vote for a submission
app.post('/vote', async (req, res) => {
  const { id } = req.body;
  
  try {
    const submission = await dataStore.voteForSubmission(id);
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const top3 = dataStore.getTop3();
    
    res.json({ 
      success: true, 
      submission,
      top3 
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to register vote' });
  }
});

// Get top 3 prompts (based on votes)
app.get('/top3', (req, res) => {
  res.json({ top3: dataStore.getTop3() });
});

// Download submissions as CSV
app.get('/download-csv', (req, res) => {
  const submissions = dataStore.getSubmissions();
  
  if (submissions.length === 0) {
    return res.status(400).json({ error: 'No submissions to download' });
  }
  
  // Create CSV content
  const csvHeader = 'ID,Name,Prompt,Votes,Timestamp\n';
  const csvRows = submissions.map(sub => {
    const name = sub.name.replace(/"/g, '""'); // Escape quotes
    const prompt = sub.prompt.replace(/"/g, '""'); // Escape quotes
    const timestamp = new Date(sub.timestamp).toLocaleString();
    return `${sub.id},"${name}","${prompt}",${sub.votes},"${timestamp}"`;
  }).join('\n');
  
  const csvContent = csvHeader + csvRows;
  
  // Set headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="prompt-battle-submissions-${new Date().toISOString().split('T')[0]}.csv"`);
  
  res.send(csvContent);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Prompt Battle Royale running at http://localhost:${PORT}`);
  console.log('📖 Open this URL in your browser to start the workshop!');
});