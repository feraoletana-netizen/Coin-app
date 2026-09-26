// ================================
// Reward Game - Firebase Script
// ================================

// Firebase SDK
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ================================
// Firebase Configuration
// ================================

const firebaseConfig = {
  apiKey: "AIzaSyCKXC4ayhYXnLP-87q0C607xjimuGpwfmE",
  authDomain: "froreward-3c873.firebaseapp.com",
  projectId: "froreward-3c873",
  storageBucket: "froreward-3c873.firebasestorage.app",
  messagingSenderId: "552089097161",
  appId: "1:552089097161:web:9db8695b2f314d44ca8e18",
  measurementId: "G-P8C6R796NG"
};


// ================================
// Initialize Firebase
// ================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// ================================
// Local Variables
// ================================

let coins = 0;
let lastBonus = "";
let referralCode = "";
let referralCount = 0;


// ================================
// Helper Functions
// ================================

function showMessage(message) {
  const element = document.getElementById("message");

  if (element) {
    element.textContent = message;
  }
}


function updateCoins() {
  const element = document.getElementById("coins");

  if (element) {
    element.textContent = coins;
  }
}


function generateReferralCode() {
  return "RG" + Math.random().toString(36).substring(2, 8).toUpperCase();
}


function updateReferralUI() {
  const codeElement = document.getElementById("referralCode");
  const countElement = document.getElementById("referralCount");

  if (codeElement) {
    codeElement.textContent = referralCode || "LOADING";
  }

  if (countElement) {
    countElement.textContent = referralCount;
  }
}


// ================================
// Create / Load User Document
// ================================

async function createUserDocument(user, referredBy = "") {
  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {

    referralCode = generateReferralCode();

    await setDoc(userRef, {
      email: user.email,
      Coins: 0,
      Referralcode: referralCode,
      Refferalcount: 0,
      lastBonus: "",
      referredBy: referredBy,
      referralRewardGiven: false,
      createdAt: serverTimestamp()
    });

    coins = 0;
    lastBonus = "";
    referralCount = 0;

  } else {

    const data = userSnap.data();

    coins = Number(data.Coins) || 0;
    lastBonus = data.lastBonus || "";
    referralCode = data.Referralcode || generateReferralCode();
    referralCount = Number(data.Refferalcount) || 0;

    if (!data.Referralcode) {
      await updateDoc(userRef, {
        Referralcode: referralCode
      });
    }
  }

  updateCoins();
  updateReferralUI();
}


// ================================
// SIGN UP
// ================================

async function signup() {

  const emailElement = document.getElementById("email");
  const passwordElement = document.getElementById("password");

  if (!emailElement || !passwordElement) {
    showMessage("❌ Email fi Password hin argamne.");
    return;
  }

  const email = emailElement.value.trim();
  const password = passwordElement.value;

  if (!email || !password) {
    showMessage("❌ Email fi Password guuti.");
    return;
  }

  if (password.length < 6) {
    showMessage("❌ Password yoo xiqqaate 6 characters qabaachuu qaba.");
    return;
  }

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    const params = new URLSearchParams(window.location.search);
    const referredBy = params.get("ref") || "";

    await createUserDocument(user, referredBy);

    showMessage("✅ Galmeen milkaa'e!");

    emailElement.value = "";
    passwordElement.value = "";

  } catch (error) {

    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      showMessage("❌ Email kun duraan galmaa'eera.");
    } else if (error.code === "auth/invalid-email") {
      showMessage("❌ Email sirrii miti.");
    } else if (error.code === "auth/weak-password") {
      showMessage("❌ Password jabaa fayyadami.");
    } else {
      showMessage("❌ Signup irratti rakkoon uumame.");
    }
  }
}


// ================================
// LOGIN
// ================================

async function login() {

  const emailElement = document.getElementById("email");
  const passwordElement = document.getElementById("password");

  if (!emailElement || !passwordElement) {
    showMessage("❌ Email fi Password hin argamne.");
    return;
  }

  const email = emailElement.value.trim();
  const password = passwordElement.value;

  if (!email || !password) {
    showMessage("❌ Email fi Password guuti.");
    return;
  }

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    await createUserDocument(userCredential.user);

    showMessage("✅ Login milkaa'e!");

    emailElement.value = "";
    passwordElement.value = "";

  } catch (error) {

    console.error(error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      showMessage("❌ Email ykn Password sirrii miti.");
    } else {
      showMessage("❌ Login irratti rakkoon uumame.");
    }
  }
}


// ================================
// LOGOUT
// ================================

async function logout() {

  try {

    await signOut(auth);

    showMessage("✅ Logout milkaa'e!");

  } catch (error) {

    console.error(error);
    showMessage("❌ Logout irratti rakkoon uumame.");

  }
}


// ================================
// Account UI
// ================================

function updateAccountUI(user) {

  const welcome = document.getElementById("welcome");

  if (!welcome) return;

  if (user) {
    welcome.textContent = "Welcome, " + user.email + "!";
  } else {
    welcome.textContent = "Welcome, Guest!";
  }
}


// ================================
// DAILY REWARD +50
// ================================

async function dailyBonus() {

  const user = auth.currentUser;

  if (!user) {
    showMessage("❌ Dursa Login godhi.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  if (lastBonus === today) {
    showMessage("❌ Daily Bonus har'a fudhatameera.");
    return;
  }

  try {

    coins += 50;
    lastBonus = today;

    await updateDoc(
      doc(db, "Users", user.uid),
      {
        Coins: coins,
        lastBonus: lastBonus
      }
    );

    updateCoins();

    showMessage("🎉 Daily Reward +50 Coins argatte!");

  } catch (error) {

    console.error(error);
    showMessage("❌ Daily Reward irratti rakkoon uumame.");

  }
}


// ================================
// WATCH AD +10
// DEMO VERSION
// Real AdMob later in Android app
// ================================

async function watchAd() {

  const user = auth.currentUser;

  if (!user) {
    showMessage("❌ Dursa Login godhi.");
    return;
  }

  alert("📺 Demo Ad xumurame!");

  try {

    coins += 10;

    await updateDoc(
      doc(db, "Users", user.uid),
      {
        Coins: coins
      }
    );

    updateCoins();

    showMessage("🎉 +10 Coins argatte!");

  } catch (error) {

    console.error(error);
    showMessage("❌ Ad reward irratti rakkoon uumame.");

  }
}


// ================================
// PAYMENT METHOD
// ================================

function paymentMethodChanged() {

  const method =
    document.getElementById("paymentMethod");

  const details =
    document.getElementById("paymentDetails");

  if (!method || !details) return;

  if (method.value === "Telebirr") {

    details.placeholder =
      "Lakkoofsa Telebirr galchi";

  } else if (method.value === "Bank") {

    details.placeholder =
      "Maqaa bankii fi account number galchi";

  } else {

    details.placeholder =
      "Payment details galchi";
  }
}


// ================================
// WITHDRAW
// Minimum = 100 Coins
// ================================

async function withdraw() {

  const user = auth.currentUser;

  if (!user) {
    showMessage("❌ Dursa Login godhi.");
    return;
  }

  const amountElement =
    document.getElementById("withdrawAmount");

  const methodElement =
    document.getElementById("paymentMethod");

  const detailsElement =
    document.getElementById("paymentDetails");

  if (!amountElement || !methodElement || !detailsElement) {
    showMessage("❌ Withdrawal fields hin argamne.");
    return;
  }

  const amount = Number(amountElement.value);
  const method = methodElement.value;
  const details = detailsElement.value.trim();

  if (!amount || amount < 100) {
    showMessage("❌ Minimum withdrawal 100 Coins dha.");
    return;
  }

  if (amount > coins) {
    showMessage("❌ Coins gahaa hin qabdu.");
    return;
  }

  if (!method) {
    showMessage("❌ Payment method filadhu.");
    return;
  }

  if (!details) {
    showMessage("❌ Payment details galchi.");
    return;
  }

  try {

    const withdrawalRef =
      collection(
        db,
        "Users",
        user.uid,
        "withdrawals"
      );

    await addDoc(withdrawalRef, {

      amount: amount,
      method: method,
      details: details,
      status: "Pending",
      createdAt: serverTimestamp()

    });

    coins -= amount;

    await updateDoc(
      doc(db, "Users", user.uid),
      {
        Coins: coins
      }
    );

    updateCoins();

    amountElement.value = "";
    detailsElement.value = "";

    showMessage(
      "✅ Withdrawal request ergameera. Status: Pending"
    );

  } catch (error) {

    console.error(error);

    showMessage(
      "❌ Withdrawal irratti rakkoon uumame."
    );
  }
}


// ================================
// SHARE REFERRAL
// ================================

async function shareReferral() {

  const user = auth.currentUser;

  if (!user) {
    showMessage("❌ Dursa Login godhi.");
    return;
  }

  const link =
    window.location.origin +
    window.location.pathname +
    "?ref=" +
    referralCode;

  try {

    if (navigator.share) {

      await navigator.share({
        title: "Reward Game",
        text: "Reward Game irratti na waliin makami!",
        url: link
      });

    } else {

      await navigator.clipboard.writeText(link);

      showMessage(
        "✅ Referral link copy godhameera."
      );
    }

  } catch (error) {

    console.log(error);

  }
}


// ================================
// AUTH STATE
// ================================

onAuthStateChanged(auth, async (user) => {

  if (user) {

    try {

      await createUserDocument(user);

      updateAccountUI(user);

    } catch (error) {

      console.error(error);

      showMessage(
        "❌ User data loading irratti rakkoon uumame."
      );
    }

  } else {

    coins = 0;
    lastBonus = "";
    referralCode = "";
    referralCount = 0;

    updateCoins();
    updateReferralUI();
    updateAccountUI(null);
  }

});


// ================================
// Make Functions Available to HTML
// ================================

window.signup = signup;
window.login = login;
window.logout = logout;
window.dailyBonus = dailyBonus;
window.watchAd = watchAd;
window.withdraw = withdraw;
window.paymentMethodChanged = paymentMethodChanged;
window.shareReferral = shareReferral;


// Initial UI
updateCoins();
updateReferralUI();
updateAccountUI(auth.currentUser);
