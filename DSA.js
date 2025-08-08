document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    
    const themeSwitcher = document.getElementById('theme-switcher');
    const queryCountElement = document.getElementById('query-count');
    const navItems = document.querySelectorAll('.nav-item[data-panel]'); // Select only panel-switching items
    const panels = document.querySelectorAll('.panel');
    const historyContent = document.getElementById('history-content');

    const newChatBtn = document.getElementById('new-chat-btn');
    const chatNavItem = document.getElementById('chat-nav-item'); // To easily make chat active
    const chatPanel = document.getElementById('chat-panel');

    let queryCount = 0;
    let chatHistory = [];

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    };

    themeSwitcher.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);


    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const panelId = item.getAttribute('data-panel') + '-panel';
            showPanel(panelId, item);
        });
    });

    function showPanel(panelId, activeNavItem) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        activeNavItem.classList.add('active');
        document.getElementById(panelId).classList.add('active');
    }
    
    newChatBtn.addEventListener('click', () => {
        chatBox.innerHTML = '';

        addMessage('Hello! I am your advanced Data Structures and Algorithms instructor. Ask me anything about DSA!', 'assistant');

        queryCount = 0;
        queryCountElement.innerText = '0';

        showPanel('chat-panel', chatNavItem);
    });


    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();

        if (userMessage) {
            addMessage(userMessage, 'user');
            userInput.value = '';
            
            const thinkingMessage = addMessage('Thinking...', 'assistant');

            try {
                const response = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: userMessage })
                });

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();
                
                thinkingMessage.querySelector('p').innerText = data.reply;

                updateQueryCount();
                addToHistory(userMessage, data.reply);

            } catch (error) {
                thinkingMessage.querySelector('p').innerText = 'Sorry, something went wrong. Please try again.';
                thinkingMessage.classList.add('error');
                console.error('Error:', error);
            }
        }
    });

    function addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        messageElement.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }

    function updateQueryCount() {
        queryCount++;
        queryCountElement.innerText = queryCount;
    }


    function addToHistory(question, answer) {
        chatHistory.unshift({ question, answer });
        renderHistory();
    }

    function renderHistory() {
        if (chatHistory.length === 0) {
            historyContent.innerHTML = '<p class="empty-state">Your conversation history will appear here.</p>';
            return;
        }

        historyContent.innerHTML = '';
        chatHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="question">${item.question}</div>
                <div class="answer">${item.answer}</div>
            `;
            historyContent.appendChild(historyItem);
        });
    }
});