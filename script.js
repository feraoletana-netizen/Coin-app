let coins = Number(localStorage.getItem("coins")) || 50;

let lastBonus = localStorage.getItem("lastBonus") || "";

let withdrawalHistory = JSON.parse(
  localStorage.getItem("withdrawalHistory") || "[]"
);

let authReady = false;


// =========================
// COINS
// =========================

function updateCoins() {
  const coinElement = document.getElementById("coins");

  if (coinElement) {
    coinElement.textContent = coins;
  }

  localStorage.setItem("coins", coins);
}


// =========================
// MESSAGE
// =========================

function showMessage(text) {
  const message = document.getElementById("message");

  if (message) {
    message.textContent = text;
  }
}


// =========================
// DAILY BONUS
// =========================

function dailyBonus() {
  const today = new Date().toISOString().split("T")[0];

  if (lastBonus === today) {
    showMessage("❌ Daily Bonus har'a fudhatameera.");
    return;
  }

  coins += 50;

  lastBonus = today;

  localStorage.setItem("lastBonus", lastBonus);

  updateCoins();

  showMessage("🎁 +50 Coins argatte!");
}


// =========================
// WATCH AD
// =========================

function watchAd() {
  alert("📺 Demo Ad xumurame!");

  coins += 10;

  updateCoins();

  showMessage("🎉 +10 Coins argatte!");
}


// =========================
// PAYMENT METHOD
// =========================

function paymentMethodChanged() {

  const methodElement = document.getElementById("method");

  const telebirrFields =
    document.getElementById("telebirrFields");

  const bankFields =
    document.getElementById("bankFields");

  if (!methodElement) {
    return;
  }

  const method = methodElement.value;

  if (telebirrFields) {
    telebirrFields.style.display =
      method === "Telebirr" ? "block" : "none";
  }

  if (bankFields) {
    bankFields.style.display =
      method === "Bank" ? "block" : "none";
  }
}


// =========================
// WITHDRAW
// =========================

function withdraw() {

  const amountElement =
    document.getElementById("amount");

  const methodElement =
    document.getElementById("method");

  const telebirrElement =
    document.getElementById("telebirrNumber");

  const bankNameElement =
    document.getElementById("bankName");

  const bankAccountElement =
    document.getElementById("bankAccount");


  if (!amountElement || !methodElement) {

    showMessage(
      "❌ Withdrawal form hin argamne."
    );

    return;
  }


  const amount =
    Number(amountElement.value);

  const method =
    methodElement.value.trim();


  // Minimum withdrawal

  if (amount < 1000) {

    showMessage(
      "❌ Minimum withdrawal 1000 Coins."
    );

    return;
  }


  // Coins check

  if (amount > coins) {

    showMessage(
      "❌ Coins gahaa hin qabdu."
    );

    return;
  }


  // Payment method check

  if (method === "") {

    showMessage(
      "❌ Telebirr ykn Bank filadhu."
    );

    return;
  }


  // =========================
  // TELEBIRR
  // =========================

  if (method === "Telebirr") {

    const telebirrNumber =
      telebirrElement
        ? telebirrElement.value.trim()
        : "";


    if (telebirrNumber === "") {

      showMessage(
        "❌ Lakkoofsa Telebirr galchi."
      );

      return;
    }


    if (telebirrNumber.length < 9) {

      showMessage(
        "❌ Lakkoofsa Telebirr sirrii galchi."
      );

      return;
    }


    coins -= amount;

    updateCoins();


    const request = {

      amount: amount,

      method: "Telebirr",

      telebirrNumber: telebirrNumber,

      date: new Date().toLocaleString()

    };


    withdrawalHistory.push(request);


    localStorage.setItem(
      "withdrawalHistory",
      JSON.stringify(withdrawalHistory)
    );


    amountElement.value = "";

    if (telebirrElement) {
      telebirrElement.value = "";
    }


    showMessage(
      "✅ Telebirr withdrawal request galmaa'e!"
    );

    return;
  }


  // =========================
  // BANK
  // =========================

  if (method === "Bank") {

    const bankName =
      bankNameElement
        ? bankNameElement.value.trim()
        : "";

    const bankAccount =
      bankAccountElement
        ? bankAccountElement.value.trim()
        : "";


    if (bankName === "") {

      showMessage(
        "❌ Maqaa Bank galchi."
      );

      return;
    }


    if (bankAccount === "") {

      showMessage(
        "❌ Lakkoofsa Account Bank galchi."
      );

      return;
    }


    if (bankAccount.length < 5) {

      showMessage(
        "❌ Account Number sirrii galchi."
      );

      return;
    }


    coins -= amount;

    updateCoins();


    const request = {

      amount: amount,

      method: "Bank",

      bankName: bankName,

      bankAccount: bankAccount,

      date: new Date().toLocaleString()

    };


    withdrawalHistory.push(request);


    localStorage.setItem(
      "withdrawalHistory",
      JSON.stringify(withdrawalHistory)
    );


    amountElement.value = "";

    if (bankNameElement) {
      bankNameElement.value = "";
    }

    if (bankAccountElement) {
      bankAccountElement.value = "";
    }


    showMessage(
      "✅ Bank withdrawal request galmaa'e!"
    );

    return;
  }
}


// =========================
// SIGN UP
// =========================

async function signup() {

  const emailElement =
    document.getElementById("username");

  const passwordElement =
    document.getElementById("password");


  if (!emailElement || !passwordElement) {

    showMessage(
      "❌ Email fi Password hin argamne."
    );

    return;
  }


  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  if (email === "" || password === "") {

    showMessage(
      "❌ Email fi Password guuti."
    );

    return;
  }


  if (password.length < 6) {

    showMessage(
      "❌ Password yoo xiqqaate 6 characters qabaachuu qaba."
    );

    return;
  }


  if (!authReady) {

    showMessage(
      "⏳ Firebase qophaa'aa jira. Mee xiqqoo eegi."
    );

    return;
  }


  try {

    const fb = window.firebaseAuth;


    await fb.createUserWithEmailAndPassword(
      fb.auth,
      email,
      password
    );


    showMessage(
      "✅ Account uumame!"
    );

  } catch (error) {

    console.error(error);


    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      showMessage(
        "❌ Email kun duraan account qaba."
      );

    } else if (
      error.code ===
      "auth/invalid-email"
    ) {

      showMessage(
        "❌ Email sirrii galchi."
      );

    } else if (
      error.code ===
      "auth/weak-password"
    ) {

      showMessage(
        "❌ Password cimaa fayyadami."
      );

    } else {

      showMessage(
        "❌ Account uumuu irratti rakkoon uumame."
      );
    }
  }
}


// =========================
// LOGIN
// =========================

async function login() {

  const emailElement =
    document.getElementById("username");

  const passwordElement =
    document.getElementById("password");


  if (!emailElement || !passwordElement) {

    showMessage(
      "❌ Email fi Password hin argamne."
    );

    return;
  }


  const email =
    emailElement.value.trim();

  const password =
    passwordElement.value;


  if (email === "" || password === "") {

    showMessage(
      "❌ Email fi Password guuti."
    );

    return;
  }


  if (!authReady) {

    showMessage(
      "⏳ Firebase qophaa'aa jira. Mee xiqqoo eegi."
    );

    return;
  }


  try {

    const fb = window.firebaseAuth;


    await fb.signInWithEmailAndPassword(
      fb.auth,
      email,
      password
    );


    showMessage(
      "✅ Login milkaa'e!"
    );

  } catch (error) {

    console.error(error);


    if (
      error.code ===
        "auth/invalid-credential" ||
      error.code ===
        "auth/wrong-password" ||
      error.code ===
        "auth/user-not-found"
    ) {

      showMessage(
        "❌ Email ykn Password sirrii miti."
      );

    } else if (
      error.code ===
      "auth/invalid-email"
    ) {

      showMessage(
        "❌ Email sirrii galchi."
      );

    } else {

      showMessage(
        "❌ Login irratti rakkoon uumame."
      );
    }
  }
}


// =========================
// LOGOUT
// =========================

async function logout() {

  if (!authReady) {

    showMessage(
      "⏳ Firebase qophaa'aa jira."
    );

    return;
  }


  try {

    const fb = window.firebaseAuth;


    await fb.signOut(fb.auth);


    showMessage(
      "✅ Logout milkaa'e!"
    );

  } catch (error) {

    console.error(error);


    showMessage(
      "❌ Logout irratti rakkoon uumame."
    );
  }
}


// =========================
// FIREBASE AUTH
// =========================

function initFirebaseAuth() {

  if (!window.firebaseAuth) {

    setTimeout(
      initFirebaseAuth,
      100
    );

    return;
  }


  const fb =
    window.firebaseAuth;


  authReady = true;


  fb.onAuthStateChanged(
    fb.auth,
    function(user) {

      const welcome =
        document.getElementById("welcome");


      if (!welcome) {
        return;
      }


      if (user) {

        welcome.textContent =
          "👤 Welcome, " +
          user.email +
          "!";

      } else {

        welcome.textContent =
          "👤 Welcome, Guest!";
      }

    }
  );
}


// =========================
// MAKE FUNCTIONS AVAILABLE
// =========================

window.dailyBonus = dailyBonus;

window.watchAd = watchAd;

window.paymentMethodChanged =
  paymentMethodChanged;

window.withdraw = withdraw;

window.signup = signup;

window.login = login;

window.logout = logout;


// =========================
// START
// =========================

updateCoins();

initFirebaseAuth();
