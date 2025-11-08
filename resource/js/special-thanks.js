// WowMe リリース予定日
const releaseDate = new Date("2026-10-31T00:00:00+09:00");

function updateCountdown() {
  const now = new Date();
  const diff = releaseDate - now;

  if (diff <= 0) {
    document.querySelector(".countdown").innerHTML = "<h2>🎉 WowMe リリースおめでとう！ 🎉</h2>";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("days").textContent = days.toString().padStart(3, "0");
  document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
  document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
  document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
}

setInterval(updateCountdown, 1000);
updateCountdown();
