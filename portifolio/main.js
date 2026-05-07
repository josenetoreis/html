/* ════════════════════════════════════════════
   MAIN.JS — Interatividade completa
   Partículas azuis · Tilt 3D · Scroll reveal
   ════════════════════════════════════════════ */

/* ── Cursor personalizado ── */
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let fX = 0, fY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animFollower() {
  fX += (mouseX - fX) * .11;
  fY += (mouseY - fY) * .11;
  follower.style.left = fX + 'px';
  follower.style.top  = fY + 'px';
  requestAnimationFrame(animFollower);
})();

/* Ativa efeito hover no cursor */
document.querySelectorAll('a, button, .skill-card, .projeto-card, .stat-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('active'); follower.classList.add('active'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('active'); follower.classList.remove('active'); });
});


/* ── Partículas azuis no canvas ── */
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/* Paleta de partículas — tons de azul Microsoft */
const COLORS = [
  'rgba(0,120,212,',
  'rgba(43,136,216,',
  'rgba(80,168,240,',
  'rgba(199,223,244,'
];

class Particle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x      = Math.random() * canvas.width;
    this.y      = initial ? Math.random() * canvas.height : canvas.height + 10;
    this.size   = Math.random() * 2.5 + .8;
    this.speedX = (Math.random() - .5) * .35;
    this.speedY = -(Math.random() * .5 + .15);
    this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha  = Math.random() * .35 + .08;
    this.phase  = Math.random() * Math.PI * 2;
  }
  update() {
    this.x     += this.speedX;
    this.y     += this.speedY;
    this.phase += .012;
    this.alpha  = (Math.sin(this.phase) * .12) + .18;
    if (this.y < -10) this.reset();
    if (this.x < -10 || this.x > canvas.width + 10) {
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    /* Núcleo */
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
    /* Halo */
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
    grad.addColorStop(0, this.color + (this.alpha * .5) + ')');
    grad.addColorStop(1, this.color + '0)');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

const TOTAL = 70;
const particles = Array.from({ length: TOTAL }, () => new Particle());

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Ligações entre partículas próximas */
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(0,120,212,${(1 - dist / 110) * .1})`;
        ctx.lineWidth = .8;
        ctx.stroke();
      }
    }
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(drawLoop);
}
drawLoop();


/* ── Nav: classe ao scrollar ── */
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ── Parallax suave no orbe ── */
const orbWrap = document.querySelector('.hero-orb-wrap');
if (orbWrap) {
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - .5) * 14;
    const y = (e.clientY / window.innerHeight - .5) * 10;
    orbWrap.style.marginTop = y + 'px';
    orbWrap.style.marginLeft = x + 'px';
  }, { passive: true });
}


/* ── Tilt 3D nos cards de skill ── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  let raf;

  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      card.style.transform = `
        perspective(700px)
        rotateX(${dy * -7}deg)
        rotateY(${dx *  7}deg)
        scale3d(1.04, 1.04, 1.04)
        translateZ(10px)
      `;
      card.style.boxShadow = `
        ${-dx * 14}px ${-dy * 14}px 35px rgba(0,120,212,.18),
        0 18px 50px rgba(0,120,212,.14)
      `;
    });
  });

  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf);
    card.style.transition = 'transform .5s cubic-bezier(.25,.46,.45,.94), box-shadow .5s';
    card.style.transform  = '';
    card.style.boxShadow  = '';
    setTimeout(() => { card.style.transition = ''; }, 520);
  });
});


/* ── Scroll reveal (Intersection Observer) ── */
const targets = document.querySelectorAll(
  '.section-label, .section-title, .sobre-text p, .stat-card,' +
  '.skill-card, .projeto-card, .contato-desc, .contato-btn'
);
targets.forEach(el => el.classList.add('reveal'));

new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: .12 }).observe
  ? targets.forEach(el =>
      new IntersectionObserver((entries, obs) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
      }, { threshold: .12 }).observe(el)
    )
  : targets.forEach(el => el.classList.add('visible')); /* fallback */


/* ── Animação das barras de skill ── */
document.querySelectorAll('.skill-fill').forEach(fill => {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => {
          fill.style.width = fill.style.getPropertyValue('--w');
          fill.classList.add('animated');
        }, 380);
        obs.unobserve(fill);
      }
    });
  }, { threshold: .5 }).observe(fill);
});


/* ── Typewriter no subtítulo ── */
const heroSub = document.getElementById('heroSub');
if (heroSub) {
  const lines = [
    'Desenvolvedor Full Stack',
    'Especialista em React Native',
    'Construtor de Produtos Digitais'
  ];
  let li = 0, ci = 0, deleting = false;

  function type() {
    const str = lines[li];
    heroSub.textContent = deleting
      ? str.slice(0, --ci)
      : str.slice(0, ++ci);

    let delay = deleting ? 45 : 85;

    if (!deleting && ci === str.length) {
      deleting = true; delay = 2000;
    } else if (deleting && ci === 0) {
      deleting = false;
      li = (li + 1) % lines.length;
      delay = 380;
    }
    setTimeout(type, delay);
  }
  setTimeout(type, 1600);
}


/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});