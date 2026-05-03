(function () {
  const firebaseConfig = globalThis.AYUTA_FIREBASE_CONFIG || {};
  const settings = globalThis.AYUTA_AUTH_SETTINGS || {};
  const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const isConfigured = requiredConfigKeys.every((key) => {
    const value = firebaseConfig[key];
    return typeof value === 'string' && value.trim() !== '' && !value.includes('REPLACE_ME');
  });

  const normalizeText = (value) => String(value || '').trim();
  const pageElements = {};

  const setTone = (tone) => {
    if (pageElements.card) pageElements.card.dataset.tone = tone;
    if (pageElements.badge) {
      let badgeText;
      if (tone === 'error') badgeText = 'Link problem';
      else if (tone === 'success') badgeText = 'Complete';
      else if (tone === 'loading') badgeText = 'Checking link';
      else badgeText = 'Secure action';
      pageElements.badge.textContent = badgeText;
    }
  };

  const setMessage = (title, message, tone) => {
    if (pageElements.title) pageElements.title.textContent = title;
    if (pageElements.copy) pageElements.copy.textContent = message;
    if (tone) setTone(tone);
    document.title = `${title} | ayuta`;
  };

  const setFormStatus = (message, tone) => {
    if (!pageElements.resetStatus) return;
    pageElements.resetStatus.textContent = message;
    pageElements.resetStatus.dataset.tone = tone || '';
  };

  const getFallbackContinueUrl = () => {
    const configured =
      normalizeText(settings.emailContinueUrl) ||
      normalizeText(settings.passwordResetContinueUrl) ||
      normalizeText(settings.emailVerificationContinueUrl);
    if (configured) return configured;
    if (globalThis.location.protocol === 'http:' || globalThis.location.protocol === 'https:') {
      return `${globalThis.location.origin}/`;
    }
    return '/';
  };

  const resolveContinueUrl = (value) => {
    const fallback = getFallbackContinueUrl();
    const input = normalizeText(value);
    if (!input) return fallback;
    try {
      const url = new URL(input, globalThis.location.origin);
      if (url.origin !== globalThis.location.origin) return fallback;
      return url.toString();
    } catch {
      return fallback;
    }
  };

  const renderActions = (actions) => {
    if (!pageElements.actions) return;
    pageElements.actions.innerHTML = '';
    actions.forEach((action) => {
      const element = document.createElement(action.href ? 'a' : 'button');
      element.className = `auth-action-button${action.secondary ? ' is-secondary' : ''}`;
      element.textContent = action.label;
      if (action.href) {
        element.href = action.href;
      } else {
        element.type = 'button';
        element.addEventListener('click', action.onClick);
      }
      pageElements.actions.appendChild(element);
    });
  };

  const mapError = (error) => {
    const code = error && error.code ? error.code : '';
    if (code === 'auth/expired-action-code') return 'This link has expired. Request a fresh email and try again.';
    if (code === 'auth/invalid-action-code') return 'This link is invalid or has already been used.';
    if (code === 'auth/weak-password') return 'Use a password with at least 8 characters.';
    return error && error.message ? error.message : 'Something went wrong while completing this account action.';
  };

  const getAuth = (lang) => {
    if (!globalThis.firebase) {
      throw new Error('Authentication service could not be loaded.');
    }
    const app = globalThis.firebase.apps?.length ? globalThis.firebase.app() : globalThis.firebase.initializeApp(firebaseConfig);
    const auth = globalThis.firebase.auth(app);
    if (lang) auth.languageCode = lang;
    return auth;
  };

  const finalizeSuccess = (title, message, continueUrl, label) => {
    if (pageElements.resetForm) pageElements.resetForm.hidden = true;
    setMessage(title, message, 'success');
    renderActions([
      {
        label: label || 'Open ayuta',
        href: continueUrl
      }
    ]);
  };

  const handleVerifyEmail = async (auth, actionCode, continueUrl) => {
    await auth.applyActionCode(actionCode);
    await auth.currentUser?.reload();
    finalizeSuccess(
      'Email verified',
      'Your email address has been verified. You can return to ayuta and continue in the signed-in flow.',
      continueUrl,
      'Continue to ayuta'
    );
  };

  const handleRecoverEmail = async (auth, actionCode, continueUrl) => {
    const info = await auth.checkActionCode(actionCode);
    const restoredEmail = normalizeText(info?.data?.email ?? '');
    await auth.applyActionCode(actionCode);
    finalizeSuccess(
      'Email restored',
      restoredEmail
        ? `The previous address ${restoredEmail} has been restored on this account. If you did not make the original change, reset your password after signing in.`
        : 'The previous email address has been restored on this account.',
      continueUrl,
      'Return to ayuta'
    );
  };

  const handleResetPassword = async (auth, actionCode, continueUrl) => {
    const email = await auth.verifyPasswordResetCode(actionCode);
    if (!pageElements.resetForm || !pageElements.resetHelper || !pageElements.resetPassword || !pageElements.resetConfirm) {
      throw new Error('The password reset form could not be rendered.');
    }

    setMessage('Choose a new password', 'Enter a new password to finish resetting your ayuta account.', 'info');
    pageElements.resetHelper.textContent = `Resetting password for ${email}.`;
    pageElements.resetForm.hidden = false;
    renderActions([
      {
        label: 'Back to ayuta',
        href: continueUrl,
        secondary: true
      }
    ]);

    pageElements.resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const password = pageElements.resetPassword.value;
      const confirmPassword = pageElements.resetConfirm.value;

      if (password.length < 8) {
        setFormStatus('Use a password with at least 8 characters.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        setFormStatus('The passwords do not match.', 'error');
        return;
      }

      pageElements.resetSubmit.disabled = true;
      setFormStatus('Updating password...', 'loading');

      try {
        await auth.confirmPasswordReset(actionCode, password);
        pageElements.resetPassword.value = '';
        pageElements.resetConfirm.value = '';
        setFormStatus('', '');
        finalizeSuccess(
          'Password updated',
          'Your password has been changed. Sign in again from ayuta with the new password.',
          continueUrl,
          'Sign in'
        );
      } catch (error) {
        setFormStatus(mapError(error), 'error');
      } finally {
        pageElements.resetSubmit.disabled = false;
      }
    });
  };

  const initializeElements = () => {
    pageElements.card = document.getElementById('auth-action-card');
    pageElements.badge = document.getElementById('auth-action-badge');
    pageElements.title = document.getElementById('auth-action-title');
    pageElements.copy = document.getElementById('auth-action-copy');
    pageElements.actions = document.getElementById('auth-action-actions');
    pageElements.resetForm = document.getElementById('auth-reset-form');
    pageElements.resetHelper = document.getElementById('auth-reset-helper');
    pageElements.resetPassword = document.getElementById('auth-reset-password');
    pageElements.resetConfirm = document.getElementById('auth-reset-confirm');
    pageElements.resetSubmit = document.getElementById('auth-reset-submit');
    pageElements.resetStatus = document.getElementById('auth-reset-status');
  };

  const init = async () => {
    initializeElements();

    if (!isConfigured) {
      setMessage('Authentication unavailable', 'Authentication is not configured for this build, so this account action cannot be completed here.', 'error');
      renderActions([{ label: 'Open ayuta', href: getFallbackContinueUrl() }]);
      return;
    }

    const params = new URLSearchParams(globalThis.location.search);
    const mode = normalizeText(params.get('mode'));
    const actionCode = normalizeText(params.get('oobCode'));
    const continueUrl = resolveContinueUrl(params.get('continueUrl'));
    const lang = normalizeText(params.get('lang')) || 'en';

    if (!mode || !actionCode) {
      setMessage('Link incomplete', 'This email action link is missing information. Request a fresh email and try again.', 'error');
      renderActions([{ label: 'Open ayuta', href: continueUrl }]);
      return;
    }

    try {
      const auth = getAuth(lang);
      if (mode === 'verifyEmail') {
        await handleVerifyEmail(auth, actionCode, continueUrl);
        return;
      }
      if (mode === 'resetPassword') {
        await handleResetPassword(auth, actionCode, continueUrl);
        return;
      }
      if (mode === 'recoverEmail') {
        await handleRecoverEmail(auth, actionCode, continueUrl);
        return;
      }
      setMessage('Action not supported', 'This account action is not handled on this page yet.', 'error');
      renderActions([{ label: 'Open ayuta', href: continueUrl }]);
    } catch (error) {
      if (pageElements.resetForm) pageElements.resetForm.hidden = true;
      setMessage('Link could not be completed', mapError(error), 'error');
      renderActions([{ label: 'Open ayuta', href: continueUrl }]);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    init().catch((error) => {
      initializeElements();
      setMessage('Link could not be completed', mapError(error), 'error');
      renderActions([{ label: 'Open ayuta', href: getFallbackContinueUrl() }]);
    });
  });
})();
