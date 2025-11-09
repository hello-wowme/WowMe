// スクロール時にアニメーション発火
const elements = document.querySelectorAll('.slide-up, .slide-left, .slide-right, .fade-in-up');
const showOnScroll = () => {
  const trigger = window.innerHeight * 0.85;
  elements.forEach(el => {
    const rect = el.getBoundingClientRect().top;
    if (rect < trigger) el.classList.add('show');
  });
};
window.addEventListener('scroll', showOnScroll);
showOnScroll();

// // ハンバーガーメニュー（スマホ対応）
// const nav = document.querySelector('.nav');
// const header = document.querySelector('.header');
// if(window.innerWidth < 768){
//   const btn = document.createElement('button');
//   btn.className = 'menu-btn';
//   btn.innerHTML = '☰';
//   header.insertBefore(btn, nav);
//   nav.style.display = 'none';
//   btn.onclick = ()=>{
//     nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
//   };
// }

// ページ読み込み時のフェードイン
window.addEventListener('load', ()=>{
  document.body.classList.add('page-loaded');
});

/* === プライバシーポリシー／特商法 モーダル === */
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.modal-close');

const privacyLink = document.getElementById('privacy-link');
const legalLink = document.getElementById('legal-link');

const privacyHTML = `
  <h2>プライバシーポリシー</h2>
  <p>WowMe運営事務局（以下「当事務局」といいます）は、ユーザーの個人情報を適切に保護することを目的として、以下の方針を定めます。</p>
  <h3>1. 個人情報の取得について</h3>
  <p>当事務局は、サービス提供に必要な範囲で個人情報を適正に取得します。</p>
  <h3>2. 個人情報の利用目的</h3>
  <p>取得した個人情報は、お問い合わせ対応、サービス提供、情報発信のために利用します。</p>
  <h3>3. 個人情報の管理</h3>
  <p>当事務局は、漏えい・紛失・改ざん防止のために安全管理を徹底します。</p>
  <h3>4. お問い合わせ先</h3>
  <p>WowMe運営事務局<br>メール：hello.wowme@gmail.com</p>
`;

const legalHTML = `
  <h2>特定商取引法に基づく表記</h2>
  <p>販売事業者：株式会社WowMe（設立予定）</p>
  <p>代表責任者：山本 涼太</p>
  <p>お問い合わせ：hello.wowme@gmail.com</p>
  <p>販売価格：各サービス紹介ページに記載</p>
  <p>お支払い方法：クレジットカード、その他決済サービス</p>
  <p>返品・キャンセル：デジタル商品のため返品不可（不具合時は個別対応）</p>
`;

function openModal(content) {
  modalBody.innerHTML = content;
  modal.style.display = 'flex';
}
function closeModal() {
  modal.style.display = 'none';
}

privacyLink.addEventListener('click', (e)=>{
  e.preventDefault();
  openModal(privacyHTML);
});
legalLink.addEventListener('click', (e)=>{
  e.preventDefault();
  openModal(legalHTML);
});
closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e)=>{
  if(e.target === modal) closeModal();
});
