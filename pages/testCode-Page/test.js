// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Star rating
const stars = document.querySelectorAll('#starRating i');
let selectedRating = 0;
function paintStars(value){
  stars.forEach(s => {
    const v = parseInt(s.dataset.value, 10);
    s.classList.toggle('bi-star-fill', v <= value);
    s.classList.toggle('bi-star', v > value);
  });
}
stars.forEach(star => {
  star.addEventListener('mouseenter', () => paintStars(parseInt(star.dataset.value,10)));
  star.addEventListener('mouseleave', () => paintStars(selectedRating));
  star.addEventListener('click', () => {
    selectedRating = parseInt(star.dataset.value, 10);
    paintStars(selectedRating);
  });
});

// Form submit
const form = document.getElementById('feedbackForm');
const formWrap = document.getElementById('feedbackFormWrap');
const successMsg = document.getElementById('successMsg');
const submitBtn = document.getElementById('fbSubmitBtn');

form.addEventListener('submit', function(e){
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  setTimeout(() => {
    formWrap.classList.add('d-none');
    successMsg.classList.remove('d-none');

    setTimeout(() => {
      form.reset();
      selectedRating = 0;
      paintStars(0);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
      successMsg.classList.add('d-none');
      formWrap.classList.remove('d-none');
    }, 3200);
  }, 600);
});