/* =========================================================
   YEAR
========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   NAV: scroll state + active link + mobile menu
========================================================= */
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll(){
  nav.classList.toggle('is-scrolled', window.scrollY > 30);

  let current = sections[0]?.id;
  const scrollPos = window.scrollY + window.innerHeight * 0.35;
  sections.forEach(sec => {
    if (scrollPos >= sec.offsetTop) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

navBurger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  navBurger.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    navBurger.setAttribute('aria-expanded', 'false');
  });
});

/* =========================================================
   SCROLL REVEAL
========================================================= */
const revealTargets = document.querySelectorAll(
  '.section-eyebrow, .section-title, .section-sub, .about-body, .about-stats, ' +
  '.project-card, .skill-card, .contact-intro, .contact-form'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealTargets.forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealObserver.observe(el);
});

/* =========================================================
   HERO CANVAS — animated electric bolts
========================================================= */
const canvas = document.getElementById('boltCanvas');
const ctx = canvas.getContext('2d');
let width, height, dpr;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const palette = ['#22e2ff', '#7c5cff', '#ff4fd8'];

/* Drifting energy particles */
class Particle{
  constructor(){ this.reset(); }
  reset(){
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.r = Math.random() * 1.6 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.alpha = Math.random() * 0.5 + 0.15;
  }
  step(){
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
  }
  draw(){
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const particleCount = Math.floor((width * height) / 22000);
let particles = Array.from({ length: Math.max(30, Math.min(90, particleCount)) }, () => new Particle());

/* Occasional lightning bolt across the hero */
function randomBoltPath(){
  const startX = Math.random() * width;
  const points = [{ x: startX, y: -20 }];
  const segments = 7 + Math.floor(Math.random() * 4);
  let x = startX;
  for (let i = 1; i <= segments; i++){
    const y = (height / segments) * i;
    x += (Math.random() - 0.5) * 140;
    points.push({ x, y });
  }
  return points;
}

let bolts = [];
function spawnBolt(){
  bolts.push({
    path: randomBoltPath(),
    life: 0,
    maxLife: 16 + Math.random() * 8,
    color: palette[Math.floor(Math.random() * 2)],
    branch: Math.random() > 0.5
  });
}

function drawBoltPath(points, alpha, color, widthPx){
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = widthPx;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

let lastBoltSpawn = 0;

function animate(time){
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => { p.step(); p.draw(); });

  if (!prefersReducedMotion){
    if (time - lastBoltSpawn > 2600 + Math.random() * 2200){
      spawnBolt();
      lastBoltSpawn = time;
    }
  }

  bolts.forEach(b => {
    b.life++;
    const progress = b.life / b.maxLife;
    const flicker = Math.random() > 0.15 ? 1 : 0.3;
    const alpha = Math.max(0, (1 - progress) * flicker * 0.85);
    if (alpha > 0){
      drawBoltPath(b.path, alpha, b.color, 1.6);
      drawBoltPath(b.path, alpha * 0.4, b.color, 5);
    }
  });
  bolts = bolts.filter(b => b.life < b.maxLife);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* =========================================================
   CONTACT FORM
========================================================= */
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const submitText = document.getElementById('formSubmitText');
const emailLink = document.getElementById('emailLink');
const RECIPIENT_EMAIL = emailLink ? emailLink.textContent.trim() : 'your.email@example.com';

function setFieldError(row, hasError){
  row.classList.toggle('field-error', hasError);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('cf-name');
  const emailInput = document.getElementById('cf-email');
  const messageInput = document.getElementById('cf-message');

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let valid = true;

  setFieldError(nameInput.closest('.form-row'), nameInput.value.trim().length === 0);
  if (nameInput.value.trim().length === 0) valid = false;

  const emailValid = emailPattern.test(emailInput.value.trim());
  setFieldError(emailInput.closest('.form-row'), !emailValid);
  if (!emailValid) valid = false;

  setFieldError(messageInput.closest('.form-row'), messageInput.value.trim().length === 0);
  if (messageInput.value.trim().length === 0) valid = false;

  if (!valid){
    formNote.textContent = 'Please fill in every field with a valid email.';
    formNote.className = 'form-note is-error';
    return;
  }

  submitText.textContent = 'Sending...';
  formNote.textContent = '';

  try{
    const response = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    });

    if (response.ok){
      formNote.textContent = "Message sent! I'll get back to you soon.";
      formNote.className = 'form-note is-success';
      form.reset();
    } else {
      formNote.textContent = `Couldn't send automatically — email me directly at ${RECIPIENT_EMAIL}`;
      formNote.className = 'form-note is-error';
    }
  } catch(err){
    formNote.textContent = `Couldn't send automatically — email me directly at ${RECIPIENT_EMAIL}`;
    formNote.className = 'form-note is-error';
  }

  submitText.textContent = 'Send Message';
});

['cf-name', 'cf-email', 'cf-message'].forEach(id => {
  document.getElementById(id).addEventListener('input', (e) => {
    setFieldError(e.target.closest('.form-row'), false);
    formNote.textContent = '';
  });
});

/* Fallback: copy email to clipboard if mailto doesn't open an app */
const copyEmailBtn = document.getElementById('copyEmailBtn');
if (copyEmailBtn){
  copyEmailBtn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(RECIPIENT_EMAIL);
      copyEmailBtn.textContent = 'Copied — ' + RECIPIENT_EMAIL;
      setTimeout(() => { copyEmailBtn.textContent = 'Or copy email address instead'; }, 3000);
    }catch(err){
      formNote.textContent = `Email didn't copy — here it is: ${RECIPIENT_EMAIL}`;
      formNote.className = 'form-note is-error';
    }
  });
}
