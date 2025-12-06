// Fortness interactive script: year, copy IP, reveal on scroll, nav and particles
(() => {
    function setYear() {
        const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    }

    function initCopy() {
        const copyBtn = document.getElementById('copyBtn');
        const serverIpEl = document.getElementById('serverIp');
        if (!copyBtn || !serverIpEl) return;
        copyBtn.addEventListener('click', async () => {
            const ip = serverIpEl.textContent.trim();
            try { await navigator.clipboard.writeText(ip); copyBtn.textContent = 'Copiado ✓'; setTimeout(() => copyBtn.textContent = 'Copiar IP', 1800); } catch (e) {
                const ta = document.createElement('textarea'); ta.value = ip; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); copyBtn.textContent = 'Copiado ✓'; setTimeout(() => copyBtn.textContent = 'Copiar IP', 1800) } catch (e2) { alert('IP: ' + ip) } ta.remove();
            }
        });
    }

    function initNav() {
        const navToggle = document.getElementById('navToggle');
        const mainNav = document.getElementById('mainNav');
        if (!navToggle || !mainNav) return;
        navToggle.addEventListener('click', () => {
            mainNav.style.display = (mainNav.style.display === 'block') ? '' : 'block';
            navToggle.classList.toggle('open');
        });
        // close on click link
        mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.innerWidth <= 800) mainNav.style.display = ''; }));
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

    // init all
    document.addEventListener('DOMContentLoaded', () => { setYear(); initCopy(); initNav(); initReveal(); try { initParticles(); } catch (e) { /* graceful */ } });

})();
