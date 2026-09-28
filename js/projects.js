/**
 * Yashmit Kumar - Portfolio Interactive Project Simulators
 * 1. Dictionary Web Application Simulator (with Speech & API)
 * 2. PassGuard Cryptographic Password Generator
 * 3. Number Guessing Game (C Logic Engine Port)
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. DICTIONARY WEB APPLICATION ENGINE
     ========================================================================== */
  class DictionaryApp {
    constructor() {
      this.form = document.getElementById('dictForm');
      this.input = document.getElementById('dictInput');
      this.resultContainer = document.getElementById('dictResult');
      this.loadingEl = document.getElementById('dictLoading');
      this.quickChips = document.querySelectorAll('.quick-word-chip');

      // Built-in lexical fallback in case of network restriction or offline use
      this.fallbackDB = {
        developer: {
          word: 'developer',
          phonetic: '/dɪˈvɛləpər/',
          partOfSpeech: 'noun',
          definition: 'A person who designs, writes, and debugs computer code to create software applications and systems.',
          example: 'Yashmit is an ambitious Full Stack Developer creating responsive web applications.',
          synonyms: ['programmer', 'software engineer', 'coder', 'architect']
        },
        technology: {
          word: 'technology',
          phonetic: '/tɛkˈnɒlədʒi/',
          partOfSpeech: 'noun',
          definition: 'The application of scientific knowledge for practical purposes, especially in computing and engineering.',
          example: 'Rapid advancements in technology drive modern web innovation.',
          synonyms: ['engineering', 'computing', 'automation', 'mechanisms']
        },
        encryption: {
          word: 'encryption',
          phonetic: '/ɪnˈkrɪpʃən/',
          partOfSpeech: 'noun',
          definition: 'The process of encoding information so that only authorized parties can access and decode it.',
          example: 'Robust encryption secures sensitive credentials across backend APIs.',
          synonyms: ['cipher', 'cryptography', 'encoding', 'data protection']
        },
        database: {
          word: 'database',
          phonetic: '/ˈdeɪtəbeɪs/',
          partOfSpeech: 'noun',
          definition: 'A structured set of data held in a computer, especially one that is accessible in various ways.',
          example: 'He modeled relational tables in MySQL and documents in MongoDB.',
          synonyms: ['datastore', 'repository', 'archive', 'records']
        },
        javascript: {
          word: 'javascript',
          phonetic: '/ˈdʒɑːvəskrɪpt/',
          partOfSpeech: 'proper noun',
          definition: 'A high-level, dynamic, and multi-paradigm programming language that powers the interactive modern web.',
          example: 'JavaScript fuels modern web applications across both front-end and back-end runtimes.',
          synonyms: ['JS', 'ECMAScript', 'scripting language']
        },
        security: {
          word: 'security',
          phonetic: '/sɪˈkjʊərɪti/',
          partOfSpeech: 'noun',
          definition: 'The state of being free from threat, unauthorized access, data compromise, or vulnerability exploitation.',
          example: 'Cyber security principles guide defensive application architecture.',
          synonyms: ['defense', 'protection', 'safeguard', 'immunity']
        },
        algorithm: {
          word: 'algorithm',
          phonetic: '/ˈælɡərɪðəm/',
          partOfSpeech: 'noun',
          definition: 'A finite sequence of well-defined computer-implementable instructions to solve a class of specific problems.',
          example: 'Efficient algorithms reduce computational complexity and enhance application latency.',
          synonyms: ['procedure', 'logic', 'formula', 'heuristic']
        }
      };

      this.init();
    }

    init() {
      if (!this.form || !this.input || !this.resultContainer) return;

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = this.input.value.trim().toLowerCase();
        if (word) this.searchWord(word);
      });

      this.quickChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const word = chip.getAttribute('data-word');
          this.input.value = word;
          this.searchWord(word);
          if (window.sfx) window.sfx.play('click');
        });
      });

      // Default load
      this.searchWord('developer');
    }

    async searchWord(word) {
      this.setLoading(true);
      if (window.sfx) window.sfx.play('click');

      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        if (!response.ok) throw new Error('Not found in public lexical API');
        const data = await response.json();
        this.renderApiResult(data[0]);
      } catch (err) {
        // Use fallback if present
        if (this.fallbackDB[word]) {
          this.renderFallbackResult(this.fallbackDB[word]);
        } else {
          this.renderNotFound(word);
        }
      } finally {
        this.setLoading(false);
      }
    }

    setLoading(isLoading) {
      if (this.loadingEl) {
        this.loadingEl.classList.toggle('hidden', !isLoading);
      }
      if (isLoading) {
        this.resultContainer.innerHTML = '';
      }
    }

    speakWord(wordText) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        if (window.sfx) window.sfx.play('launch');
      } else {
        if (window.showToast) window.showToast('Audio synthesis not supported by this browser.');
      }
    }

    renderApiResult(entry) {
      const word = entry.word || 'Word';
      let phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) || '';
      const meaning = entry.meanings && entry.meanings[0];
      const partOfSpeech = meaning ? meaning.partOfSpeech : 'definition';
      const defObj = (meaning && meaning.definitions && meaning.definitions[0]) || {};
      const definition = defObj.definition || 'No definition available.';
      const example = defObj.example || '';
      const synonyms = (meaning && meaning.synonyms && meaning.synonyms.slice(0, 4)) || [];

      // Audio file if available
      let audioUrl = null;
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (p.audio && p.audio.length > 0) {
            audioUrl = p.audio;
            break;
          }
        }
      }

      this.renderHTML(word, phonetic, partOfSpeech, definition, example, synonyms, audioUrl);
    }

    renderFallbackResult(data) {
      this.renderHTML(
        data.word,
        data.phonetic,
        data.partOfSpeech,
        data.definition,
        data.example,
        data.synonyms,
        null
      );
    }

    renderHTML(word, phonetic, partOfSpeech, definition, example, synonyms, audioUrl) {
      const synonymsHTML = synonyms.length > 0 
        ? `<div style="margin-top: 1rem;"><strong style="font-size: 0.8rem; color: #a855f7;">Synonyms:</strong> <span style="font-size: 0.85rem; color: #94a3b8;">${synonyms.join(', ')}</span></div>`
        : '';

      const exampleHTML = example
        ? `<div class="dict-example-text">"${example}"</div>`
        : '';

      this.resultContainer.innerHTML = `
        <div class="dict-result-card">
          <div class="dict-header-row">
            <div>
              <span class="dict-word-val">${word}</span>
              ${phonetic ? `<span class="phonetic" style="margin-left: 0.5rem; font-family: monospace; color: #00f5d4;">${phonetic}</span>` : ''}
            </div>
            <button class="dict-audio-btn" id="playAudioBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>Pronounce</span>
            </button>
          </div>
          <span class="dict-pos-tag">${partOfSpeech}</span>
          <p class="dict-meaning-text">${definition}</p>
          ${exampleHTML}
          ${synonymsHTML}
        </div>
      `;

      const audioBtn = document.getElementById('playAudioBtn');
      if (audioBtn) {
        audioBtn.addEventListener('click', () => {
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(() => this.speakWord(word));
          } else {
            this.speakWord(word);
          }
        });
      }
    }

    renderNotFound(word) {
      this.resultContainer.innerHTML = `
        <div class="dict-result-card" style="text-align: center; border-color: rgba(244, 63, 94, 0.4);">
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h4 style="color: #fff; margin-bottom: 0.4rem;">Word Not Found: "${word}"</h4>
          <p style="font-size: 0.88rem; color: #94a3b8;">Try words like: <em>developer, algorithm, encryption, technology, security, database</em>.</p>
        </div>
      `;
    }
  }

  /* ==========================================================================
     2. PASSGUARD CRYPTOGRAPHIC PASSWORD GENERATOR
     ========================================================================== */
  class PasswordGenerator {
    constructor() {
      this.slider = document.getElementById('passLengthSlider');
      this.lenDisplay = document.getElementById('passLengthValue');
      this.output = document.getElementById('generatedPasswordOutput');
      this.copyBtn = document.getElementById('copyPassBtn');
      this.regenBtn = document.getElementById('regeneratePassBtn');
      this.actionBtn = document.getElementById('generateNewPassActionBtn');
      
      this.chkUpper = document.getElementById('chkUpper');
      this.chkLower = document.getElementById('chkLower');
      this.chkNumbers = document.getElementById('chkNumbers');
      this.chkSymbols = document.getElementById('chkSymbols');

      this.strengthText = document.getElementById('strengthText');
      this.strengthFill = document.getElementById('strengthBarFill');

      this.chars = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
      };

      this.init();
    }

    init() {
      if (!this.slider || !this.output) return;

      // Slider listener
      this.slider.addEventListener('input', () => {
        this.lenDisplay.textContent = this.slider.value;
        this.generate();
      });

      // Checkbox listeners
      [this.chkUpper, this.chkLower, this.chkNumbers, this.chkSymbols].forEach((chk) => {
        chk.addEventListener('change', () => {
          this.ensureAtLeastOneChecked(chk);
          this.generate();
        });
      });

      // Buttons
      if (this.regenBtn) {
        this.regenBtn.addEventListener('click', () => {
          this.generate();
          if (window.sfx) window.sfx.play('click');
        });
      }
      if (this.actionBtn) {
        this.actionBtn.addEventListener('click', () => {
          this.generate();
          if (window.sfx) window.sfx.play('launch');
        });
      }

      // Copy to clipboard
      if (this.copyBtn) {
        this.copyBtn.addEventListener('click', () => {
          const pass = this.output.textContent;
          if (!pass) return;
          navigator.clipboard.writeText(pass).then(() => {
            if (window.sfx) window.sfx.play('success');
            if (window.showToast) window.showToast('Secure Password copied to clipboard! 🔒');
          });
        });
      }

      // Generate initial password
      this.generate();
    }

    ensureAtLeastOneChecked(changedChk) {
      const anyChecked = this.chkUpper.checked || this.chkLower.checked || this.chkNumbers.checked || this.chkSymbols.checked;
      if (!anyChecked) {
        changedChk.checked = true;
        if (window.showToast) window.showToast('At least one character pool must remain selected.');
      }
    }

    generate() {
      const length = parseInt(this.slider.value, 10);
      let pool = '';
      let guaranteed = [];

      if (this.chkUpper.checked) {
        pool += this.chars.upper;
        guaranteed.push(this.getRandomChar(this.chars.upper));
      }
      if (this.chkLower.checked) {
        pool += this.chars.lower;
        guaranteed.push(this.getRandomChar(this.chars.lower));
      }
      if (this.chkNumbers.checked) {
        pool += this.chars.numbers;
        guaranteed.push(this.getRandomChar(this.chars.numbers));
      }
      if (this.chkSymbols.checked) {
        pool += this.chars.symbols;
        guaranteed.push(this.getRandomChar(this.chars.symbols));
      }

      if (!pool) pool = this.chars.lower;

      let passwordArr = [...guaranteed];
      const remaining = length - passwordArr.length;

      for (let i = 0; i < remaining; i++) {
        passwordArr.push(this.getRandomChar(pool));
      }

      // Fisher-Yates cryptographic shuffle
      for (let i = passwordArr.length - 1; i > 0; i--) {
        const j = Math.floor(this.getCryptoRandom() * (i + 1));
        [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
      }

      const finalPass = passwordArr.join('');
      this.output.textContent = finalPass;
      this.evaluateStrength(finalPass);
    }

    getCryptoRandom() {
      if (window.crypto && window.crypto.getRandomValues) {
        const arr = new Uint32Array(1);
        window.crypto.getRandomValues(arr);
        return arr[0] / (0xffffffff + 1);
      }
      return Math.random();
    }

    getRandomChar(str) {
      const index = Math.floor(this.getCryptoRandom() * str.length);
      return str.charAt(index);
    }

    evaluateStrength(pass) {
      let score = 0;
      if (pass.length >= 8) score += 20;
      if (pass.length >= 12) score += 20;
      if (pass.length >= 16) score += 15;
      if (pass.length >= 24) score += 10;
      if (/[A-Z]/.test(pass)) score += 10;
      if (/[a-z]/.test(pass)) score += 10;
      if (/[0-9]/.test(pass)) score += 10;
      if (/[^A-Za-z0-9]/.test(pass)) score += 15;

      score = Math.min(score, 100);

      this.strengthFill.style.width = `${score}%`;

      if (score < 40) {
        this.strengthFill.style.background = '#f43f5e';
        this.strengthText.textContent = 'Weak (Increase length/types)';
        this.strengthText.style.color = '#f43f5e';
      } else if (score < 70) {
        this.strengthFill.style.background = '#f59e0b';
        this.strengthText.textContent = 'Moderate (Good for standard logins)';
        this.strengthText.style.color = '#f59e0b';
      } else if (score < 90) {
        this.strengthFill.style.background = '#10b981';
        this.strengthText.textContent = 'Strong (High Security)';
        this.strengthText.style.color = '#10b981';
      } else {
        this.strengthFill.style.background = '#00f5d4';
        this.strengthText.textContent = 'Cyber Fortress (Military Grade 🛡️)';
        this.strengthText.style.color = '#00f5d4';
      }
    }
  }

  /* ==========================================================================
     3. NUMBER GUESSING GAME (C LOGIC ENGINE WEB PORT)
     ========================================================================== */
  class NumberGuessGame {
    constructor() {
      this.screen = document.getElementById('arcadeScreen');
      this.form = document.getElementById('gameGuessForm');
      this.input = document.getElementById('gameGuessInput');
      this.attemptCountEl = document.getElementById('gameAttemptCount');
      this.bestScoreEl = document.getElementById('gameBestScore');
      this.resetBtn = document.getElementById('gameResetBtn');

      this.targetNumber = 0;
      this.attempts = 0;
      this.isGameOver = false;

      this.init();
    }

    init() {
      if (!this.screen || !this.form || !this.input) return;

      const savedBest = localStorage.getItem('yk_game_best');
      if (savedBest) this.bestScoreEl.textContent = `${savedBest} tries`;

      this.resetGame();

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleGuess();
      });

      if (this.resetBtn) {
        this.resetBtn.addEventListener('click', () => {
          this.resetGame();
          if (window.sfx) window.sfx.play('click');
        });
      }
    }

    resetGame() {
      this.targetNumber = Math.floor(Math.random() * 100) + 1;
      this.attempts = 0;
      this.isGameOver = false;
      this.attemptCountEl.textContent = '0';
      this.input.value = '';
      this.input.disabled = false;

      this.screen.innerHTML = `
        <div class="terminal-line"><span class="t-prompt">&gt;</span> [SYSTEM_INIT]: Loading C algorithmic engine...</div>
        <div class="terminal-line"><span class="t-prompt">&gt;</span> [RAND_GEN]: Secret target chosen in interval [1..100].</div>
        <div class="terminal-line text-cyan"><span class="t-prompt">&gt;</span> Game started. Enter your numeric guess below!</div>
      `;
    }

    handleGuess() {
      if (this.isGameOver) {
        this.resetGame();
        return;
      }

      const val = parseInt(this.input.value, 10);
      if (isNaN(val) || val < 1 || val > 100) {
        this.appendLine(`[INPUT_ERR]: Value must be between 1 and 100.`, 'text-danger');
        if (window.sfx) window.sfx.play('click');
        return;
      }

      this.attempts++;
      this.attemptCountEl.textContent = this.attempts;
      this.input.value = '';
      this.input.focus();

      const diff = Math.abs(val - this.targetNumber);

      if (val === this.targetNumber) {
        // BULLSEYE
        this.isGameOver = true;
        this.input.disabled = true;
        if (window.sfx) window.sfx.play('success');

        this.appendLine(`Guess #${this.attempts}: [${val}] -> 🎯 BULLSEYE! CORRECT TARGET!`, 'text-cyan');
        this.appendLine(`[VICTORY]: Engine solved in ${this.attempts} attempt(s)! Press 'Restart' to play again.`, 'text-cyan');
        if (window.showToast) window.showToast(`🎉 Bullseye! You guessed ${val} in ${this.attempts} tries!`);

        // Check Best Record
        const currentBest = parseInt(localStorage.getItem('yk_game_best'), 10);
        if (!currentBest || this.attempts < currentBest) {
          localStorage.setItem('yk_game_best', this.attempts);
          this.bestScoreEl.textContent = `${this.attempts} tries (NEW BEST!)`;
        }
      } else {
        if (window.sfx) window.sfx.play('click');
        let hint = val > this.targetNumber ? '⬇️ TOO HIGH!' : '⬆️ TOO LOW!';
        let proximity = '';

        if (diff <= 3) proximity = ' (🔥 BOILING HOT! Within 3!)';
        else if (diff <= 10) proximity = ' (🔥 Warm! Within 10!)';
        else if (diff >= 30) proximity = ' (❄️ Freezing Cold! More than 30 away!)';

        this.appendLine(`Guess #${this.attempts}: [${val}] -> ${hint}${proximity}`);
      }
    }

    appendLine(text, className = '') {
      const line = document.createElement('div');
      line.className = `terminal-line ${className}`;
      line.innerHTML = `<span class="t-prompt">&gt;</span> ${text}`;
      this.screen.appendChild(line);
      this.screen.scrollTop = this.screen.scrollHeight;
    }
  }

  /* ==========================================================================
     INITIALIZE ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    new DictionaryApp();
    new PasswordGenerator();
    new NumberGuessGame();
  });

})();
