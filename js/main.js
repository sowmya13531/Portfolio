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
  "Machine Learning Engineer ",
  "Artificial Intelligence ",
  "NLP Engineer ",
  "LLM & RAG Systems Architect ",
  "Generative AI Developer ",
  "Python Developer ",
  "Front End Developer ",
  "Full Stack Learner "
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

// Github
fetch("https://api.github.com/users/sowmya13531")
.then(response => response.json())
.then(data => {

document.getElementById("repos").innerText = data.public_repos;

document.getElementById("stars").innerText = "Check repos ⭐";

});

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

  counter.innerText = "0";

  const updateCounter = () => {

    const target = +counter.getAttribute("data-target");

    const current = +counter.innerText;

    const increment = target / 100;

    if(current < target){

      counter.innerText = `${Math.ceil(current + increment)}`;

      setTimeout(updateCounter,20);

    }

    else{

      counter.innerText = target + "+";

    }

  };

  updateCounter();

});
