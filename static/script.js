// =============================================
// DOM ELEMENTS
// =============================================
const queryForm = document.getElementById('queryForm');
const queryInput = document.getElementById('queryInput');
const sendBtn = document.getElementById('sendBtn');
const chatArea = document.getElementById('chatArea');
const welcomeSection = document.getElementById('welcomeSection');
const statusBadge = document.getElementById('statusBadge');

// =============================================
// STATE
// =============================================
let isLoading = false;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    checkOllamaStatus();
    setInterval(checkOllamaStatus, 30000); // Check every 30s
    queryInput.focus();

    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            queryInput.value = query;
            handleSubmit();
        });
    });
});

// =============================================
// STATUS CHECK
// =============================================
async function checkOllamaStatus() {
    try {
        const res = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
            setStatus('online', 'Ollama Online');
        } else {
            setStatus('offline', 'Ollama Offline');
        }
    } catch {
        setStatus('offline', 'Ollama Offline');
    }
}

function setStatus(state, text) {
    statusBadge.className = `status-badge ${state}`;
    statusBadge.querySelector('.status-text').textContent = text;
}

// =============================================
// FORM HANDLING
// =============================================
queryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
});

async function handleSubmit() {
    const question = queryInput.value.trim();
    if (!question || isLoading) return;

    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.classList.add('loading');

    // Hide welcome
    welcomeSection.classList.add('hidden');

    // Add user message
    appendUserMessage(question);
    queryInput.value = '';

    // Add loading indicator
    const loadingEl = appendLoading();

    // Scroll to bottom
    scrollToBottom();

    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question })
        });

        const data = await res.json();

        // Remove loading
        loadingEl.remove();

        if (!res.ok) {
            appendError(data.error || 'Something went wrong. Please try again.');
        } else {
            appendAIMessage(data.answer, data.sources);
        }
    } catch (err) {
        loadingEl.remove();
        appendError('Failed to connect to the server. Make sure the backend is running.');
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        queryInput.focus();
        scrollToBottom();
    }
}

// =============================================
// MESSAGE RENDERING
// =============================================
function appendUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message-user';
    div.innerHTML = `<div class="message-user-bubble">${escapeHtml(text)}</div>`;
    chatArea.appendChild(div);
}

function appendLoading() {
    const div = document.createElement('div');
    div.className = 'message-loading';
    div.innerHTML = `
        <div class="ai-header">
            <div class="ai-avatar">🤖</div>
            <span class="ai-name">CourseAI</span>
        </div>
        <div class="loading-bubble">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
            <span class="loading-text">Searching the course...</span>
        </div>
    `;
    chatArea.appendChild(div);
    return div;
}

function appendAIMessage(answer, sources) {
    const div = document.createElement('div');
    div.className = 'message-ai';

    // Format the answer text into paragraphs
    const formattedAnswer = answer
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<p>${escapeHtml(line)}</p>`)
        .join('');

    let sourcesHTML = '';
    if (sources && sources.length > 0) {
        const sourceCards = sources.map(src => {
            const startFormatted = formatTimestamp(src.start);
            const endFormatted = formatTimestamp(src.end);
            const similarity = (src.similarity * 100).toFixed(0);

            // Truncate title
            let title = src.title;
            if (title.length > 60) {
                title = title.substring(0, 57) + '...';
            }

            return `
                <div class="source-card">
                    <div class="source-video-num">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        Video #${escapeHtml(src.number)}
                    </div>
                    <div class="source-title">${escapeHtml(title)}</div>
                    <div class="source-meta">
                        <span>⏱ ${startFormatted} – ${endFormatted}</span>
                        <span class="source-similarity">${similarity}%</span>
                    </div>
                </div>
            `;
        }).join('');

        sourcesHTML = `
            <div class="sources-section">
                <div class="sources-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Source Chunks (${sources.length})
                </div>
                <div class="source-cards">${sourceCards}</div>
            </div>
        `;
    }

    div.innerHTML = `
        <div class="ai-header">
            <div class="ai-avatar">🤖</div>
            <span class="ai-name">CourseAI</span>
        </div>
        <div class="ai-response-text">${formattedAnswer}</div>
        ${sourcesHTML}
    `;

    chatArea.appendChild(div);
}

function appendError(message) {
    const div = document.createElement('div');
    div.className = 'message-error';
    div.innerHTML = `
        <div class="error-bubble">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span class="error-text">${escapeHtml(message)}</span>
        </div>
    `;
    chatArea.appendChild(div);
}

// =============================================
// UTILITIES
// =============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTimestamp(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    });
}

// Keyboard shortcut: Ctrl+Enter or Cmd+Enter to send
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
});
