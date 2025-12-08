// Fortness interactive script: year, copy IP, reveal on scroll, nav and particles
(() => {
    function setYear() {
        const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    }

    function initCopy() {
        const copyBtn = document.getElementById('copyBtn');
        const copyBtn2 = document.getElementById('copyBtn2');
        const serverIpEl = document.getElementById('serverIp');
        if (!serverIpEl) return;
        
        const copyIP = async (btn) => {
            const ip = serverIpEl.textContent.trim();
            const originalText = btn.querySelector('span')?.textContent || btn.textContent;
            try {
                await navigator.clipboard.writeText(ip);
                if (btn.querySelector('span')) {
                    btn.querySelector('span').textContent = 'Copiado ✓';
                    setTimeout(() => { btn.querySelector('span').textContent = originalText; }, 1800);
                } else {
                    btn.textContent = 'Copiado ✓';
                    setTimeout(() => { btn.textContent = originalText; }, 1800);
                }
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = ip;
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    if (btn.querySelector('span')) {
                        btn.querySelector('span').textContent = 'Copiado ✓';
                        setTimeout(() => { btn.querySelector('span').textContent = originalText; }, 1800);
                    } else {
                        btn.textContent = 'Copiado ✓';
                        setTimeout(() => { btn.textContent = originalText; }, 1800);
                    }
                } catch (e2) {
                    alert('IP: ' + ip);
                }
                ta.remove();
            }
        };

        if (copyBtn) copyBtn.addEventListener('click', () => copyIP(copyBtn));
        if (copyBtn2) copyBtn2.addEventListener('click', () => copyIP(copyBtn2));
    }

    function initNav() {
        const navToggle = document.getElementById('navToggle');
        const mainNav = document.getElementById('mainNav');
        if (!navToggle || !mainNav) return;
        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.style.display === 'block';
            mainNav.style.display = isOpen ? '' : 'block';
            navToggle.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', !isOpen);
        });
        // close on click link
        mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { 
            if (window.innerWidth <= 800) {
                mainNav.style.display = '';
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('open');
            }
        }));
    }

    function initReveal() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // lightweight particle field using <canvas> in hero background
    function initParticles() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particles'; canvas.style.position = 'absolute'; canvas.style.inset = '0'; canvas.style.zIndex = '-1'; canvas.style.pointerEvents = 'none';
        const hero = document.querySelector('.hero'); if (!hero) return; hero.prepend(canvas);
        const ctx = canvas.getContext('2d'); let w = 0, h = 0; const parts = []; const count = 34;
        function resize() { w = canvas.width = hero.clientWidth; h = canvas.height = hero.clientHeight; }
        function rand(min, max) { return Math.random() * (max - min) + min }
        function make() { for (let i = 0; i < count; i++) { parts.push({ x: rand(0, w), y: rand(0, h), r: rand(0.6, 2.6), vx: rand(-0.2, 0.6), vy: rand(-0.05, 0.15), a: rand(0.05, 0.9) }) } }
        function draw() { ctx.clearRect(0, 0, w, h); for (const p of parts) { p.x += p.vx; p.y += p.vy; p.a += Math.sin(Date.now() / 6000 + p.x) * 0.0003; if (p.x > w + 30) p.x = -30; if (p.y > h + 30) p.y = -30; ctx.beginPath(); ctx.fillStyle = `rgba(120,200,255,${0.08 * p.a})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } }
        function loop() { draw(); requestAnimationFrame(loop); }
        window.addEventListener('resize', resize); resize(); make(); loop();
    }

    // Get server IP from the page
    function getServerIP() {
        const serverIpEl = document.getElementById('serverIp');
        if (serverIpEl) {
            return serverIpEl.textContent.trim();
        }
        return 'mc.fortness.com'; // fallback
    }

    // Fetch real-time server stats from mcstatus API
    async function fetchServerStats() {
        const serverIP = getServerIP();
        // Remove port if present for API call
        const serverAddress = serverIP.split(':')[0];
        
        // Show loading state
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            if (card.querySelector('#stat-players-online, #stat-max-players, #stat-status, #stat-version')) {
                card.classList.add('loading');
            }
        });
        
        try {
            const response = await fetch(`https://api.mcstatus.io/v2/status/java/${serverAddress}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }

            const data = await response.json();
            updateStats(data);
            
            // Remove loading state
            statCards.forEach(card => card.classList.remove('loading'));
        } catch (error) {
            console.error('Error fetching server stats:', error);
            updateStatsError();
            
            // Remove loading state
            statCards.forEach(card => card.classList.remove('loading'));
        }
    }

    // Update stats display with real data
    function updateStats(data) {
        const playersOnlineEl = document.getElementById('stat-players-online');
        const maxPlayersEl = document.getElementById('stat-max-players');
        const statusEl = document.getElementById('stat-status');
        const statusIconEl = document.getElementById('server-status-icon');
        const versionEl = document.getElementById('stat-version');

        if (data.online) {
            // Update players online
            if (playersOnlineEl) {
                animateCounter(playersOnlineEl, data.players.online || 0);
            }

            // Update max players
            if (maxPlayersEl) {
                animateCounter(maxPlayersEl, data.players.max || 0);
            }

            // Update status
            if (statusEl) {
                statusEl.textContent = 'En línea';
                statusEl.style.color = 'var(--accent)';
            }

            if (statusIconEl) {
                statusIconEl.className = 'fas fa-circle';
                statusIconEl.style.color = '#4ade80'; // green
            }

            // Update version
            if (versionEl && data.version) {
                const version = data.version.name_clean || data.version.name || 'Desconocida';
                versionEl.textContent = version.length > 10 ? version.substring(0, 10) + '...' : version;
            }
        } else {
            // Server offline
            if (playersOnlineEl) {
                playersOnlineEl.textContent = '0';
            }
            if (maxPlayersEl) {
                maxPlayersEl.textContent = '0';
            }
            if (statusEl) {
                statusEl.textContent = 'Fuera de línea';
                statusEl.style.color = 'var(--muted)';
            }
            if (statusIconEl) {
                statusIconEl.className = 'fas fa-circle';
                statusIconEl.style.color = '#ef4444'; // red
            }
            if (versionEl) {
                versionEl.textContent = '-';
            }
        }
    }

    // Handle error state
    function updateStatsError() {
        const playersOnlineEl = document.getElementById('stat-players-online');
        const maxPlayersEl = document.getElementById('stat-max-players');
        const statusEl = document.getElementById('stat-status');
        const statusIconEl = document.getElementById('server-status-icon');
        const versionEl = document.getElementById('stat-version');

        if (playersOnlineEl) playersOnlineEl.textContent = '-';
        if (maxPlayersEl) maxPlayersEl.textContent = '-';
        if (statusEl) {
            statusEl.textContent = 'Error';
            statusEl.style.color = 'var(--muted)';
        }
        if (statusIconEl) {
            statusIconEl.className = 'fas fa-exclamation-circle';
            statusIconEl.style.color = '#fbbf24'; // yellow
        }
        if (versionEl) versionEl.textContent = '-';
    }

    // Animate counter to target value
    function animateCounter(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const duration = 1000;
        const increment = (target - current) / (duration / 16);
        let value = current;

        const timer = setInterval(() => {
            value += increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(value);
            }
        }, 16);
    }

    // Animated counters for stats (fallback for static stats)
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]:not(#stat-players-online):not(#stat-max-players)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    if (!isNaN(target) && target > 0) {
                        animateCounter(entry.target, target);
                    }
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(counter => observer.observe(counter));
    }

    // init all
    document.addEventListener('DOMContentLoaded', () => { 
        setYear(); 
        initCopy(); 
        initNav(); 
        initReveal(); 
        initCounters();
        
        // Fetch real-time server stats
        fetchServerStats();
        // Update stats every 30 seconds
        setInterval(fetchServerStats, 30000);
        
        try { initParticles(); } catch (e) { /* graceful */ } 
    });

})();
