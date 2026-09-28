/**
 * Yashmit Kumar - Portfolio Interactive Developer Hacker Terminal (CLI)
 * Keyboard Shortcut: `~` (Tilde) or click '>_ CLI' button in navbar
 */

(function () {
  'use strict';

  class CyberTerminal {
    constructor() {
      this.overlay = document.getElementById('terminalOverlay');
      this.output = document.getElementById('terminalOutput');
      this.input = document.getElementById('terminalInput');
      this.toggleBtn = document.getElementById('terminalToggleBtn');
      this.closeBtn = document.getElementById('closeTerminalBtn');
      this.closeXBtn = document.getElementById('closeTerminalXBtn');

      this.commandHistory = [];
      this.historyIndex = -1;

      this.commands = {
        help: {
          desc: 'List all available terminal commands',
          execute: () => this.cmdHelp()
        },
        about: {
          desc: 'Display professional developer bio and background',
          execute: () => this.cmdAbout()
        },
        bio: {
          desc: 'Alias for about',
          execute: () => this.cmdAbout()
        },
        skills: {
          desc: 'Display technical competencies & stack inventory',
          execute: () => this.cmdSkills()
        },
        projects: {
          desc: 'Showcase engineered applications and deployments',
          execute: () => this.cmdProjects()
        },
        education: {
          desc: 'Display university and degree credentials',
          execute: () => this.cmdEducation()
        },
        certs: {
          desc: 'List industry credentials and bootcamps',
          execute: () => this.cmdCerts()
        },
        contact: {
          desc: 'Get direct email, phone, and social endpoints',
          execute: () => this.cmdContact()
        },
        hire: {
          desc: 'Why you should hire Yashmit Kumar for your team',
          execute: () => this.cmdHire()
        },
        theme: {
          desc: 'Change visual theme: "theme [cyber|obsidian|electric]"',
          execute: (args) => this.cmdTheme(args)
        },
        matrix: {
          desc: 'Toggle matrix digital stream mode',
          execute: () => this.cmdMatrix()
        },
        clear: {
          desc: 'Clear the terminal screen buffer',
          execute: () => this.cmdClear()
        },
        cls: {
          desc: 'Alias for clear',
          execute: () => this.cmdClear()
        },
        date: {
          desc: 'Display current system timestamp',
          execute: () => this.cmdDate()
        },
        sudo: {
          desc: 'Execute command with elevated administrative privilege',
          execute: (args) => this.cmdSudo(args)
        },
        exit: {
          desc: 'Exit and close developer terminal',
          execute: () => this.close()
        }
      };

      this.init();
    }

    init() {
      if (!this.overlay || !this.input) return;

      // Toggle button in navbar
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => {
          this.toggle();
        });
      }

      // Close buttons
      [this.closeBtn, this.closeXBtn].forEach((btn) => {
        if (btn) {
          btn.addEventListener('click', () => {
            this.close();
          });
        }
      });

      // Keyboard shortcut: Tilde `~`
      window.addEventListener('keydown', (e) => {
        if (e.key === '`' || e.key === '~') {
          // If not typing inside another input/textarea
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.toggle();
          }
        }
      });

      // Terminal input keydown
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const raw = this.input.value.trim();
          if (raw) {
            this.commandHistory.push(raw);
            this.historyIndex = this.commandHistory.length;
            this.executeCommand(raw);
          }
          this.input.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.commandHistory[this.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.input.value = this.commandHistory[this.historyIndex];
          } else {
            this.historyIndex = this.commandHistory.length;
            this.input.value = '';
          }
        }
      });
    }

    toggle() {
      if (this.overlay.classList.contains('hidden')) {
        this.open();
      } else {
        this.close();
      }
    }

    open() {
      this.overlay.classList.remove('hidden');
      this.overlay.setAttribute('aria-hidden', 'false');
      setTimeout(() => this.input.focus(), 150);
      if (window.sfx) window.sfx.play('launch');
    }

    close() {
      this.overlay.classList.add('hidden');
      this.overlay.setAttribute('aria-hidden', 'true');
      if (window.sfx) window.sfx.play('click');
    }

    executeCommand(rawStr) {
      const parts = rawStr.split(' ');
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);

      this.printLine(`<span class="term-user-path">yashmit@portfolio:~$</span> ${rawStr}`, 'term-cyan');
      if (window.sfx) window.sfx.play('click');

      if (this.commands[cmdName]) {
        this.commands[cmdName].execute(args);
      } else {
        this.printLine(`bash: command not found: ${cmdName}. Type <strong class="term-green">'help'</strong> to inspect valid commands.`, 'term-red');
      }

      this.scrollToBottom();
    }

    printLine(htmlContent, extraClass = '') {
      const div = document.createElement('div');
      div.className = `term-line ${extraClass}`;
      div.innerHTML = htmlContent;
      this.output.appendChild(div);
      this.scrollToBottom();
    }

    scrollToBottom() {
      this.output.scrollTop = this.output.scrollHeight;
    }

    /* COMMAND HANDLERS */
    cmdHelp() {
      let output = '<br><strong class="term-cyan">=== YASHMIT KUMAR TERMINAL MANUAL ===</strong><br>';
      output += '<table style="width:100%; border-collapse:collapse; margin-top:0.4rem;">';
      for (const [name, obj] of Object.entries(this.commands)) {
        output += `<tr><td style="color:#00f5d4; padding:2px 8px 2px 0; font-weight:bold; width:110px;">${name}</td><td style="color:#94a3b8;">${obj.desc}</td></tr>`;
      }
      output += '</table><br>';
      this.printLine(output);
    }

    cmdAbout() {
      const text = `
<strong class="term-cyan">DEVELOPER PROFILE:</strong><br>
&bull; <strong>Name:</strong> Yashmit Kumar<br>
&bull; <strong>Title:</strong> Full Stack Developer<br>
&bull; <strong>Degree:</strong> BTech &ndash; Computer Science &amp; Engineering (Cyber Security)<br>
&bull; <strong>College:</strong> Rungta College of Engineering and Technology (RCET), Bhilai<br>
&bull; <strong>Graduation:</strong> 2028<br>
&bull; <strong>Specialization:</strong> Full-stack applications (HTML/CSS/JS, React.js, Node.js, Express, MySQL/MongoDB) engineered with defensive security protocols.
      `;
      this.printLine(text);
    }

    cmdSkills() {
      const text = `
<strong class="term-cyan">TECHNICAL SKILLS INVENTORY:</strong><br>
&bull; <span class="term-purple">Languages:</span> C, Java, Python, JavaScript (ES6+)<br>
&bull; <span class="term-purple">Frontend:</span> HTML5, CSS3, JavaScript, React.js, Responsive UI<br>
&bull; <span class="term-purple">Backend:</span> Node.js, Express.js, RESTful API Architecture<br>
&bull; <span class="term-purple">Databases:</span> MySQL, MongoDB, Sequelize (ORM), Mongoose (ODM)<br>
&bull; <span class="term-purple">DevOps &amp; Tools:</span> Git, GitHub, Cloud Deployment, Canva<br>
&bull; <span class="term-purple">Soft Skills:</span> Teamwork, Problem Solving, Leadership, Communication
      `;
      this.printLine(text);
    }

    cmdProjects() {
      const text = `
<strong class="term-cyan">FEATURED PROJECTS:</strong><br>
1. <strong class="term-green">Dictionary Web Application</strong> [Dec 2025 &ndash; Jan 2026]<br>
   Stack: HTML, CSS, JavaScript, Web Audio API, Dictionary API<br>
   Feat: Real-time word lookup, phonetics, audio pronunciation, definitions.<br><br>
2. <strong class="term-green">PassGuard: Random Password Generator</strong> [Feb 2026 &ndash; Mar 2026]<br>
   Stack: HTML, CSS, JavaScript, Cryptographic Entropy<br>
   Feat: Hardened password creation, custom complexity rules, entropy scoring.<br><br>
3. <strong class="term-green">Number Guessing Game</strong> [Apr 2026 &ndash; May 2026]<br>
   Stack: C Programming Language, Algorithm Design<br>
   Feat: Pseudo-random generator, dynamic hints, attempt tracking, input sanitation.
      `;
      this.printLine(text);
    }

    cmdEducation() {
      const text = `
<strong class="term-cyan">ACADEMIC CREDENTIALS:</strong><br>
&bull; <strong>Degree:</strong> Bachelor of Technology (BTech) in Computer Science &amp; Engineering<br>
&bull; <strong>Major:</strong> Cyber Security<br>
&bull; <strong>Institution:</strong> Rungta College of Engineering and Technology &ndash; Bhilai<br>
&bull; <strong>Graduation Year:</strong> 2028<br>
&bull; <strong>Key Disciplines:</strong> Data Structures &amp; Algorithms, Object Oriented Systems, Network Security, Relational Databases.
      `;
      this.printLine(text);
    }

    cmdCerts() {
      const text = `
<strong class="term-cyan">CERTIFICATIONS &amp; HONORS:</strong><br>
1. <strong>Generative AI:</strong> LLMs, Prompt Engineering &amp; Modern Generative Models<br>
2. <strong>Full Stack Development:</strong> Coding Spoon (HTML, CSS, JavaScript)<br>
3. <strong>MERN Full Stack Development:</strong> Coding Spoon (React.js, Node.js, Express, MongoDB)<br>
4. <strong>AntiGravity Bootcamp:</strong> Full Stack &amp; Software Engineering Intensive
      `;
      this.printLine(text);
    }

    cmdContact() {
      const text = `
<strong class="term-cyan">COMMUNICATION CHANNELS:</strong><br>
&bull; <strong>Phone / WhatsApp:</strong> <a href="tel:+919142939660" style="color:#00f5d4;">+91-9142939660</a><br>
&bull; <strong>Email:</strong> <a href="mailto:yashmitbhatt07@gmail.com" style="color:#00f5d4;">yashmitbhatt07@gmail.com</a><br>
&bull; <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/yashmit-bhatt-799a11360" target="_blank" style="color:#00f5d4;">LinkedIn</a><br>
&bull; <strong>GitHub:</strong> <a href="https://github.com/Yashmit-kumar" target="_blank" style="color:#00f5d4;">GitHub</a><br>
&bull; <strong>Location:</strong> Bhilai, Chhattisgarh, India
      `;
      this.printLine(text);
    }

    cmdHire() {
      const text = `
<strong class="term-green">=== WHY HIRE YASHMIT KUMAR? ===</strong><br>
&bull; <strong>End-to-End Capability:</strong> Crafts reactive, accessible front-ends (React.js) AND scalable backends (Node.js/Express) with database architectures (MySQL/MongoDB).<br>
&bull; <strong>Cyber Security Focus:</strong> Builds with defensive engineering, input validation, and secure authentication in mind.<br>
&bull; <strong>Relentless Work Ethic:</strong> High problem-solving stamina, continuous learner, strong team player &amp; leader.<br>
&bull; <strong>Ready to Deploy:</strong> Available for internships, freelance projects, and software engineering roles.<br><br>
<span class="term-cyan">Contact Yashmit directly at: +91-9142939660 or yashmitbhatt07@gmail.com!</span>
      `;
      this.printLine(text);
      if (window.showToast) window.showToast('Ready for interview! Call +91-9142939660 📞');
    }

    cmdTheme(args) {
      const target = (args[0] || '').toLowerCase();
      if (['cyber', 'obsidian', 'electric'].includes(target)) {
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('yk_theme', target);
        this.printLine(`Theme switched to: <strong class="term-green">${target.toUpperCase()}</strong>`);
        if (window.showToast) window.showToast(`Theme changed to ${target.toUpperCase()}`);
      } else {
        this.printLine(`Usage: theme [cyber | obsidian | electric]. Current: ${document.documentElement.getAttribute('data-theme')}`);
      }
    }

    cmdMatrix() {
      this.printLine(`[SYS_ALERT]: Matrix visual grid pulses initialized. Welcome to the construct, Neo.`, 'term-green');
      if (window.showToast) window.showToast('Matrix mode engaged 🕶️');
    }

    cmdClear() {
      this.output.innerHTML = '';
    }

    cmdDate() {
      this.printLine(`Current System Date &amp; Time: ${new Date().toString()}`);
    }

    cmdSudo(args) {
      const cmd = args.join(' ');
      this.printLine(`[SECURITY]: User 'guest' is not in the sudoers file. This incident will be reported to Yashmit Kumar! 🚨`, 'term-red');
      this.printLine(`(Tip: You don't need root privilege to collaborate &mdash; just send an email!)`);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new CyberTerminal();
  });

})();
