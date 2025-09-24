// DOM Elements
const submissionForm = document.getElementById('submission-form');
const nameInput = document.getElementById('name');
const promptInput = document.getElementById('prompt');
const submitBtn = document.querySelector('.btn-primary');
const submissionCounter = document.getElementById('submission-counter');
const submissionsList = document.getElementById('submissions-list');
const top3Section = document.getElementById('top3-section');
const top3List = document.getElementById('top3-list');
const charCount = document.getElementById('char-count');
const toast = document.getElementById('toast');
const downloadCsvBtn = document.getElementById('download-csv-btn');

// State
let submissions = [];
let top3 = [];
let userId = null;

// Generate or retrieve user ID
function getUserId() {
    if (userId) return userId;
    
    // Try to get from localStorage first
    userId = localStorage.getItem('promptBattle_userId');
    
    if (!userId) {
        // Generate a unique user ID
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('promptBattle_userId', userId);
    }
    
    return userId;
}

// Character counter for prompt textarea
promptInput.addEventListener('input', () => {
    const count = promptInput.value.length;
    charCount.textContent = count;
    
    // Change color based on character count
    if (count > 450) {
        charCount.style.color = 'var(--error-color)';
    } else if (count > 350) {
        charCount.style.color = 'var(--warning-color)';
    } else {
        charCount.style.color = 'var(--gray-500)';
    }
});

// Form submission handler
submissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        showToast('Please enter a prompt before submitting!', 'error', 'fas fa-exclamation-triangle');
        return;
    }
    
    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, prompt })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Prompt submitted successfully!', 'success', 'fas fa-check-circle');
            
            // Clear form
            nameInput.value = '';
            promptInput.value = '';
            charCount.textContent = '0';
            charCount.style.color = 'var(--gray-500)';
            
            // Refresh submissions immediately
            await loadSubmissions();
            
        } else {
            showToast(data.error || 'Error submitting prompt', 'error', 'fas fa-exclamation-triangle');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error. Please try again.', 'error', 'fas fa-wifi');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Submit Prompt';
    }
});

// Load submissions from server
async function loadSubmissions() {
    try {
        const response = await fetch('/api/submissions');
        const data = await response.json();
        
        submissions = data.submissions;
        updateSubmissionCounter(data.total);
        renderSubmissions();
        
        // Also load top 3 when submissions are loaded
        await loadTop3();
        
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// Load top 3 from server
async function loadTop3() {
    try {
        const response = await fetch('/api/top3');
        const data = await response.json();
        
        top3 = data.top3;
        renderTop3();
        
    } catch (error) {
        console.error('Error loading top 3:', error);
    }
}

// Handle voting
async function voteForSubmission(submissionId) {
    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                id: submissionId,
                userId: getUserId()
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update local data
            const submission = submissions.find(s => s.id === submissionId);
            if (submission) {
                submission.votes = data.submission.votes;
                submission.votedUsers = data.submission.votedUsers;
            }
            
            // Re-render submissions and top 3
            renderSubmissions();
            renderTop3();
            
            const voteText = data.hasVoted ? 'Vote added! 🎉' : 'Vote removed! 👍';
            showToast(voteText, 'success', 'fas fa-thumbs-up');
            
            // Refresh data from server to ensure consistency
            setTimeout(() => loadSubmissions(), 500);
        } else {
            showToast(data.error || 'Error voting', 'error', 'fas fa-exclamation-triangle');
        }
        
    } catch (error) {
        console.error('Error voting:', error);
        showToast('Network error. Please try again.', 'error', 'fas fa-wifi');
    }
}

// Handle deleting a submission
async function deleteSubmission(submissionId) {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: submissionId })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Prompt deleted successfully! 🗑️', 'success', 'fas fa-trash');
            
            // Refresh submissions
            await loadSubmissions();
        } else {
            showToast(data.error || 'Error deleting prompt', 'error', 'fas fa-exclamation-triangle');
        }
        
    } catch (error) {
        console.error('Error deleting submission:', error);
        showToast('Network error. Please try again.', 'error', 'fas fa-wifi');
    }
}

// Clear Top 3 function
async function clearTop3() {
    try {
        // Clear current top 3 by toggling each one
        const currentTop3 = submissions.filter(s => s.isTop3);
        
        for (const submission of currentTop3) {
            await fetch('/top3', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: submission.id })
            });
        }
        
        showToast('Top 3 cleared successfully', 'success', 'fas fa-check');
        
        // Refresh both sections
        await Promise.all([loadSubmissions(), loadTop3()]);
        
    } catch (error) {
        console.error('Error clearing top 3:', error);
        showToast('Network error. Please try again.', 'error', 'fas fa-wifi');
    }
}

// Download CSV function
async function downloadCsv() {
    try {
        if (submissions.length === 0) {
            showToast('No submissions to download', 'error', 'fas fa-exclamation-triangle');
            return;
        }
        
        downloadCsvBtn.disabled = true;
        downloadCsvBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
        
        const response = await fetch('/api/download-csv');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prompt-battle-submissions-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast('CSV downloaded successfully!', 'success', 'fas fa-download');
        } else {
            const data = await response.json();
            showToast(data.error || 'Error downloading CSV', 'error', 'fas fa-exclamation-triangle');
        }
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        showToast('Network error. Please try again.', 'error', 'fas fa-wifi');
    } finally {
        downloadCsvBtn.disabled = false;
        downloadCsvBtn.innerHTML = '<i class="fas fa-download"></i> Download CSV';
    }
}

// Update submission counter with animation
function updateSubmissionCounter(count) {
    submissionCounter.textContent = count;
    
    // Add animation class
    submissionCounter.classList.add('updating');
    setTimeout(() => {
        submissionCounter.classList.remove('updating');
    }, 200);
}

// Render submissions list
function renderSubmissions() {
    if (submissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="no-submissions">
                <i class="fas fa-inbox"></i>
                <p>No submissions yet. Be the first to submit!</p>
            </div>
        `;
        return;
    }
    
    const currentUserId = getUserId();
    
    submissionsList.innerHTML = submissions.map(submission => {
        const hasVoted = submission.votedUsers && submission.votedUsers.includes(currentUserId);
        const voteButtonClass = hasVoted ? 'vote-btn voted' : 'vote-btn';
        const voteButtonTitle = hasVoted ? 'Click to remove your vote' : 'Click to vote for this prompt';
        
        return `
            <div class="submission-item" data-id="${submission.id}">
                <div class="submission-content">
                    <div class="submission-header">
                        <div class="submission-name">
                            <i class="fas fa-user"></i>
                            ${escapeHtml(submission.name)}:
                        </div>
                        <div class="submission-time">
                            <i class="fas fa-clock"></i>
                            ${formatTime(submission.timestamp)}
                        </div>
                    </div>
                    <div class="submission-prompt">${escapeHtml(submission.prompt)}</div>
                </div>
                <div class="submission-actions">
                    <div class="vote-section">
                        <button class="${voteButtonClass}" onclick="voteForSubmission(${submission.id})" title="${voteButtonTitle}">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <div class="vote-count">${submission.votes || 0}</div>
                    </div>
                    <button class="delete-btn" onclick="deleteSubmission(${submission.id})" title="Delete this prompt">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render top 3 section
function renderTop3() {
    if (top3.length === 0) {
        top3Section.style.display = 'none';
        return;
    }
    
    top3Section.style.display = 'block';
    
    // Add medals for ranking
    const medals = ['🥇', '🥈', '🥉'];
    
    top3List.innerHTML = top3.map((submission, index) => `
        <div class="top3-item" data-rank="${index + 1}">
            <div class="rank-badge">${medals[index] || '🏆'}</div>
            <div class="submission-content">
                <div class="submission-header">
                    <div class="submission-name">
                        <i class="fas fa-user"></i>
                        ${escapeHtml(submission.name)}
                    </div>
                    <div class="vote-display">
                        <i class="fas fa-thumbs-up"></i>
                        <span>${submission.votes || 0} votes</span>
                    </div>
                </div>
                <div class="submission-prompt">${escapeHtml(submission.prompt)}</div>
                <div class="submission-time">
                    <i class="fas fa-clock"></i>
                    Submitted ${formatTime(submission.timestamp)}
                </div>
            </div>
        </div>
    `).join('');
}

// Show toast notification
function showToast(message, type = 'success', icon = 'fas fa-check-circle') {
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toastIcon.className = `toast-icon ${icon}`;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Auto-refresh submissions every 3 seconds
function startAutoRefresh() {
    setInterval(async () => {
        await loadSubmissions();
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', downloadCsv);
    }
    
    // Load initial data
    loadSubmissions();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Focus on name input for better UX
    nameInput.focus();
    
    console.log('🏆 Prompt Battle Royale initialized!');
    console.log('💡 Tip: Click the upvote button to vote for your favorite prompts!');
});

// Handle visibility change to refresh when tab becomes active
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadSubmissions();
    }
});