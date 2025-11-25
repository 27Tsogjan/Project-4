class SpellChecker {
    constructor() {
        this.dictionary = [];
    }

    async loadDictionary() {
        const response = await fetch('dictionary.txt');
        const text = await response.text();
        this.dictionary = text
            .split('\n')
            .map(word => word.trim().toLowerCase())
            .filter(word => word.length > 0);
            console.log(`Dictionary loaded: ${this.dictionary.length} words`);
    }

    isVowel(char) {
        return 'aeiou'.includes(char);
    }

    getMismatchPenalty(char1, char2) {
        const vowels = 'aeiou';
        const char1IsVowel = vowels.includes(char1);
        const char2IsVowel = vowels.includes(char2);
        
        // Match: penalty 0
        if (char1 === char2) {
            return 0;
        }
        
        // Mismatch vowel/vowel: penalty 1
        if (char1IsVowel && char2IsVowel) {
            return 1;
        }
        
        // Mismatch consonant/consonant: penalty 1
        if (!char1IsVowel && !char2IsVowel) {
            return 1;
        }
        
        // Mismatch vowel/consonant or consonant/vowel: penalty 3
        return 3;
    }

    editDistance(word1, word2) {
        const m = word1.length;
        const n = word2.length;
        const opt = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        const GAP_PENALTY = 2;
        
        // Initialize first row and column with gap penalties
        for (let i = 0; i <= m; i++) {
            opt[i][0] = i * GAP_PENALTY;
        }
        for (let j = 0; j <= n; j++) {
            opt[0][j] = j * GAP_PENALTY;
        }
        
        // Fill the DP table using Sequence Alignment
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const penalty = this.getMismatchPenalty(word1[i - 1], word2[j - 1]);
                opt[i][j] = Math.min(
                    opt[i - 1][j - 1] + penalty,       // substitution with custom penalty
                    opt[i][j - 1] + GAP_PENALTY,       // insertion (gap)
                    opt[i - 1][j] + GAP_PENALTY        // deletion (gap)
                );
            }
        }
        return opt[m][n];
    }

    // Get top 10 closest words
    getTopSuggestions(word) {
        const suggestions = this.dictionary.map(dictWord => ({
            word: dictWord,
            distance: this.editDistance(word, dictWord)
        }));
        
        return suggestions
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10);
    }

    checkText(word) {
        const results = {};
        results[word] = this.getTopSuggestions(word);
        return results;
    }
}

const spellChecker = new SpellChecker();

const inputWord = document.getElementById('inputWord');
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsContainer = document.getElementById('resultsContainer');
const statusMessage = document.getElementById('statusMessage');
const suggestionsContainer = document.getElementById('suggestionsContainer');
const emptyState = document.getElementById('emptyState');

checkBtn.addEventListener('click', SpellCheck);
clearBtn.addEventListener('click', clearAll);
inputWord.addEventListener('keypress', (e) => {
    if (e.ctrlKey || e.key === 'Enter') SpellCheck();
});

function SpellCheck() {
    const word = inputWord.value.trim();
    if (!word) {
        statusMessage.textContent = 'Enter word to check.';
        statusMessage.className = 'status info';
        resultsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
        return;
    }
    
    checkBtn.disabled = true;
    checkBtn.textContent = 'Checking...';
    
    displayResults(spellChecker.checkText(word), word);
    checkBtn.disabled = false;
    checkBtn.textContent = 'Check';
}

function displayResults(results, word) {
    clearAll();
    
    for (const [inputWord, suggestions] of Object.entries(results)) {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'misspelled-word';
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'misspelled';
        wordSpan.textContent = `"${inputWord}"`;
        
        const listDiv = document.createElement('div');
        listDiv.className = 'suggestions-list';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `<span>${suggestion.word}</span><span class="distance">${suggestion.distance}</span>`;
            listDiv.appendChild(item);
        });
        
        wordDiv.appendChild(wordSpan);
        wordDiv.appendChild(listDiv);
        suggestionsContainer.appendChild(wordDiv);
    }
    
    resultsContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

function clearAll() {
    inputText.value = '';
    resultsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    suggestionsContainer.innerHTML = '';
    statusMessage.innerHTML = '';
    inputText.focus();
}

document.addEventListener('DOMContentLoaded', () => {
    spellChecker.loadDictionary();
    inputText.focus();
});
