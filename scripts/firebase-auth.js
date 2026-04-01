(function () {
  const firebaseConfig = window.AYUTA_FIREBASE_CONFIG || {};
  const settings = window.AYUTA_AUTH_SETTINGS || {};
  const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const isConfigured = requiredConfigKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === 'string' && value.trim() !== '' && !value.includes('REPLACE_ME');
  });

  const state = {
    configured: isConfigured,
    loading: isConfigured,
    ready: !isConfigured,
    user: null,
    profile: null,
    error: null
  };
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const CACHE_PREFIX = 'ayuta_cache_v1';

  let auth = null;
  let db = null;
  let readyResolved = false;
  let readyResolve = null;

  const readyPromise = new Promise((resolve) => {
    readyResolve = resolve;
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const normalizeText = (value) => String(value || '').trim();
  const normalizeUrl = (value) => {
    const input = normalizeText(value);
    if (!input) return '';
    try {
      return new URL(input, window.location.origin).toString();
    } catch (error) {
      return '';
    }
  };
  const resolveDefaultContinueUrl = () => {
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      return normalizeUrl(`${window.location.origin}/`);
    }
    return '';
  };
  const buildEmailActionSettings = (purpose) => {
    const purposeUrl =
      purpose === 'verifyEmail'
        ? settings.emailVerificationContinueUrl
        : purpose === 'resetPassword'
          ? settings.passwordResetContinueUrl
          : '';
    const url = normalizeUrl(purposeUrl || settings.emailContinueUrl || resolveDefaultContinueUrl());
    if (!url) return undefined;
    return {
      url,
      handleCodeInApp: false
    };
  };
  const cacheStorage = (() => {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  })();

  const getCacheKey = (scope, uid) => `${CACHE_PREFIX}:${scope}:${uid}`;

  const readCache = (scope, uid) => {
    if (!cacheStorage || !uid) return null;
    try {
      const raw = cacheStorage.getItem(getCacheKey(scope, uid));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.expiresAt < Date.now()) {
        cacheStorage.removeItem(getCacheKey(scope, uid));
        return null;
      }
      return parsed.data;
    } catch (error) {
      return null;
    }
  };

  const writeCache = (scope, uid, data, ttl = CACHE_TTL_MS) => {
    if (!cacheStorage || !uid) return;
    try {
      cacheStorage.setItem(
        getCacheKey(scope, uid),
        JSON.stringify({
          expiresAt: Date.now() + ttl,
          data
        })
      );
    } catch (error) {
      return;
    }
  };

  const clearUserCache = (uid) => {
    if (!cacheStorage || !uid) return;
    ['profile', 'orders', 'results'].forEach((scope) => {
      try {
        cacheStorage.removeItem(getCacheKey(scope, uid));
      } catch (error) {
        return;
      }
    });
  };

  const getSerializableUser = (user) =>
    user
      ? {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          emailVerified: Boolean(user.emailVerified)
        }
      : null;

  const getSnapshot = () => ({
    configured: state.configured,
    loading: state.loading,
    ready: state.ready,
    error: state.error,
    user: getSerializableUser(state.user),
    profile: state.profile ? clone(state.profile) : null
  });

  const resolveReady = () => {
    if (readyResolved) return;
    readyResolved = true;
    if (readyResolve) readyResolve(getSnapshot());
  };

  const syncLocalMirror = () => {
    const store = window.AyutaStore;
    if (!store || typeof store.loadState !== 'function' || typeof store.saveState !== 'function') return;

    const localState = store.loadState();
    if (state.user && state.profile) {
      const existingSession = localState.session || {};
      localState.user = {
        uid: state.user.uid,
        name: state.profile.name || '',
        email: state.profile.email || state.user.email || '',
        phone: state.profile.phone || '',
        emailVerified: Boolean(state.user.emailVerified),
        updatedAt: state.profile.updatedAt || new Date().toISOString()
      };
      localState.session = {
        uid: state.user.uid,
        email: state.profile.email || state.user.email || '',
        emailVerified: Boolean(state.user.emailVerified),
        loggedInAt: existingSession.uid === state.user.uid ? existingSession.loggedInAt : new Date().toISOString()
      };
    } else {
      localState.user = null;
      localState.session = null;
    }

    store.saveState(localState);
  };

  const dispatchAuthUpdate = () => {
    syncLocalMirror();
    const detail = getSnapshot();
    window.dispatchEvent(new CustomEvent('ayuta:auth-updated', { detail }));
    window.dispatchEvent(new CustomEvent('ayuta:state-updated', { detail }));
  };

  const mapAuthError = (error) => {
    const code = error && error.code ? error.code : '';

    if (code === 'auth/email-already-in-use') return 'That email address already has an account.';
    if (code === 'auth/invalid-email') return 'Enter a valid email address.';
    if (code === 'auth/weak-password') return 'Use a password with at least 8 characters.';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
      return 'The email or password is incorrect.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Try again in a few minutes.';
    if (code === 'auth/network-request-failed') return 'The network request failed. Check your connection and try again.';
    if (code === 'auth/requires-recent-login') return 'Please sign in again before changing this profile setting.';

    return error && error.message ? error.message : 'Something went wrong. Please try again.';
  };

  const assertConfigured = () => {
    if (!state.configured) {
      throw new Error('Authentication is not configured yet. Add your Firebase project values in scripts/auth-config.js.');
    }
  };

  const assertUser = () => {
    assertConfigured();
    if (!auth || !auth.currentUser) {
      throw new Error('Sign in to continue.');
    }
    return auth.currentUser;
  };

  const getProfileRef = (uid) => db.collection('users').doc(uid);
  const getOrdersRef = (uid) => getProfileRef(uid).collection('orders');
  const getResultsRef = (uid) => getProfileRef(uid).collection('results');

  const buildProfilePayload = (user, input) => ({
    uid: user.uid,
    email: normalizeText(input && input.email ? input.email : user.email),
    name: normalizeText(input && Object.prototype.hasOwnProperty.call(input, 'name') ? input.name : user.displayName),
    phone: normalizeText(input && input.phone ? input.phone : ''),
    emailVerified: Boolean(user.emailVerified),
    createdAt:
      normalizeText(input && input.createdAt ? input.createdAt : '') ||
      normalizeText(state.profile && state.profile.createdAt ? state.profile.createdAt : '') ||
      new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const loadProfile = async (user) => {
    const ref = getProfileRef(user.uid);
    const cached = readCache('profile', user.uid);
    if (cached) {
      return buildProfilePayload(user, cached);
    }
    const snapshot = await ref.get();

    if (snapshot.exists) {
      const saved = snapshot.data() || {};
      const profile = buildProfilePayload(user, {
        ...saved,
        email: saved.email || user.email,
        name: saved.name || user.displayName || '',
        phone: saved.phone || ''
      });
      await ref.set(profile, { merge: true });
      writeCache('profile', user.uid, profile);
      return profile;
    }

    const profile = buildProfilePayload(user, {
      email: user.email,
      name: user.displayName || '',
      phone: ''
    });
    await ref.set(profile, { merge: true });
    writeCache('profile', user.uid, profile);
    return profile;
  };

  const mergeUnique = (items, key) => {
    const seen = new Map();
    items.forEach((item) => {
      const value = item && item[key];
      if (!value || seen.has(value)) return;
      seen.set(value, item);
    });
    return Array.from(seen.values());
  };

  const initialize = () => {
    if (!state.configured) {
      state.loading = false;
      state.ready = true;
      resolveReady();
      dispatchAuthUpdate();
      return;
    }

    if (!window.firebase) {
      state.loading = false;
      state.ready = true;
      state.error = 'Firebase could not be loaded.';
      resolveReady();
      dispatchAuthUpdate();
      return;
    }

    try {
      const app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(firebaseConfig);
      auth = window.firebase.auth(app);
      db = window.firebase.firestore(app);

      auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

      auth.onAuthStateChanged(async (firebaseUser) => {
        const previousUid = state.user && state.user.uid;
        state.user = firebaseUser;
        state.error = null;

        if (firebaseUser) {
          try {
            state.profile = await loadProfile(firebaseUser);
          } catch (error) {
            console.error(error);
            state.profile = buildProfilePayload(firebaseUser, {
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              phone: ''
            });
            state.error = 'Your account loaded, but the profile store could not be reached.';
          }
        } else {
          if (previousUid) clearUserCache(previousUid);
          state.profile = null;
        }

        state.loading = false;
        state.ready = true;
        resolveReady();
        dispatchAuthUpdate();
      });
    } catch (error) {
      console.error(error);
      state.loading = false;
      state.ready = true;
      state.error = 'Authentication failed to initialize.';
      resolveReady();
      dispatchAuthUpdate();
    }
  };

  const whenReady = async () => readyPromise;

  const register = async ({ name, email, password, phone }) => {
    assertConfigured();

    const safeName = normalizeText(name);
    const safeEmail = normalizeText(email).toLowerCase();
    const safePassword = String(password || '');
    const safePhone = normalizeText(phone);

    if (!safeName || !safeEmail || safePassword.length < 8) {
      throw new Error('Enter your name, email, and a password with at least 8 characters.');
    }

    try {
      const credential = await auth.createUserWithEmailAndPassword(safeEmail, safePassword);
      if (credential.user && safeName) {
        await credential.user.updateProfile({ displayName: safeName });
      }

      const profile = buildProfilePayload(credential.user, {
        name: safeName,
        email: safeEmail,
        phone: safePhone
      });

      await getProfileRef(credential.user.uid).set(profile, { merge: true });
      writeCache('profile', credential.user.uid, profile);

      let verificationSent = false;
      if (settings.enableEmailVerification !== false && credential.user && !credential.user.emailVerified) {
        try {
          const emailActionSettings = buildEmailActionSettings('verifyEmail');
          if (emailActionSettings) {
            await credential.user.sendEmailVerification(emailActionSettings);
          } else {
            await credential.user.sendEmailVerification();
          }
          verificationSent = true;
        } catch (error) {
          console.warn('Verification email failed', error);
        }
      }

      state.user = credential.user;
      state.profile = profile;
      dispatchAuthUpdate();
      return { profile, verificationSent };
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const login = async ({ email, password }) => {
    assertConfigured();
    const safeEmail = normalizeText(email).toLowerCase();
    const safePassword = String(password || '');

    if (!safeEmail || !safePassword) {
      throw new Error('Enter your email and password.');
    }

    try {
      await auth.signInWithEmailAndPassword(safeEmail, safePassword);
      if (auth.currentUser) {
        state.user = auth.currentUser;
        state.profile = await loadProfile(auth.currentUser);
        dispatchAuthUpdate();
      }
      return getSnapshot();
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const logout = async () => {
    assertConfigured();

    try {
      await auth.signOut();
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const sendPasswordReset = async (email) => {
    assertConfigured();
    const safeEmail = normalizeText(email).toLowerCase();

    if (!safeEmail) {
      throw new Error('Enter your email address first.');
    }

    try {
      const emailActionSettings = buildEmailActionSettings('resetPassword');
      if (emailActionSettings) {
        await auth.sendPasswordResetEmail(safeEmail, emailActionSettings);
      } else {
        await auth.sendPasswordResetEmail(safeEmail);
      }
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const saveProfile = async ({ name, phone }) => {
    const user = assertUser();
    const nextName = normalizeText(name);
    const nextPhone = normalizeText(phone);

    if (!nextName) {
      throw new Error('Full name is required.');
    }

    try {
      if (nextName !== normalizeText(user.displayName)) {
        await user.updateProfile({ displayName: nextName });
      }

      const nextProfile = buildProfilePayload(user, {
        ...state.profile,
        name: nextName,
        phone: nextPhone
      });

      await getProfileRef(user.uid).set(nextProfile, { merge: true });
      state.profile = nextProfile;
      writeCache('profile', user.uid, nextProfile);
      dispatchAuthUpdate();
      return nextProfile;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const refreshProfile = async () => {
    const user = assertUser();

    try {
      clearUserCache(user.uid);
      await user.reload();
      state.user = auth.currentUser;
      state.profile = await loadProfile(auth.currentUser);
      dispatchAuthUpdate();
      return state.profile;
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
  };

  const saveOrder = async (order) => {
    const user = assertUser();
    const payload = {
      ...order,
      ownerUid: user.uid,
      email: normalizeText(order.email || user.email),
      updatedAt: new Date().toISOString()
    };

    try {
      await getOrdersRef(user.uid).doc(payload.id).set(payload, { merge: true });
      const cachedOrders = readCache('orders', user.uid) || [];
      writeCache('orders', user.uid, mergeUnique([payload, ...cachedOrders], 'id'));
      return payload;
    } catch (error) {
      throw new Error('The order was created, but it could not be synced to the account store yet.');
    }
  };

  const saveResult = async (entry) => {
    const user = assertUser();
    const payload = {
      ...entry,
      ownerUid: user.uid,
      email: normalizeText(entry.email || user.email),
      updatedAt: new Date().toISOString()
    };

    try {
      await getResultsRef(user.uid).doc(payload.orderId).set(payload, { merge: true });
      const cachedResults = readCache('results', user.uid) || [];
      writeCache('results', user.uid, mergeUnique([payload, ...cachedResults], 'orderId'));
      return payload;
    } catch (error) {
      throw new Error('The test result could not be synced to the account store yet.');
    }
  };

  const listOrders = async () => {
    await whenReady();
    const user = assertUser();
    const cached = readCache('orders', user.uid);
    if (cached) return mergeUnique(cached, 'id');

    try {
      const snapshot = await getOrdersRef(user.uid).orderBy('createdAt', 'desc').get();
      const orders = snapshot.docs.map((doc) => doc.data());
      writeCache('orders', user.uid, orders);
      return mergeUnique(orders, 'id');
    } catch (error) {
      throw new Error('Your orders could not be loaded from the account store.');
    }
  };

  const listResults = async () => {
    await whenReady();
    const user = assertUser();
    const cached = readCache('results', user.uid);
    if (cached) return mergeUnique(cached, 'orderId');

    try {
      const snapshot = await getResultsRef(user.uid).orderBy('createdAt', 'desc').get();
      const results = snapshot.docs.map((doc) => doc.data());
      writeCache('results', user.uid, results);
      return mergeUnique(results, 'orderId');
    } catch (error) {
      throw new Error('Your test results could not be loaded from the account store.');
    }
  };

  window.AyutaAuth = {
    whenReady,
    getSnapshot,
    getCurrentUser: () => (auth ? auth.currentUser : null),
    isConfigured: () => state.configured,
    register,
    login,
    logout,
    sendPasswordReset,
    saveProfile,
    refreshProfile,
    saveOrder,
    saveResult,
    listOrders,
    listResults
  };

  initialize();
})();
