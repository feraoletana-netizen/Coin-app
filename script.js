let coins = Number(localStorage.getItem("coins")) || 0;
let lastBonus = localStorage.getItem("lastBonus") || "";

function updateCoins() {
  document.getElementById("coins").textContent = coins;
  localStorage.setItem("coins", coins);
}

function addCoin() {
  coins += 1;
  updateCoins();
  document.getElementById("message").textContent = "🪙 +1 Coin!";
}

function dailyBonus() {
  const today = new Date().toISOString().split("T")[0];

  if (lastBonus === today) {
    document.getElementById("message").textContent =
      "❌ Daily Bonus har'a fudhatameera.";
    return;
  }

  coins += 50;
  lastBonus = today;
  localStorage.setItem("lastBonus", lastBonus);
  updateCoins();

  document.getElementById("message").textContent =
    "🎁 +50 Coins argatte!";
}

function watchAd() {
  alert("📺 Demo Ad xumurame!");

  coins += 10;
  updateCoins();

  document.getElementById("message").textContent =
    "🎉 +10 Coins argatte!";
}

function withdraw() {
  const amount = Number(document.getElementById("amount").value);
  const method = document.getElementById("method").value.trim();

  if (amount < 100) {
    document.getElementById("message").textContent =
      "❌ Minimum withdrawal 100 coins.";
    return;
  }

  if (amount > coins) {
    document.getElementById("message").textContent =
      "❌ Coins gahaa hin qabdu.";
    return;
  }

  if (method === "") {
    document.getElementById("message").textContent =
      "❌ Telebirr ykn Bank galchi.";
    return;
  }

  coins -= amount;
  updateCoins();

  document.getElementById("message").textContent =
    "✅ Withdraw request galmaa'e.";
}

function signup() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === "" || password === "") {
    document.getElementById("message").textContent =
      "❌ Username fi Password guuti.";
    return;
  }

  localStorage.setItem("username", username);
  localStorage.setItem("password", password);

  document.getElementById("message").textContent =
    "✅ Account uumame!";
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const savedUsername = localStorage.getItem("username");
  const savedPassword = localStorage.getItem("password");

  if (username === savedUsername && password === savedPassword) {
    document.getElementById("message").textContent =
      "✅ Login milkaa'e!";

    document.getElementById("welcome").textContent =
      "👤 Welcome, " + username + "!";
  } else {
    document.getElementById("message").textContent =
      "❌ Username ykn Password sirrii miti.";
  }
updateCoins();function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("username");
    alert("Logout milkaa'e!");<link rel="stylesheet" href="style.css">
    location.reload();
}