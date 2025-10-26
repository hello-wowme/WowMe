// script.js — minimal interactions

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const modal = document.getElementById('modal');
  const openModal = document.getElementById('openModal');
  const modalClose = document.getElementById('modalClose');

  navToggle?.addEventListener('click', () => {
    if (!nav) return;
    if (nav.style.display === 'flex') {
      nav.style.display = 'none';
    } else {
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.right = '24px';
      nav.style.top = '66px';
      nav.style.background = 'rgba(255,255,255,0.98)';
      nav.style.padding = '12px';
      nav.style.borderRadius = '10px';
      nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
    }
  });

  openModal?.addEventListener('click', () => {
    if (modal) modal.style.display = 'flex';
  });

  modalClose?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  // Close modal by clicking overlay
  window.addEventListener('click', (e) => {
    if (!modal) return;
    if (e.target === modal) modal.style.display = 'none';
  });

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        if (nav && window.innerWidth < 980) nav.style.display = 'none';
      }
    });
  });
});


// 例：ホバーしたときに動画再生、離れたら一時停止
const video = document.querySelector('.video-thumb video');

video.addEventListener('mouseenter', () => video.play());
video.addEventListener('mouseleave', () => video.pause());
