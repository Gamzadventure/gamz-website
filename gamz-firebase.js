// ═══════════════════════════════════════════════════════════
// gamz-firebase.js — Shared Firebase helpers (ALL pages)
// ZERO gamz_users localStorage — 100% Firebase only
// ═══════════════════════════════════════════════════════════

const GAMZ_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDlLUTmmgNN2IEfSSS93vwhy8bU0uMwY4s",
  authDomain:        "gamz-eb101.firebaseapp.com",
  projectId:         "gamz-eb101",
  storageBucket:     "gamz-eb101.appspot.com",
  messagingSenderId: "1097358273455",
  appId:             "1:1097358273455:web:46a1796874dc5fe5d3dd5a"
};

let gamzDB   = null;
let gamzAuth = null;
try {
  if (!firebase.apps.length) firebase.initializeApp(GAMZ_FIREBASE_CONFIG);
  gamzDB   = firebase.firestore();
  gamzAuth = firebase.auth();
} catch(e) { console.warn("GamZ Firebase:", e.message); }

// ── Get current session user (small session token only) ──
function gamzCurrentUser() {
  return JSON.parse(localStorage.getItem('gamz_user') || 'null');
}

// ── Get full user profile from Firestore ─────────────────
async function gamzGetUserProfile(email) {
  if (!gamzDB || !email) return null;
  try {
    const doc = await gamzDB.collection('users').doc(email).get();
    return doc.exists ? doc.data() : null;
  } catch(e) {
    console.warn('Firestore profile read:', e.message);
    return null;
  }
}

// ── Save order to Firestore ───────────────────────────────
async function gamzSaveOrder(userEmail, game) {
  if (!gamzDB || !userEmail) return null;
  try {
    const orderId = 'GZ' + Date.now().toString(36).toUpperCase();
    await gamzDB.collection('orders').doc(orderId).set({
      orderId,
      userEmail,
      gameId:      game.id,
      gameName:    game.name,
      gameCategory:game.cat || '',
      amount:      game.price,
      purchasedAt: firebase.firestore.FieldValue.serverTimestamp(),
      status:      'Completed'
    });
    await gamzDB.collection('users').doc(userEmail).update({
      games: firebase.firestore.FieldValue.arrayUnion({
        id: game.id, name: game.name,
        price: game.price, purchasedAt: new Date().toISOString()
      }),
      totalSpent:     firebase.firestore.FieldValue.increment(game.price),
      lastPurchaseAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(async () => {
      // User doc missing — create it
      await gamzDB.collection('users').doc(userEmail).set({
        email: userEmail,
        games: [{id:game.id,name:game.name,price:game.price,purchasedAt:new Date().toISOString()}],
        totalSpent: game.price
      }, {merge:true});
    });
    console.log('✅ Order saved:', orderId);
    return orderId;
  } catch(e) {
    console.error('Firestore order save:', e.message);
    return null;
  }
}

// ── Get user's purchased games from Firestore ────────────
async function gamzGetUserGames(userEmail) {
  if (!gamzDB || !userEmail) return [];
  try {
    const doc = await gamzDB.collection('users').doc(userEmail).get();
    return doc.exists ? (doc.data().games || []) : [];
  } catch(e) {
    console.warn('Firestore games read:', e.message);
    return [];
  }
}

// ── Check if user owns a game ─────────────────────────────
async function gamzUserOwnsGame(userEmail, gameId) {
  const games = await gamzGetUserGames(userEmail);
  return games.some(g => g.id === gameId);
}

// ── Sync cart to Firestore ────────────────────────────────
async function gamzSyncCart(userEmail, cartItems) {
  // Keep cart in localStorage for fast UI (small data, not user profile)
  localStorage.setItem('gamz_cart', JSON.stringify(cartItems));
  if (!gamzDB || !userEmail) return;
  try {
    await gamzDB.collection('users').doc(userEmail).update({
      cart:          cartItems,
      cartUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e) { console.warn('Cart sync:', e.message); }
}

// ── Load cart (Firestore first, localStorage fallback) ────
async function gamzLoadCart(userEmail) {
  if (gamzDB && userEmail) {
    try {
      const doc = await gamzDB.collection('users').doc(userEmail).get();
      if (doc.exists && doc.data().cart) {
        const cart = doc.data().cart;
        localStorage.setItem('gamz_cart', JSON.stringify(cart));
        return cart;
      }
    } catch(e) { console.warn('Cart load:', e.message); }
  }
  return JSON.parse(localStorage.getItem('gamz_cart') || '[]');
}