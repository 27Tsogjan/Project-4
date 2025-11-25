# Spell Checker Project - AI Coding Instructions

## Project Overview
This is a CS 340 educational project implementing a spell checker that detects misspelled words and suggests corrections using the **edit distance algorithm** (Levenshtein distance). The system architecture consists of three components:

- **SpellChecker.cpp**: C++ backend implementing the edit distance algorithm and word checking logic
- **dictionary.txt**: 7000+ word reference dictionary (line-separated, lowercase)
- **SC.html/SC.css**: Web interface (currently under development)

## Core Algorithm Pattern
The edit distance algorithm (`opt` function in SpellChecker.cpp) uses dynamic programming with a 2D table where:
- **Rows represent characters** from the misspelled word
- **Columns represent characters** from dictionary words
- **Cell values** store minimum cost of transformations (insertions, deletions, substitutions)

When implementing or fixing this function:
1. Initialize first row/column with increasing costs (0, 1, 2, ...)
2. Use nested loops to fill remaining cells with: `min(substitution_cost, insertion_cost, deletion_cost)`
3. Return bottom-right cell value as final distance
4. Typically accept corrections with distance ≤ 2 for better UX

Example from incomplete code in SpellChecker.cpp - the function signature and loop structure suggest dynamic programming, not simple comparison.

## Critical Data Structures
- **arr[][]**: 2D DP table for edit distance computation
- **dictionary.txt**: Source of truth for valid words; assume lowercase, one word per line
- Word comparison always uses lowercase to match dictionary format

## Build & Execution Patterns
- Compile: `g++ -o SpellChecker SpellChecker.cpp` (standard C++ compilation)
- Input handling: Read from file or stdin; loop through lines checking each word
- Performance consideration: Dictionary iteration happens per misspelled word, so consider caching or preprocessing

## Common Implementation Gaps
The incomplete SpellChecker.cpp shows:
- `opt()` function body is empty (fill with DP logic)
- Array dimensions lack size values (determine from input/dictionary size)
- Loop bounds have missing conditions (should be word lengths + 1)

When completing this code:
1. Read dictionary.txt line-by-line into a data structure
2. For each misspelled word, compute edit distance to all dictionary words
3. Filter suggestions by distance threshold and return closest matches
4. Handle edge cases: empty strings, single characters, very long words

## Integration Points
- **Input Source**: Likely stdin or file input (see SC.html for UI binding)
- **Dictionary Loading**: Single file load at program start (7000+ words - ~0.1s load time)
- **Output Format**: Suggestions ranked by edit distance (ascending)

## HTML/CSS Role
SC.html/SC.css provide the web interface - expect to:
- Send user input text to SpellChecker backend (via form or AJAX)
- Display suggestions in ranked order
- Highlight misspelled words and offer replacements

## GitHub Pages Deployment
The project includes a complete GitHub Pages website for instructor review:
- **_config.yml**: Jekyll configuration using cayman theme
- **spell_checker.js**: JavaScript implementation of edit distance algorithm with dictionary loading
- **SC.html/SC.css**: Interactive web interface with professional styling
- **dictionary.txt**: Pre-loaded into browser for spell checking

### To Deploy:
1. Push all files to GitHub repository
2. Enable GitHub Pages in repository settings (Settings → Pages → Source: main branch)
3. Visit `https://[username].github.io/[repo]` to access the spell checker

### Key Features:
- Real-time spell checking with edit distance algorithm (Levenshtein)
- Clickable suggestions to replace misspelled words
- Responsive design works on desktop and mobile
- Loads 7,000+ word dictionary on page load (~100ms)
- Distance threshold of 2 for balanced accuracy and UX
