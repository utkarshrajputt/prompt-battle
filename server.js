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

// Submit a new prompt (handle both /submit and /api/submit)
app.post(['/submit', '/api/submit'], async (req, res) => {
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

// Get all submissions (handle both /submissions and /api/submissions)
app.get(['/submissions', '/api/submissions'], (req, res) => {
  res.json({
    submissions: dataStore.getSubmissions(),
    total: dataStore.getTotal()
  });
});

// Vote for a submission (handle both /vote and /api/vote)
app.post(['/vote', '/api/vote'], async (req, res) => {
  const { id, userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const result = await dataStore.toggleVote(parseInt(id), userId);
    
    if (!result) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    const top3 = dataStore.getTop3();
    
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
});

// Get top 3 prompts (handle both /top3 and /api/top3)
app.get(['/top3', '/api/top3'], (req, res) => {
  res.json({ top3: dataStore.getTop3() });
});

// Delete a submission (handle both /delete and /api/delete)
app.delete(['/delete', '/api/delete'], async (req, res) => {
  console.log('Delete request received:', req.body);
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  
  try {
    const success = await dataStore.deleteSubmission(parseInt(id));
    console.log('Delete result:', success, 'for ID:', id);
    
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
});

// Download submissions as CSV (handle both /download-csv and /api/download-csv)
app.get(['/download-csv', '/api/download-csv'], (req, res) => {
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