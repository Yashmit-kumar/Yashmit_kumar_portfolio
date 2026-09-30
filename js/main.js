/**
 * Yashmit Kumar - Full Stack Developer Portfolio
 * Main Interactive Controller & Visual FX Engine
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. AUDIO SYNTHESIZER (WEB AUDIO API)
     ========================================================================== */
  class SoundFX {
    constructor() {
      this.enabled = localStorage.getItem('yk_audio_enabled') === 'true';
      this.ctx = null;
      this.initUI();
    }

    initCtx() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    play(type = 'click') {
      if (!this.enabled) return;
      try {
        this.initCtx();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'click') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === 'hover') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          gain.gain.setValueAtTime(0.015, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.start(now);
          osc.stop(now + 0.04);
        } else if (type === 'success') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(587.33, now + 0.08);
          osc.frequency.setValueAtTime(880, now + 0.16);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
          osc.start(now);
          osc.stop(now + 0.28);
        } else if (type === 'launch') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        }
      } catch (e) {
        // Audio error silent fallback
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('yk_audio_enabled', this.enabled);
      this.updateUI();
      if (this.enabled) {
        this.play('success');
        showToast('Futuristic Sound Effects Activated 🔊');
      } else {
        showToast('Sound Effects Muted 🔇');
      }
    }

    initUI() {
      const btn = document.getElementById('audioToggle');
      if (!btn) return;
      this.updateUI();
      btn.addEventListener('click', () => this.toggle());
    }

    updateUI() {
      const btn = document.getElementById('audioToggle');
      if (!btn) return;
      const soundOn = btn.querySelector('.sound-on');
      const soundOff = btn.querySelector('.sound-off');
      if (this.enabled) {
        soundOn.classList.remove('hidden');
        soundOff.classList.add('hidden');
      } else {
        soundOn.classList.add('hidden');
        soundOff.classList.remove('hidden');
      }
    }
  }

  const sfx = new SoundFX();
  window.sfx = sfx;

  /* ==========================================================================
     2. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  function showToast(message, icon = '⚡') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }
  window.showToast = showToast;

  /* ==========================================================================
     3. INTERACTIVE CANVAS BACKGROUND (CYBER MESH)
     ========================================================================== */
  class CanvasBackground {
    constructor() {
      this.canvas = document.getElementById('bgCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null, radius: 150 };
      this.particleCount = 55;
      this.maxDistance = 140;

      this.resize();
      this.initParticles();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * window.devicePixelRatio;
      this.canvas.height = this.height * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    initParticles() {
      this.particles = [];
      const count = Math.min(Math.floor((this.width * this.height) / 18000), 75);
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1,
          baseColor: Math.random() > 0.4 ? '#00f5d4' : '#a855f7'
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        // Mobile: the address bar hiding/showing while scrolling only changes the height.
        // Skip the rebuild in that case so particles don't reset/flicker. Desktop unchanged.
        if (window.innerWidth <= 768 && window.innerWidth === this.width) return;
        this.resize();
        this.initParticles();
      });

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener('mouseout', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render & Update Particles
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce from walls
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;

        // Mouse interaction
        if (this.mouse.x !== null) {
          const dx = this.mouse.x - p.x;
          const dy = this.mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mouse.radius) {
            const force = (this.mouse.radius - dist) / this.mouse.radius;
            p.x -= (dx / dist) * force * 2.5;
            p.y -= (dy / dist) * force * 2.5;
          }
        }

        // Draw particle node
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.baseColor;
        this.ctx.globalAlpha = 0.6;
        this.ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (dist < this.maxDistance) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / this.maxDistance) * 0.22;
            this.ctx.strokeStyle = '#00f5d4';
            this.ctx.globalAlpha = alpha;
            this.ctx.lineWidth = 0.8;
            this.ctx.stroke();
          }
        }
      }

      this.ctx.globalAlpha = 1.0;
      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     4. CUSTOM GLOW CURSOR
     ========================================================================== */
  function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const follower = document.getElementById('cursorFollower');
    if (!cursor || !follower) return;

    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function renderFollower() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Hover scale bindings
    const interactives = document.querySelectorAll('a, button, input, textarea, .stat-card, .skill-card, .cert-card, .project-featured-card, [data-tilt]');
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        sfx.play('hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  /* ==========================================================================
     5. HERO TYPING CAROUSEL
     ========================================================================== */
  function initTypingEffect() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const phrases = [
      'Full Stack Web Applications 🚀',
      'Robust Node.js & Express APIs 🛡️',
      'Interactive React.js Interfaces ⚛️',
      'Secure MySQL & MongoDB Systems 💾',
      'Cyber Security & Defensive Code 🔐',
      'Algorithmic C Logic & Utilities ⚡'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let delay = 120;

    function typeLoop() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        delay = 45;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        delay = 95;
      }

      if (!isDeleting && charIndex === current.length) {
        delay = 1800; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 300;
      }

      setTimeout(typeLoop, delay);
    }

    typeLoop();
  }

  /* ==========================================================================
     6. NAVBAR, SCROLLSPY & MOBILE MENU
     ========================================================================== */
  function initNavAndScroll() {
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Sticky Navbar elevation
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile Hamburger
    if (hamburgerBtn && navMenu) {
      hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('open');
        sfx.play('click');
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          hamburgerBtn.classList.remove('active');
          navMenu.classList.remove('open');
        });
      });
    }

    // Scrollspy Highlight
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 200;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    });

    // Back to top button
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        sfx.play('launch');
      });
    }
  }

  /* ==========================================================================
     7. SKILLS FILTERING & METER ANIMATION
     ========================================================================== */
  function initSkillsSystem() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const skillCards = document.querySelectorAll('.skill-card');

    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        sfx.play('click');

        const filter = tab.getAttribute('data-filter');

        skillCards.forEach((card) => {
          const categories = card.getAttribute('data-category') || '';
          if (filter === 'all' || categories.includes(filter)) {
            card.classList.remove('hidden-by-filter');
            // Trigger animation
            const bar = card.querySelector('.progress-bar-fill');
            if (bar) {
              const width = bar.getAttribute('data-width');
              bar.style.width = width;
            }
          } else {
            card.classList.add('hidden-by-filter');
          }
        });
      });
    });

    // Animate progress bars on viewport entry
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target.querySelector('.progress-bar-fill');
            if (bar) {
              bar.style.width = bar.getAttribute('data-width');
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    skillCards.forEach((c) => observer.observe(c));
  }

  /* ==========================================================================
     8. HERO STATS COUNTER ANIMATION
     ========================================================================== */
  function initStatsCounter() {
    const statCards = document.querySelectorAll('.stat-card');
    let counted = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          document.querySelectorAll('.stat-number').forEach((numEl) => {
            const target = parseInt(numEl.getAttribute('data-count'), 10);
            const duration = 1600;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const currentVal = Math.floor(progress * target);
              numEl.textContent = currentVal;
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                numEl.textContent = target;
              }
            }
            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.3 });

    statCards.forEach((card) => observer.observe(card));
  }

  /* ==========================================================================
     9. 3D TILT EFFECT FOR CARDS
     ========================================================================== */
  function init3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt], .cyber-card-3d');

    tiltElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  /* ==========================================================================
     10. THEME SWITCHER
     ========================================================================== */
  function initThemeToggle() {
    const themeBtn = document.getElementById('themeToggle');
    if (!themeBtn) return;

    const themes = ['cyber', 'obsidian', 'electric'];
    let currentThemeIndex = 0;

    const savedTheme = localStorage.getItem('yk_theme') || 'cyber';
    document.documentElement.setAttribute('data-theme', savedTheme);
    currentThemeIndex = themes.indexOf(savedTheme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;

    themeBtn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const nextTheme = themes[currentThemeIndex];
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('yk_theme', nextTheme);
      sfx.play('click');
      showToast(`Switched Theme to: ${nextTheme.toUpperCase()} 🎨`);
    });
  }

  /* ==========================================================================
     11. MODAL WINDOW CONTROLLER
     ========================================================================== */
  function initModals() {
    // Open Demo Modals
    const demoBtns = document.querySelectorAll('.launch-demo-btn');
    demoBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const demo = btn.getAttribute('data-demo');
        let modalId = null;
        if (demo === 'dictionary') modalId = 'dictionaryModal';
        else if (demo === 'password') modalId = 'passwordModal';
        else if (demo === 'game') modalId = 'gameModal';

        if (modalId) {
          openModal(modalId);
          sfx.play('launch');
        }
      });
    });

    // Resume Modal
    const resumeBtn = document.getElementById('resumeModalBtn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => {
        openModal('resumeModal');
        sfx.play('click');
      });
    }

    // Print Resume
    const printBtn = document.getElementById('printResumeBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        sfx.play('click');
        window.print();
      });
    }

    // Ensure resume modal is open if user presses Ctrl+P directly
    window.addEventListener('beforeprint', () => {
      openModal('resumeModal');
    });

    // Close buttons
    const closeBtns = document.querySelectorAll('[data-close]');
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-close');
        closeModal(targetId);
        sfx.play('click');
      });
    });

    // Backdrop click close
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          sfx.play('click');
        }
      });
    });

    // ESC key close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach((m) => {
          m.classList.remove('active');
        });
      }
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  /* ==========================================================================
     12. COPY EMAIL & CLIPBOARD UTILITIES
     ========================================================================== */
  function initCopyUtilities() {
    const copyBtns = document.querySelectorAll('.copy-email-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = btn.getAttribute('data-email') || 'yashmitbhatt07@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          sfx.play('success');
          showToast(`Email copied: ${email} 📋`);
        }).catch(() => {
          showToast(`Email: ${email}`);
        });
      });
    });
  }

  /* ==========================================================================
     13. CONTACT FORM CONTROLLER
     ========================================================================== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const subject = document.getElementById('senderSubject').value.trim() || 'Portfolio Inquiry';
      const message = document.getElementById('senderMessage').value.trim();

      if (!name || !email || !message) {
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Please fill out all required fields (*).';
        feedback.classList.remove('hidden');
        sfx.play('click');
        return;
      }

      // Show sending animation
      submitBtn.disabled = true;
      submitBtn.querySelector('.btn-text').textContent = 'Transmitting Message...';
      sfx.play('click');

      const bodyText = `From: ${name} (${email})\n\nMessage:\n${message}`;
      const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=yashmitbhatt07@gmail.com&su=${encodeURIComponent(`[Portfolio] ${subject}`)}&body=${encodeURIComponent(bodyText)}`;
      const mailtoUrl = `mailto:yashmitbhatt07@gmail.com?subject=${encodeURIComponent(`[Portfolio] ${subject}`)}&body=${encodeURIComponent(bodyText)}`;

      try {
        // Attempt background submission to FormSubmit gateway
        const response = await fetch('https://formsubmit.co/ajax/yashmitbhatt07@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: name,
            email: email,
            _subject: `[Portfolio Inquiry] ${subject} from ${name}`,
            message: message
          })
        });

        if (response.ok) {
          const data = await response.json();
          feedback.className = 'form-feedback success';
          feedback.innerHTML = `
            <strong>✓ Message sent successfully!</strong> Delivered to <strong>yashmitbhatt07@gmail.com</strong>.<br>
            <span style="font-size:0.85rem;color:var(--text-secondary);display:block;margin-top:4px;">Yashmit will get back to you shortly.</span>
            <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
              <a href="${gmailWebUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-cyan" style="padding:4px 10px;font-size:0.8rem;">Open in Gmail</a>
            </div>
          `;
          sfx.play('success');
          showToast('Message sent to yashmitbhatt07@gmail.com! 🚀');
          form.reset();
        } else {
          throw new Error('API dispatch failed');
        }
      } catch (err) {
        // Direct browser fallback (opens Gmail Web or mailto)
        feedback.className = 'form-feedback success';
        feedback.innerHTML = `
          <strong>Message ready!</strong> Send directly to <strong>yashmitbhatt07@gmail.com</strong>:<br>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <a href="${gmailWebUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="padding:6px 12px;font-size:0.82rem;">
              <span>✉️ Send via Gmail Web</span>
            </a>
            <a href="${mailtoUrl}" class="btn btn-sm btn-secondary" style="padding:6px 12px;font-size:0.82rem;">
              <span>Launch Mail App</span>
            </a>
          </div>
        `;
        sfx.play('success');
        showToast('Opening Gmail composer... 🚀');
        window.open(gmailWebUrl, '_blank');
      } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Transmit Message';
        feedback.classList.remove('hidden');
      }
    });
  }

  /* ==========================================================================
     INIT ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('loading');
    new CanvasBackground();
    initCustomCursor();
    initTypingEffect();
    initNavAndScroll();
    initSkillsSystem();
    initStatsCounter();
    init3DTilt();
    initThemeToggle();
    initModals();
    initCopyUtilities();
    initContactForm();

    // Ensure clean start at top on fresh load
    if (!window.location.hash || window.location.hash === '#hero') {
      window.scrollTo(0, 0);
    }
  });

})();
