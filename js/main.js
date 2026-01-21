// ================= MOBILE MENU =================
const menuIcon = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

// ================= STICKY HEADER =================
window.addEventListener('scroll', () => {
  document.querySelector('.header')
    .classList.toggle('sticky', window.scrollY > 100);
});

// ================= SCROLL REVEAL =================
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add('active');
    }
  });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ================= TYPING ANIMATION =================
const roles = [
  "Machine Learning Engineer",
  "AI / ML",
  "NLP",
  "GenAI / AI Enthusiast",
  "Python Developer",
  "Front End Developer",
  "Full Stack Learner"
];

let roleIndex = 0;
let charIndex = 0;
let deleting = false;
const typing = document.getElementById("typing");

function typeEffect() {
  const text = roles[roleIndex];

  if (!deleting) {
    typing.textContent = text.substring(0, charIndex++);
    if (charIndex === text.length) { // full word typed
      deleting = true;
      setTimeout(typeEffect, 1000); // wait 1 second before deleting
      return;
    }
  } else {
    typing.textContent = text.substring(0, charIndex--);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeEffect, deleting ? 150 : 200);
}

typeEffect();
