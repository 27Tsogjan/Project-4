// Spell Checker - Edit Distance Algorithm Implementation
class SpellChecker {
    constructor() {
        this.dictionary = [];
        this.distanceThreshold = 2;
        this.maxSuggestions = 5;
        this.isLoading = false;
    }

    // Load dictionary from dictionary.txt
    async loadDictionary() {
        try {
            this.isLoading = true;
            const response = await fetch('dictionary.txt');
            const text = await response.text();
            this.dictionary = text
                .split('\n')
                .map(word => word.trim().toLowerCase())
                .filter(word => word.length > 0);
            console.log(`Dictionary loaded: ${this.dictionary.length} words`);
        } catch (error) {
            console.error('Error loading dictionary:', error);
            alert('Could not load dictionary. The spell checker may not work properly.');
        } finally {
            this.isLoading = false;
        }
    }

    // Calculate edit distance (Levenshtein distance) between two words
    editDistance(word1, word2) {
        const m = word1.length;
        const n = word2.length;
        
        // Create DP table
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        // Initialize first row and column
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        
        // Fill the DP table
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (word1[i - 1] === word2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    const substitution = dp[i - 1][j - 1] + 1;
                    const insertion = dp[i][j - 1] + 1;
                    const deletion = dp[i - 1][j] + 1;
                    dp[i][j] = Math.min(substitution, insertion, deletion);
                }
            }
        }
        
        return dp[m][n];
    }

    // Find suggestions for a misspelled word
    findSuggestions(misspelledWord) {
        if (misspelledWord.length === 0) return [];
        
        const suggestions = [];
        
        for (const dictWord of this.dictionary) {
            const distance = this.editDistance(misspelledWord, dictWord);
            
            if (distance <= this.distanceThreshold) {
                suggestions.push({
                    word: dictWord,
                    distance: distance
                });
            }
        }
        
        // Sort by distance and limit results
        return suggestions
            .sort((a, b) => a.distance - b.distance)
            .slice(0, this.maxSuggestions);
    }

    // Check entire text for misspelled words
    checkText(text) {
        const words = text
            .toLowerCase()
            .match(/\b[a-z'-]+\b/g) || [];
        
        const results = {};
        
        for (const word of words) {
            // Skip if already processed or if it's in dictionary
            if (results[word] || this.dictionary.includes(word)) {
                continue;
            }
            
            const suggestions = this.findSuggestions(word);
            
            if (suggestions.length > 0) {
                results[word] = suggestions;
            }
        }
        
        return results;
    }
}

// Initialize spell checker
const spellChecker = new SpellChecker();

// DOM Elements
const inputText = document.getElementById('inputText');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const statusMessage = document.getElementById('statusMessage');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const emptyState = document.getElementById('emptyState');

// Event Listeners
checkBtn.addEventListener('click', performSpellCheck);
clearBtn.addEventListener('click', clearAll);
inputText.addEventListener('keypress', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        performSpellCheck();
    }
});

// Main spell check function
function performSpellCheck() {
    const text = inputText.value.trim();
    
    if (!text) {
        statusMessage.textContent = 'Please enter some text to check.';
        statusMessage.className = 'status info';
        resultsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        return;
    }
    
    // Show loading state
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    
    // Perform check (simulate async operation)
    setTimeout(() => {
        const misspelledWords = spellChecker.checkText(text);
        displayResults(misspelledWords, text);
        
        checkBtn.disabled = false;
        checkBtn.textContent = 'Check Spelling';
    }, 100);
}

// Display results
function displayResults(misspelledWords, originalText) {
    const wordCount = originalText.toLowerCase().match(/\b[a-z'-]+\b/g)?.length || 0;
    const misspelledCount = Object.keys(misspelledWords).length;
    
    if (misspelledCount === 0) {
        statusMessage.textContent = `✓ Perfect! All ${wordCount} words are spelled correctly.`;
        statusMessage.className = 'status success';
        suggestionsContainer.innerHTML = '';
        resultsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        return;
    }
    
    statusMessage.textContent = `Found ${misspelledCount} misspelled word(s) out of ${wordCount} total words.`;
    statusMessage.className = 'status error';
    
    suggestionsContainer.innerHTML = '';
    
    for (const [misspelled, suggestions] of Object.entries(misspelledWords)) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'misspelled-word';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'word-header';
        
        const misspelledSpan = document.createElement('span');
        misspelledSpan.className = 'misspelled';
        misspelledSpan.textContent = `"${misspelled}"`;
        
        headerDiv.appendChild(misspelledSpan);
        
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.innerHTML = '<strong>Suggestions:</strong>';
        
        const listDiv = document.createElement('div');
        listDiv.className = 'suggestions-list';
        
        for (const suggestion of suggestions) {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <span>${suggestion.word}</span>
                <span class="distance">(distance: ${suggestion.distance})</span>
            `;
            suggestionItem.style.cursor = 'pointer';
            suggestionItem.addEventListener('click', () => {
                replaceWord(misspelled, suggestion.word);
            });
            listDiv.appendChild(suggestionItem);
        }
        
        suggestionsDiv.appendChild(listDiv);
        
        wordDiv.appendChild(headerDiv);
        wordDiv.appendChild(suggestionsDiv);
        suggestionsContainer.appendChild(wordDiv);
    }
    
    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

// Replace word in text
function replaceWord(oldWord, newWord) {
    const regex = new RegExp(`\\b${oldWord}\\b`, 'gi');
    inputText.value = inputText.value.replace(regex, newWord);
    // Re-check after replacement
    performSpellCheck();
}

// Clear everything
function clearAll() {
    inputText.value = '';
    resultsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    suggestionsContainer.innerHTML = '';
    statusMessage.innerHTML = '';
    inputText.focus();
}

// Load dictionary on page load
document.addEventListener('DOMContentLoaded', () => {
    spellChecker.loadDictionary();
    inputText.focus();
});
