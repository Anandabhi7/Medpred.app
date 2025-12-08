/**
 * MedPredictor Advanced JavaScript v2.1 - Complete with Fixed Chatbot
 * AI-Powered Healthcare Assistant with Advanced Medical Consultation
 */

class MedPredictorApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.symptoms = [];
        this.diseases = [];
        this.selectedSymptoms = new Set();
        this.currentPredictions = null;
        this.chatHistory = [];
        this.chatSessionId = this.generateSessionId();
        
        // Theme management
        this.currentTheme = localStorage.getItem('medpredictor-theme') || 'light';
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing MedPredictor Advanced...');
            this.initializeTheme();
            this.setupEventListeners();
            await this.loadInitialData();
            this.initializeComponents();
            this.initializeChatbot();
            console.log('✅ MedPredictor initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showToast('Failed to initialize application', 'error');
        }
    }

    // Generate unique session ID for chatbot
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (icon) {
                icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('medpredictor-theme', newTheme);
        this.currentTheme = newTheme;
        this.updateThemeToggle();
        
        this.showToast(`Switched to ${newTheme} mode`, 'info');
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Search functionality
        const symptomSearch = document.getElementById('symptomSearch');
        if (symptomSearch) {
            symptomSearch.addEventListener('input', this.handleSymptomSearch.bind(this));
        }

        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', this.clearSymptomSearch.bind(this));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSymptomFilter(e.target.dataset.filter));
        });

        // Control buttons
        const predictBtn = document.getElementById('predictBtn');
        const resetBtn = document.getElementById('resetBtn');
        const clearAllSymptoms = document.getElementById('clearAllSymptoms');

        if (predictBtn) {
            predictBtn.addEventListener('click', () => this.predictDisease());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSymptoms());
        }
        if (clearAllSymptoms) {
            clearAllSymptoms.addEventListener('click', () => this.clearAllSymptoms());
        }

        // Disease lookup
        const lookupBtn = document.getElementById('lookupBtn');
        const diseaseLookup = document.getElementById('diseaseLookup');
        
        if (lookupBtn) {
            lookupBtn.addEventListener('click', () => this.performDiseaseLookup());
        }
        if (diseaseLookup) {
            diseaseLookup.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performDiseaseLookup();
                }
            });
        }

        // Health tools
        const calculateBMI = document.getElementById('calculateBMI');
        const checkInteractions = document.getElementById('checkInteractions');
        const downloadReport = document.getElementById('downloadReport');

        if (calculateBMI) {
            calculateBMI.addEventListener('click', () => this.calculateBMI());
        }
        if (checkInteractions) {
            checkInteractions.addEventListener('click', () => this.checkDrugInteractions());
        }
        if (downloadReport) {
            downloadReport.addEventListener('click', () => this.downloadReport());
        }

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.setActiveNavLink(link);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    async loadInitialData() {
        try {
            console.log('📊 Loading initial data...');
            
            const [symptomsResponse, diseasesResponse, emergencyResponse, instructionsResponse] = 
                await Promise.all([
                    this.fetchAPI('/symptoms'),
                    this.fetchAPI('/diseases'),
                    this.fetchAPI('/emergency-contacts'),
                    this.fetchAPI('/health-instructions')
                ]);

            this.symptoms = symptomsResponse.symptoms || [];
            this.diseases = diseasesResponse.diseases || [];
            
            this.populateEmergencyContacts(emergencyResponse.emergency_contacts);
            this.populateHealthInstructions(instructionsResponse.health_instructions);
            
            console.log(`✅ Loaded ${this.symptoms.length} symptoms and ${this.diseases.length} diseases`);
            
            // Update hero stats with actual numbers
            const totalSymptomsEl = document.getElementById('totalSymptoms');
            const totalDiseasesEl = document.getElementById('totalDiseases');
            if (totalSymptomsEl) totalSymptomsEl.textContent = this.symptoms.length;
            if (totalDiseasesEl) totalDiseasesEl.textContent = this.diseases.length;
            
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
            this.showToast('Failed to load application data', 'error');
        }
    }

    async fetchAPI(endpoint, options = {}) {
        try {
            console.log(`🌐 API Request: ${endpoint}`);
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Response: ${endpoint}`, data);
            return data;
        } catch (error) {
            console.error(`❌ API Error for ${endpoint}:`, error);
            throw error;
        }
    }

    initializeComponents() {
        this.updateSymptomsList();
        this.updateSelectedCount();
        this.updatePredictButton();
    }

    // ========== ADVANCED CHATBOT FUNCTIONALITY ==========

    // Initialize chatbot with session management
    initializeChatbot() {
        console.log(`🤖 Initializing advanced chatbot with session: ${this.chatSessionId}`);
        this.setupChatbotEventListeners();
        this.chatHistory = [];
        
        // Add welcome message
        this.addInitialWelcomeMessage();
    }

    addInitialWelcomeMessage() {
        // Check if welcome message already exists
        const existingWelcome = document.querySelector('.message.bot-message');
        if (existingWelcome) {
            // Update existing welcome message
            const messageContent = existingWelcome.querySelector('.message-bubble');
            if (messageContent) {
                messageContent.innerHTML = `
                    <p>👋 <strong>Hello! I'm Dr. AI, your advanced medical consultation assistant.</strong></p>
                    <p>I can provide:</p>
                    <ul>
                        <li>🩺 Complete medical consultations</li>
                        <li>🏥 Specialist doctor recommendations</li>
                        <li>📍 Location-based medical guidance</li>
                        <li>🚨 Emergency assistance</li>
                    </ul>
                    <p><strong>💬 Say "Hello" or "Start consultation" to begin your personalized medical assessment!</strong></p>
                    <p><strong>⚠️ Medical Disclaimer:</strong> This is an AI assistant for preliminary guidance only. Always consult qualified healthcare professionals for proper medical diagnosis and treatment.</p>
                `;
            }
        }
    }

    // Setup chatbot event listeners
    setupChatbotEventListeners() {
        // Send message button
        const sendBtn = document.getElementById('sendMessage');
        const chatInput = document.getElementById('chatInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
            
            // Input suggestions
            chatInput.addEventListener('input', (e) => {
                this.showChatSuggestions(e.target.value);
            });
        }
        
        // Clear chat button
        const clearChat = document.getElementById('clearChat');
        if (clearChat) {
            clearChat.addEventListener('click', () => this.clearChat());
        }
        
        // Toggle chat button
        const toggleChat = document.getElementById('toggleChat');
        if (toggleChat) {
            toggleChat.addEventListener('click', () => this.toggleChat());
        }
        
        // Quick action buttons
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.dataset.message;
                this.sendQuickMessage(message);
            });
        });
    }

    // ADVANCED: Send message to chatbot with session management
    async sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) {
            this.showToast('Please type a message', 'warning');
            return;
        }
        
        // Disable input during processing
        chatInput.disabled = true;
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn) sendBtn.disabled = true;
        
        // Clear input
        chatInput.value = '';
        this.hideChatSuggestions();
        
        // Add user message to chat
        this.addMessageToChat('user', message);
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            console.log(`🤖 Sending message: "${message}" (Session: ${this.chatSessionId})`);
            
            // Send to backend with session ID
            const response = await this.fetchAPI('/chatbot', {
                method: 'POST',
                body: JSON.stringify({
                    message: message,
                    session_id: this.chatSessionId,
                    history: this.chatHistory.slice(-10) // Send last 10 messages for context
                })
            });
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            if (response.success) {
                // Add bot response
                this.addMessageToChat('bot', response.response);
                
                // Add to history
                this.chatHistory.push(
                    { role: 'user', content: message, timestamp: new Date().toISOString() },
                    { role: 'bot', content: response.response, timestamp: new Date().toISOString() }
                );
                
                // Update quick actions if provided
                if (response.quickActions && response.quickActions.length > 0) {
                    this.updateQuickActions(response.quickActions);
                }
                
                // Log session stage for debugging
                if (response.session_stage) {
                    console.log(`🤖 Chatbot stage: ${response.session_stage}`);
                }
                
                this.showToast('Response received', 'success');
            } else {
                console.error('❌ Chatbot error:', response.error);
                this.addMessageToChat('bot', 'Sorry, I encountered an error. Please try again or contact support.');
                this.showToast('Chatbot error occurred', 'error');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('❌ Chatbot request failed:', error);
            this.addMessageToChat('bot', 'Sorry, I\'m having trouble connecting. Please check your internet connection and try again.');
            this.showToast('Connection error', 'error');
        } finally {
            // Re-enable input
            chatInput.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Send quick message
    sendQuickMessage(message) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = message;
            this.sendChatMessage();
        }
    }

    // Add message to chat window with enhanced formatting
    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('❌ Chat messages container not found');
            return;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const avatar = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        
        // Format message content with better markdown support
        const formattedMessage = this.formatChatMessage(message);
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="${avatar}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${formattedMessage}
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        // Smooth scroll to bottom
        setTimeout(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        
        console.log(`💬 Added ${sender} message to chat`);
    }

    // Enhanced message formatting for chat
    formatChatMessage(message) {
        // Convert line breaks to <br>
        message = message.replace(/\n/g, '<br>');
        
        // Convert **bold** to <strong>
        message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        message = message.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert ### headers
        message = message.replace(/^### (.*$)/gm, '<h4>$1</h4>');
        message = message.replace(/^## (.*$)/gm, '<h3>$1</h3>');
        message = message.replace(/^# (.*$)/gm, '<h2>$1</h2>');
        
        // Convert lists starting with - or • 
        message = message.replace(/^[-•]\s(.+)$/gm, '<li>$1</li>');
        
        // Wrap consecutive <li> items in <ul>
        message = message.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/gs, '<ul>$&</ul>');
        
        // Convert emojis and special formatting
        message = message.replace(/🔹/g, '<span class="bullet-point">🔹</span>');
        
        return message;
    }

    // Show typing indicator
    showTypingIndicator() {
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble loading">
                    <span>Dr. AI is thinking</span>
                    <div class="typing-dots">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Show input suggestions
    showChatSuggestions(input) {
        if (input.length < 2) {
            this.hideChatSuggestions();
            return;
        }
        
        const suggestions = [
            'Hello, start consultation',
            'My name is John',
            'I am 25 years old',
            'I am in Mumbai',
            'I have fever and headache',
            'I have chest pain',
            'Show emergency contacts',
            'What are COVID symptoms?',
            'How do I use the symptom checker?',
            'This is an emergency'
        ];
        
        const filtered = suggestions.filter(s => 
            s.toLowerCase().includes(input.toLowerCase())
        );
        
        if (filtered.length > 0) {
            this.displayChatSuggestions(filtered.slice(0, 3));
        } else {
            this.hideChatSuggestions();
        }
    }

    // Display chat suggestions
    displayChatSuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('chatSuggestions');
        if (!suggestionsContainer) return;
        
        suggestionsContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-item';
            suggestionDiv.textContent = suggestion;
            suggestionDiv.addEventListener('click', () => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = suggestion;
                    this.hideChatSuggestions();
                    this.sendChatMessage();
                }
            });
            suggestionsContainer.appendChild(suggestionDiv);
        });
        
        suggestionsContainer.classList.add('show');
    }

    // Hide suggestions
    hideChatSuggestions() {
        const suggestionsContainer = document.getElementById('chatSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('show');
        }
    }

    // Update quick actions with enhanced UI
    updateQuickActions(actions) {
        const quickActions = document.getElementById('quickActions');
        if (!quickActions) return;
        
        quickActions.innerHTML = '';
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'quick-btn';
            button.dataset.message = action.message;
            button.innerHTML = `
                <i class="${action.icon}"></i>
                ${action.text}
            `;
            button.addEventListener('click', (e) => {
                const message = e.currentTarget.dataset.message;
                this.sendQuickMessage(message);
            });
            quickActions.appendChild(button);
        });
        
        console.log(`✅ Updated quick actions: ${actions.length} buttons`);
    }

    // Clear chat with session reset
    clearChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        // Clear all messages
        chatMessages.innerHTML = '';
        
        // Reset session
        this.chatSessionId = this.generateSessionId();
        this.chatHistory = [];
        
        // Add fresh welcome message
        this.addInitialWelcomeMessage();
        
        // Reset quick actions to default
        this.resetQuickActions();
        
        this.showToast('Chat cleared - New session started', 'info');
        console.log(`🔄 Chat cleared - New session: ${this.chatSessionId}`);
    }

    // Reset quick actions to default
    resetQuickActions() {
        const quickActions = document.getElementById('quickActions');
        if (!quickActions) return;
        
        quickActions.innerHTML = `
            <button class="quick-btn" data-message="Hello, start consultation">
                <i class="fas fa-stethoscope"></i>
                Start Consultation
            </button>
            <button class="quick-btn" data-message="How do I use the symptom checker?">
                <i class="fas fa-question-circle"></i>
                How to Use
            </button>
            <button class="quick-btn" data-message="Show emergency contacts">
                <i class="fas fa-phone"></i>
                Emergency
            </button>
            <button class="quick-btn" data-message="This is an emergency">
                <i class="fas fa-exclamation-triangle"></i>
                Urgent Help
            </button>
        `;
        
        // Re-add event listeners
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.currentTarget.dataset.message;
                this.sendQuickMessage(message);
            });
        });
    }

    // Toggle chat window
    toggleChat() {
        const chatMessages = document.getElementById('chatMessages');
        const quickActions = document.getElementById('quickActions');
        const inputContainer = document.querySelector('.chat-input-container');
        const toggleBtn = document.getElementById('toggleChat');
        
        if (!chatMessages) return;
        
        const isMinimized = chatMessages.style.display === 'none';
        
        if (isMinimized) {
            // Expand
            chatMessages.style.display = 'block';
            if (quickActions) quickActions.style.display = 'flex';
            if (inputContainer) inputContainer.style.display = 'block';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-minus"></i>';
            this.showToast('Chat expanded', 'info');
        } else {
            // Minimize
            chatMessages.style.display = 'none';
            if (quickActions) quickActions.style.display = 'none';
            if (inputContainer) inputContainer.style.display = 'none';
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-plus"></i>';
            this.showToast('Chat minimized', 'info');
        }
    }

    // ========== SYMPTOM CHECKER FUNCTIONALITY ==========

    updateSymptomsList(filter = 'all') {
        const availableList = document.getElementById('availableSymptomsList');
        if (!availableList || !this.symptoms.length) {
            console.warn('⚠️ Symptoms list container not found or no symptoms loaded');
            return;
        }

        let symptomsToShow = this.symptoms;
        
        // Apply category filter
        if (filter !== 'all') {
            const categoryMap = {
                'respiratory': ['cough', 'shortness_of_breath', 'wheezing', 'chest_pain', 'sore_throat', 'difficulty_breathing'],
                'cardiovascular': ['chest_pain', 'palpitations', 'irregular_heartbeat', 'high_blood_pressure'],
                'neurological': ['headache', 'dizziness', 'memory_problems', 'numbness', 'tingling', 'seizures'],
                'gastrointestinal': ['nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal_pain', 'stomach_pain'],
                'musculoskeletal': ['joint_pain', 'muscle_pain', 'back_pain', 'muscle_weakness'],
                'constitutional': ['fever', 'fatigue', 'weight_loss', 'night_sweats', 'chills']
            };
            
            if (categoryMap[filter]) {
                symptomsToShow = this.symptoms.filter(symptom => 
                    categoryMap[filter].some(catSymptom => 
                        symptom.toLowerCase().includes(catSymptom.toLowerCase())
                    )
                );
            }
        }

        // Filter out selected symptoms
        symptomsToShow = symptomsToShow.filter(symptom => 
            !this.selectedSymptoms.has(symptom)
        );

        availableList.innerHTML = '';
        
        if (symptomsToShow.length === 0) {
            availableList.innerHTML = '<p class="no-symptoms">No symptoms available for this category</p>';
            return;
        }

        symptomsToShow.forEach(symptom => {
            const tag = this.createSymptomTag(symptom, false);
            availableList.appendChild(tag);
        });
        
        console.log(`✅ Updated symptoms list: ${symptomsToShow.length} symptoms (filter: ${filter})`);
    }

    updateSelectedSymptomsList() {
        const selectedList = document.getElementById('selectedSymptomsList');
        if (!selectedList) return;

        selectedList.innerHTML = '';
        
        if (this.selectedSymptoms.size === 0) {
            selectedList.innerHTML = '<p class="no-symptoms">No symptoms selected. Click symptoms below to add them.</p>';
            return;
        }

        Array.from(this.selectedSymptoms).forEach(symptom => {
            const tag = this.createSymptomTag(symptom, true);
            selectedList.appendChild(tag);
        });
    }

    createSymptomTag(symptom, isSelected) {
        const tag = document.createElement('div');
        tag.className = `symptom-tag ${isSelected ? 'selected' : ''}`;
        tag.dataset.symptom = symptom;
        
        const displayName = symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        tag.innerHTML = `
            <span>${displayName}</span>
            ${isSelected ? '<button class="remove-btn" type="button">×</button>' : ''}
        `;

        if (isSelected) {
            const removeBtn = tag.querySelector('.remove-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeSymptom(symptom);
                });
            }
            tag.addEventListener('click', () => this.removeSymptom(symptom));
        } else {
            tag.addEventListener('click', () => this.addSymptom(symptom));
        }

        return tag;
    }

    addSymptom(symptom) {
        if (this.selectedSymptoms.has(symptom)) {
            console.warn(`⚠️ Symptom '${symptom}' already selected`);
            return;
        }
        
        this.selectedSymptoms.add(symptom);
        this.updateSelectedSymptomsList();
        this.updateSymptomsList();
        this.updateSelectedCount();
        this.updatePredictButton();
        
        this.showToast(`Added "${this.formatSymptomName(symptom)}"`, 'success');
        console.log(`✅ Added symptom: ${symptom}`);
    }

    removeSymptom(symptom) {
        if (!this.selectedSymptoms.has(symptom)) {
            console.warn(`⚠️ Symptom '${symptom}' not in selected list`);
            return;
        }
        
        this.selectedSymptoms.delete(symptom);
        this.updateSelectedSymptomsList();
        this.updateSymptomsList();
        this.updateSelectedCount();
        this.updatePredictButton();
        
        this.showToast(`Removed "${this.formatSymptomName(symptom)}"`, 'warning');
        console.log(`✅ Removed symptom: ${symptom}`);
    }

    formatSymptomName(symptom) {
        return symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    clearAllSymptoms() {
        if (this.selectedSymptoms.size === 0) {
            this.showToast('No symptoms to clear', 'info');
            return;
        }
        
        const count = this.selectedSymptoms.size;
        this.selectedSymptoms.clear();
        this.updateSelectedSymptomsList();
        this.updateSymptomsList();
        this.updateSelectedCount();
        this.updatePredictButton();
        this.hideResults();
        
        this.showToast(`Cleared ${count} symptoms`, 'info');
        console.log(`🧹 Cleared all symptoms: ${count} removed`);
    }

    updateSelectedCount() {
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = this.selectedSymptoms.size;
        }
    }

    updatePredictButton() {
        const predictBtn = document.getElementById('predictBtn');
        if (predictBtn) {
            predictBtn.disabled = this.selectedSymptoms.size === 0;
        }
    }

    handleSymptomSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        const clearBtn = document.getElementById('clearSearch');
        
        if (clearBtn) {
            clearBtn.classList.toggle('show', query.length > 0);
        }

        if (query === '') {
            this.updateSymptomsList();
            return;
        }

        const filteredSymptoms = this.symptoms.filter(symptom => 
            symptom.toLowerCase().includes(query) && !this.selectedSymptoms.has(symptom)
        );

        const availableList = document.getElementById('availableSymptomsList');
        if (!availableList) return;

        availableList.innerHTML = '';
        
        if (filteredSymptoms.length === 0) {
            availableList.innerHTML = '<p class="no-symptoms">No matching symptoms found</p>';
            return;
        }

        filteredSymptoms.forEach(symptom => {
            const tag = this.createSymptomTag(symptom, false);
            availableList.appendChild(tag);
        });
        
        console.log(`🔍 Search results: ${filteredSymptoms.length} symptoms for "${query}"`);
    }

    clearSymptomSearch() {
        const searchInput = document.getElementById('symptomSearch');
        const clearBtn = document.getElementById('clearSearch');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        if (clearBtn) {
            clearBtn.classList.remove('show');
        }
        
        this.updateSymptomsList();
        console.log('🔍 Search cleared');
    }

    handleSymptomFilter(filter) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.updateSymptomsList(filter);
        console.log(`🔽 Applied filter: ${filter}`);
    }

    // FIXED: Enhanced disease prediction
    async predictDisease() {
        if (this.selectedSymptoms.size === 0) {
            this.showToast('Please select at least one symptom', 'warning');
            return;
        }

        const predictBtn = document.getElementById('predictBtn');
        if (predictBtn) {
            predictBtn.disabled = true;
            predictBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        }

        try {
            console.log(`🧠 Starting prediction for ${this.selectedSymptoms.size} symptoms:`, Array.from(this.selectedSymptoms));
            
            const response = await this.fetchAPI('/predict', {
                method: 'POST',
                body: JSON.stringify({
                    symptoms: Array.from(this.selectedSymptoms),
                    user_context: {
                        timestamp: new Date().toISOString(),
                        session_id: this.chatSessionId
                    }
                })
            });

            if (response.success) {
                this.currentPredictions = response;
                this.displayPredictionResults(response);
                this.showToast('✅ AI analysis completed successfully!', 'success');
                
                console.log('✅ Prediction successful:', response);
                
                setTimeout(() => {
                    this.scrollToResults();
                }, 500);
            } else {
                throw new Error(response.error || 'Prediction failed');
            }

        } catch (error) {
            console.error('❌ Prediction error:', error);
            this.showToast(`Failed to analyze symptoms: ${error.message}`, 'error');
        } finally {
            if (predictBtn) {
                predictBtn.disabled = this.selectedSymptoms.size === 0;
                predictBtn.innerHTML = '<i class="fas fa-brain"></i> Analyze Symptoms';
            }
        }
    }

    displayPredictionResults(response) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) {
            console.error('❌ Results section not found');
            return;
        }

        this.populatePredictionsTable(response.predictions);
        this.displayDiseaseDetails(response.top_prediction);

        resultsSection.style.display = 'block';
        setTimeout(() => {
            resultsSection.classList.add('show');
        }, 100);
        
        console.log('✅ Prediction results displayed');
    }

    populatePredictionsTable(predictions) {
        const tableBody = document.getElementById('predictionsTableBody');
        if (!tableBody || !predictions) {
            console.error('❌ Predictions table body not found');
            return;
        }

        tableBody.innerHTML = '';

        // Limit to top 5 predictions only
        const topPredictions = predictions.slice(0, 5);

        topPredictions.forEach((prediction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="rank-badge">#${prediction.rank}</span></td>
                <td><strong>${prediction.disease}</strong></td>
                <td>
                    <div class="confidence-bar">
                        <div class="confidence-progress">
                            <div class="confidence-fill" style="width: ${prediction.confidence}%"></div>
                        </div>
                        <span class="confidence-percentage">${prediction.confidence}%</span>
                    </div>
                </td>
                <td><span class="severity-badge severity-${prediction.severity.toLowerCase()}">${prediction.severity}</span></td>
                <td><span class="urgency-badge urgency-${prediction.urgency.toLowerCase()}">${prediction.urgency}</span></td>
            `;
            
            row.style.cursor = 'pointer';
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            tableBody.appendChild(row);
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
                row.style.transition = 'all 0.3s ease';
            }, index * 100);
        });
        
        console.log(`✅ Populated predictions table with ${topPredictions.length} results`);
    }

    displayDiseaseDetails(diseaseInfo) {
        const detailsContainer = document.getElementById('diseaseDetails');
        if (!detailsContainer || !diseaseInfo) {
            console.error('❌ Disease details container not found');
            return;
        }

        detailsContainer.innerHTML = `
            <div class="disease-header">
                <h3 class="disease-name">${diseaseInfo.disease}</h3>
                <div class="disease-confidence">
                    AI Confidence: ${diseaseInfo.confidence}% | Severity: ${diseaseInfo.severity} | Urgency: ${diseaseInfo.urgency}
                </div>
            </div>
            
            <div class="recommendations-grid">
                <div class="recommendation-section">
                    <h4>
                        <i class="fas fa-shield-alt"></i>
                        Recommended Precautions
                    </h4>
                    <ul class="recommendation-list">
                        ${diseaseInfo.precautions.map(precaution => 
                            `<li>${precaution}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="recommendation-section">
                    <h4>
                        <i class="fas fa-leaf"></i>
                        Home Remedies
                    </h4>
                    <ul class="recommendation-list">
                        ${diseaseInfo.home_remedies.map(remedy => 
                            `<li>${remedy}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        console.log(`✅ Displayed disease details for: ${diseaseInfo.disease}`);
    }

    // ========== OTHER FUNCTIONALITY ==========

    async performDiseaseLookup() {
        const lookupInput = document.getElementById('diseaseLookup');
        const resultsContainer = document.getElementById('lookupResults');
        
        if (!lookupInput || !resultsContainer) return;

        const disease = lookupInput.value.trim();
        if (!disease) {
            this.showToast('Please enter a disease name', 'warning');
            return;
        }

        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';

        try {
            const response = await this.fetchAPI('/disease-lookup', {
                method: 'POST',
                body: JSON.stringify({ disease })
            });

            if (response.success) {
                this.displayLookupResults(response, resultsContainer);
            } else {
                resultsContainer.innerHTML = `
                    <div class="lookup-error">
                        <p>${response.error}</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error('❌ Lookup error:', error);
            resultsContainer.innerHTML = `
                <div class="lookup-error">
                    <p>Failed to lookup disease. Please try again.</p>
                </div>
            `;
        }
    }

    displayLookupResults(response, container) {
        container.innerHTML = `
            <div class="lookup-result">
                <h4>${response.disease}</h4>
                <p>${response.description}</p>
                
                <div class="lookup-recommendations">
                    <h5><i class="fas fa-shield-alt"></i> Precautions:</h5>
                    <ul>
                        ${response.precautions.slice(0, 3).map(precaution => 
                            `<li>${precaution}</li>`
                        ).join('')}
                    </ul>
                    
                    <h5><i class="fas fa-leaf"></i> Home Remedies:</h5>
                    <ul>
                        ${response.home_remedies.slice(0, 3).map(remedy => 
                            `<li>${remedy}</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    async calculateBMI() {
        const height = parseFloat(document.getElementById('height')?.value);
        const weight = parseFloat(document.getElementById('weight')?.value);
        
        if (!height || !weight || height <= 0 || weight <= 0) {
            this.showToast('Please enter valid height and weight values', 'warning');
            return;
        }

        try {
            const response = await this.fetchAPI('/bmi-calculator', {
                method: 'POST',
                body: JSON.stringify({ height, weight })
            });

            if (response.success) {
                this.displayBMIResults(response);
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            console.error('❌ BMI calculation error:', error);
            this.showToast('Failed to calculate BMI', 'error');
        }
    }

    displayBMIResults(response) {
        const resultsContainer = document.getElementById('bmiResults');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="bmi-result">
                <div class="bmi-score">
                    <span class="bmi-value">${response.bmi}</span>
                    <span class="bmi-label">BMI</span>
                </div>
                <div class="bmi-category ${response.category.toLowerCase().replace(/\s+/g, '-')}">
                    ${response.category}
                </div>
                <div class="bmi-details">
                    <p><strong>Risk Level:</strong> ${response.risk_level}</p>
                    <p><strong>Ideal Weight Range:</strong> ${response.ideal_weight_range.min}kg - ${response.ideal_weight_range.max}kg</p>
                </div>
            </div>
        `;

        this.showToast(`BMI calculated: ${response.bmi} (${response.category})`, 'success');
    }

    async checkDrugInteractions() {
        const drug1 = document.getElementById('drug1')?.value.trim();
        const drug2 = document.getElementById('drug2')?.value.trim();
        
        if (!drug1 || !drug2) {
            this.showToast('Please enter both drug names', 'warning');
            return;
        }

        try {
            const response = await this.fetchAPI('/drug-interactions', {
                method: 'POST',
                body: JSON.stringify({ drugs: [drug1, drug2] })
            });

            if (response.success) {
                this.displayInteractionResults(response);
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            console.error('❌ Drug interaction check error:', error);
            this.showToast('Failed to check drug interactions', 'error');
        }
    }

    displayInteractionResults(response) {
        const resultsContainer = document.getElementById('interactionResults');
        if (!resultsContainer) return;

        if (response.interactions_found === 0) {
            resultsContainer.innerHTML = `
                <div class="interaction-safe">
                    <i class="fas fa-check-circle"></i>
                    <h4>No Known Interactions</h4>
                    <p>No significant interactions found between these medications.</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="interaction-found">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>${response.interactions_found} Interaction(s) Found</h4>
                    <p>Safety Level: <strong>${response.safety_level}</strong></p>
                </div>
            `;
        }

        this.showToast(`Found ${response.interactions_found} interactions`, response.interactions_found > 0 ? 'warning' : 'success');
    }

    populateEmergencyContacts(contacts) {
        const container = document.getElementById('emergencyContacts');
        if (!container || !contacts) return;

        container.innerHTML = '';
        
        Object.entries(contacts).forEach(([service, number]) => {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'emergency-contact';
            contactDiv.innerHTML = `
                <span class="service">${service}</span>
                <span class="number">${number}</span>
            `;
            
            contactDiv.addEventListener('click', () => {
                if (navigator.userAgent.match(/Mobile/)) {
                    window.location.href = `tel:${number.replace(/[^0-9]/g, '')}`;
                } else {
                    this.copyToClipboard(number);
                    this.showToast(`Copied ${number} to clipboard`, 'info');
                }
            });
            
            container.appendChild(contactDiv);
        });
    }

    populateHealthInstructions(instructions) {
        const container = document.getElementById('healthInstructions');
        if (!container || !instructions) return;

        container.innerHTML = '';
        
        instructions.forEach((instruction, index) => {
            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'instruction-item';
            instructionDiv.textContent = instruction;
            container.appendChild(instructionDiv);
        });
    }

    async downloadReport() {
        if (!this.currentPredictions) {
            this.showToast('No prediction data available to download', 'warning');
            return;
        }

        const reportContent = this.generateReportContent();
        const filename = `medpredictor_report_${new Date().toISOString().slice(0, 10)}.txt`;
        
        this.downloadFile(reportContent, filename);
        this.showToast('Report downloaded successfully!', 'success');
    }

    generateReportContent() {
        const data = this.currentPredictions;
        const lines = [
            "MedPredictor Health Report",
            "=" * 50,
            `Generated: ${new Date().toLocaleDateString()}`,
            `Session ID: ${this.chatSessionId}`,
            "",
            "Selected Symptoms:"
        ];

        data.selected_symptoms.forEach(symptom => {
            lines.push(`- ${symptom.replace(/_/g, ' ')}`);
        });

        lines.push("", "Top 5 Disease Predictions:");
        lines.push("Rank | Disease | Confidence | Severity");
        lines.push("-" * 50);

        data.predictions.slice(0, 5).forEach(pred => {
            lines.push(`${pred.rank} | ${pred.disease} | ${pred.confidence}% | ${pred.severity}`);
        });

        lines.push("", "DISCLAIMER: For educational purposes only.");
        lines.push("Always consult healthcare professionals.");

        return lines.join("\n");
    }

    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    resetSymptoms() {
        this.clearAllSymptoms();
        this.clearSymptomSearch();
        this.hideResults();
        
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        this.showToast('Symptom checker reset', 'info');
        console.log('🔄 Symptom checker reset');
    }

    hideResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
            resultsSection.classList.remove('show');
        }
        this.currentPredictions = null;
    }

    // ========== NAVIGATION & UI ==========

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            console.log(`🔗 Navigated to section: ${sectionId}`);
        }
    }

    scrollToResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection && resultsSection.style.display !== 'none') {
            this.scrollToSection('resultsSection');
        }
    }

    setActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const menuToggle = document.getElementById('mobileMenuToggle');
        
        if (navMenu && menuToggle) {
            navMenu.classList.toggle('show');
            menuToggle.classList.toggle('active');
        }
    }

    // ========== NOTIFICATIONS & UTILITIES ==========

    showToast(message, type = 'info', duration = 4000) {
        const toastContainer = this.getOrCreateToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove toast
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);
    }

    getOrCreateToastContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        this.showToast('Copied to clipboard', 'success');
    }

    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            const searchInput = document.getElementById('symptomSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        if (event.key === 'Escape') {
            this.clearSymptomSearch();
            this.hideChatSuggestions();
        }
        
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const predictBtn = document.getElementById('predictBtn');
            if (predictBtn && !predictBtn.disabled) {
                this.predictDisease();
            }
        }
        
        // Chat shortcuts
        if (event.key === 'Enter' && event.target.id === 'chatInput' && !event.shiftKey) {
            event.preventDefault();
            this.sendChatMessage();
        }
    }

    handleScroll() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
        }

        // Update active navigation
        const sections = ['home', 'checker', 'tools', 'chatbot', 'about'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    navLinks.forEach(link => {
                        link.classList.toggle('active', 
                            link.getAttribute('href') === `#${sectionId}`);
                    });
                }
            }
        });
    }

    handleResize() {
        if (window.innerWidth > 768) {
            const navMenu = document.querySelector('.nav-menu');
            const menuToggle = document.getElementById('mobileMenuToggle');
            
            if (navMenu) navMenu.classList.remove('show');
            if (menuToggle) menuToggle.classList.remove('active');
        }
    }
}

// Global functions
function scrollToSection(sectionId) {
    if (window.medPredictorApp) {
        window.medPredictorApp.scrollToSection(sectionId);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing Advanced MedPredictor...');
    window.medPredictorApp = new MedPredictorApp();
    
    // Global error handler
    window.addEventListener('unhandledrejection', event => {
        console.error('❌ Unhandled promise rejection:', event.reason);
        if (window.medPredictorApp) {
            window.medPredictorApp.showToast('An unexpected error occurred', 'error');
        }
    });
    
    window.addEventListener('error', event => {
        console.error('❌ Global error:', event.error);
        if (window.medPredictorApp) {
            window.medPredictorApp.showToast('An unexpected error occurred', 'error');
        }
    });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedPredictorApp;
}
