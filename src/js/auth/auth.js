/**
 * RouteLine - Central Authentication & Session Manager (auth.js)
 * Manages Login, Sign Up, Guest session, Protected Booking Flow, and Header State
 */

import { validateLoginInput, bindPasswordToggles } from './login.js';
import { validateSignupInput } from './signup.js';

// Storage Keys
export const STORAGE_AUTH_USER = 'routeline_auth_user';
export const STORAGE_REGISTERED_USERS = 'routeline_registered_users';
export const STORAGE_AUTH_PROMPT_DISMISSED = 'routeline_auth_prompt_dismissed';
export const STORAGE_GUEST_DISMISSED = STORAGE_AUTH_PROMPT_DISMISSED;

/**
 * Checks if the initial authentication popup has been dismissed in the current session/browser
 */
export function isAuthPromptDismissed() {
  if (typeof window === 'undefined') return false;
  try {
    const sessionVal = window.sessionStorage ? sessionStorage.getItem(STORAGE_AUTH_PROMPT_DISMISSED) : null;
    const localVal = window.localStorage ? localStorage.getItem(STORAGE_AUTH_PROMPT_DISMISSED) : null;
    return sessionVal === 'true' || localVal === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks the initial authentication popup as dismissed
 * Stored separately from authentication state using routeline_auth_prompt_dismissed
 */
export function setAuthPromptDismissed() {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage) {
      sessionStorage.setItem(STORAGE_AUTH_PROMPT_DISMISSED, 'true');
    }
  } catch {}
  try {
    if (window.localStorage) {
      localStorage.setItem(STORAGE_AUTH_PROMPT_DISMISSED, 'true');
    }
  } catch {}
}

/**
 * Public alias for dismissing the initial authentication prompt
 */
export function dismissAuthPrompt() {
  setAuthPromptDismissed();
}

// Seed Initial Demo Account
const SEED_USERS = [
  {
    id: 'usr_demo_1',
    name: 'Sauryaman Bisen',
    email: 'example@gmail.com',
    password: 'password123',
    createdAt: '2026-09-08'
  }
];

// In-Memory Pending Booking Callback
let pendingBookingAction = null;

/**
 * Initialize Registered Users store
 */
function ensureUsersStore() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(STORAGE_REGISTERED_USERS);
  if (!existing) {
    localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(SEED_USERS));
  }
}

/**
 * Get list of registered users
 */
function getRegisteredUsers() {
  ensureUsersStore();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_REGISTERED_USERS)) || SEED_USERS;
  } catch (e) {
    return SEED_USERS;
  }
}

/**
 * Checks if the user is authenticated
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const user = getCurrentUser();
  return Boolean(user && user.email);
}

/**
 * Gets currently logged in user
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Authenticates user credentials
 */
export function loginUser({ identifier, password, remember = true }) {
  const validation = validateLoginInput(identifier, password);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const users = getRegisteredUsers();
  const cleanId = identifier.trim().toLowerCase();

  const user = users.find(u => 
    u.email.toLowerCase() === cleanId || 
    (u.name && u.name.toLowerCase() === cleanId)
  );

  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid email/username or password. Please try again.' };
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: `rl_token_${Date.now()}`,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

/**
 * Registers a new user
 */
export function signupUser({ name, email, password, confirmPassword }) {
  const validation = validateSignupInput({ name, email, password, confirmPassword });
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();

  const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  const newUser = {
    id: `usr_${Date.now().toString(36)}`,
    name: name.trim(),
    email: cleanEmail,
    password: password,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(users));

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    token: `rl_token_${Date.now()}`,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

/**
 * Logs out user and reverts to Guest session
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_AUTH_USER);
  updateHeaderAuthState();
  showAuthToast('Logged out successfully. You are now browsing as Guest.', 'info');
}

/**
 * Guard function for protected booking actions
 */
export function requireAuthentication(actionCallback) {
  if (isAuthenticated()) {
    if (typeof actionCallback === 'function') actionCallback();
    return true;
  }

  // Not authenticated -> Save pending action and prompt modal
  pendingBookingAction = actionCallback;
  openAuthModal(null, 'login', 'Please log in or sign up to complete your ticket booking.');
  return false;
}

/**
 * Resumes and clears any pending booking action
 */
function resumePendingBookingAction() {
  if (typeof pendingBookingAction === 'function') {
    const action = pendingBookingAction;
    pendingBookingAction = null;
    showAuthToast('Authentication successful! Continuing your booking...', 'success');
    setTimeout(() => {
      action();
    }, 250);
  }
}

/**
 * Opens Authentication Modal
 */
export function openAuthModal(onSuccessCallback = null, initialTab = 'login', customMessage = null) {
  if (typeof document === 'undefined') return;
  if (typeof onSuccessCallback === 'function') {
    pendingBookingAction = onSuccessCallback;
  }

  ensureAuthModalDOM();

  const backdrop = document.getElementById('rl-auth-modal-backdrop');
  if (!backdrop) return;

  switchAuthTab(initialTab);
  clearAuthAlert();

  if (customMessage) {
    showAuthAlert(customMessage, 'info');
  }

  backdrop.style.display = 'flex';
  if (document.body) document.body.style.overflow = 'hidden';

  if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  // Autofocus input
  setTimeout(() => {
    if (initialTab === 'signup') {
      document.getElementById('rl-signup-name')?.focus();
    } else {
      document.getElementById('rl-login-email')?.focus();
    }
  }, 100);
}

/**
 * Closes Authentication Modal
 */
export function closeAuthModal() {
  if (typeof document === 'undefined') return;
  const backdrop = document.getElementById('rl-auth-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
  if (document.body) document.body.style.overflow = '';
}

/**
 * Handles Continue as Guest
 */
export function continueAsGuest() {
  setAuthPromptDismissed();
  closeAuthModal();
  pendingBookingAction = null;
  showAuthToast('Continuing as Guest. You can browse all schedules and trains freely.', 'info');
}

/**
 * Switch between Login and Sign Up tabs
 */
export function switchAuthTab(tab = 'login') {
  const loginTabBtn = document.getElementById('rl-tab-login');
  const signupTabBtn = document.getElementById('rl-tab-signup');
  const loginForm = document.getElementById('rl-login-form');
  const signupForm = document.getElementById('rl-signup-form');
  const modalTitle = document.getElementById('rl-auth-modal-title');
  const modalSub = document.getElementById('rl-auth-modal-subtitle');

  clearAuthAlert();

  if (tab === 'signup') {
    loginTabBtn?.classList.remove('active');
    signupTabBtn?.classList.add('active');
    loginForm?.classList.remove('active');
    signupForm?.classList.add('active');
    if (modalTitle) modalTitle.textContent = 'Create RouteLine Account';
    if (modalSub) modalSub.textContent = 'Sign up to unlock instant bookings, live PNR tracking, and exclusive discounts.';
  } else {
    signupTabBtn?.classList.remove('active');
    loginTabBtn?.classList.add('active');
    signupForm?.classList.remove('active');
    loginForm?.classList.add('active');
    if (modalTitle) modalTitle.textContent = 'Welcome Back to RouteLine';
    if (modalSub) modalSub.textContent = 'Login to manage your journeys and proceed with fast ticket booking.';
  }

  if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

/**
 * Shows Alert Banner inside Modal
 */
function showAuthAlert(message, type = 'error') {
  const alert = document.getElementById('rl-auth-alert');
  const text = document.getElementById('rl-auth-alert-text');
  const icon = document.getElementById('rl-auth-alert-icon');
  if (!alert || !text) return;

  alert.className = `rl-auth-alert ${type}`;
  text.textContent = message;

  if (icon) {
    icon.setAttribute('data-lucide', type === 'error' ? 'alert-circle' : 'info');
    if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  alert.style.display = 'flex';
}

/**
 * Clears Alert Banner
 */
function clearAuthAlert() {
  const alert = document.getElementById('rl-auth-alert');
  if (alert) alert.style.display = 'none';
}

/**
 * Toast Notification Helper
 */
export function showAuthToast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('rl-auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'rl-auth-toast';
    document.body.appendChild(toast);
  }

  toast.className = `rl-auth-toast ${type}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}" style="width:18px;height:18px;"></i>
    <span>${message}</span>
  `;

  if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  toast.style.display = 'flex';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

/**
 * Ensures Modal DOM elements exist
 */
function ensureAuthModalDOM() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rl-auth-modal-backdrop')) return;

  const modalHTML = `
    <div id="rl-auth-modal-backdrop" class="rl-auth-backdrop" style="display: none;" role="dialog" aria-modal="true">
        <div class="rl-auth-modal">
            <button type="button" class="rl-auth-close-btn" id="rl-auth-close-btn" aria-label="Close Authentication Modal">
                <i data-lucide="x" style="width: 18px; height: 18px;"></i>
            </button>

            <div class="rl-auth-header">
                <div class="rl-auth-badge">
                    <i data-lucide="shield-check" style="width: 15px; height: 15px;"></i>
                    <span>RouteLine Secure Pass</span>
                </div>
                <h2 class="rl-auth-title" id="rl-auth-modal-title">Welcome to RouteLine</h2>
                <p class="rl-auth-subtitle" id="rl-auth-modal-subtitle">Login or create an account to book your tickets and view bookings.</p>
            </div>

            <!-- Tab Switcher -->
            <div class="rl-auth-tabs">
                <button type="button" class="rl-auth-tab-btn active" id="rl-tab-login" data-tab="login">Login</button>
                <button type="button" class="rl-auth-tab-btn" id="rl-tab-signup" data-tab="signup">Sign Up</button>
            </div>

            <!-- Alert Notification Box -->
            <div id="rl-auth-alert" class="rl-auth-alert">
                <i data-lucide="alert-circle" id="rl-auth-alert-icon" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
                <span id="rl-auth-alert-text"></span>
            </div>

            <!-- Login Form -->
            <form id="rl-login-form" class="rl-auth-form active" novalidate>
                <div class="rl-form-group">
                    <label for="rl-login-email" class="rl-form-label">Email or Username</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="mail" class="rl-input-icon"></i>
                        <input type="email" id="rl-login-email" class="rl-auth-input" placeholder="e.g. demo@example.com" required autocomplete="username">
                    </div>
                </div>

                <div class="rl-form-group">
                    <label for="rl-login-password" class="rl-form-label">Password</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="lock" class="rl-input-icon"></i>
                        <input type="password" id="rl-login-password" class="rl-auth-input" placeholder="Enter your password" required autocomplete="current-password">
                        <button type="button" class="rl-toggle-pwd" data-target="rl-login-password" aria-label="Toggle Password Visibility">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <div class="rl-auth-meta-row">
                    <label class="rl-checkbox-label">
                        <input type="checkbox" id="rl-login-remember" checked>
                        <span>Remember me</span>
                    </label>
                    <a href="javascript:void(0)" class="rl-link-forgot" id="rl-btn-forgot-pwd">Forgot password?</a>
                </div>

                <button type="submit" class="rl-auth-submit-btn" id="rl-login-submit-btn">
                    <span>Sign In</span>
                    <i data-lucide="arrow-right" style="width: 17px; height: 17px;"></i>
                </button>

                <div class="rl-auth-divider">
                    <span>or</span>
                </div>

                <button type="button" class="rl-guest-btn" id="rl-guest-btn-login">
                    <i data-lucide="compass" style="width: 16px; height: 16px;"></i>
                    <span>Continue as Guest</span>
                </button>

                <div class="rl-auth-demo-hint">
                    💡 <strong>Demo Login:</strong> <code>demo@routeline.com</code> / <code>password123</code>
                </div>

                <div class="rl-auth-footer-text">
                    Don't have an account? <a href="javascript:void(0)" class="rl-auth-footer-link" id="rl-switch-to-signup">Sign up now</a>
                </div>
            </form>

            <!-- Sign Up Form -->
            <form id="rl-signup-form" class="rl-auth-form" novalidate>
                <div class="rl-form-group">
                    <label for="rl-signup-name" class="rl-form-label">Full Name</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="user" class="rl-input-icon"></i>
                        <input type="text" id="rl-signup-name" class="rl-auth-input" placeholder="e.g. Sauryaman Bisen" required autocomplete="name">
                    </div>
                </div>

                <div class="rl-form-group">
                    <label for="rl-signup-email" class="rl-form-label">Email Address</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="mail" class="rl-input-icon"></i>
                        <input type="email" id="rl-signup-email" class="rl-auth-input" placeholder="e.g. yourname@example.com" required autocomplete="email">
                    </div>
                </div>

                <div class="rl-form-group">
                    <label for="rl-signup-password" class="rl-form-label">Password</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="lock" class="rl-input-icon"></i>
                        <input type="password" id="rl-signup-password" class="rl-auth-input" placeholder="At least 6 characters" required autocomplete="new-password">
                        <button type="button" class="rl-toggle-pwd" data-target="rl-signup-password" aria-label="Toggle Password Visibility">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <div class="rl-form-group">
                    <label for="rl-signup-confirm-password" class="rl-form-label">Confirm Password</label>
                    <div class="rl-input-wrapper">
                        <i data-lucide="check-check" class="rl-input-icon"></i>
                        <input type="password" id="rl-signup-confirm-password" class="rl-auth-input" placeholder="Re-enter password" required autocomplete="new-password">
                        <button type="button" class="rl-toggle-pwd" data-target="rl-signup-confirm-password" aria-label="Toggle Password Visibility">
                            <i data-lucide="eye" style="width: 16px; height: 16px;"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="rl-auth-submit-btn" id="rl-signup-submit-btn">
                    <span>Create Account</span>
                    <i data-lucide="user-plus" style="width: 17px; height: 17px;"></i>
                </button>

                <div class="rl-auth-divider">
                    <span>or</span>
                </div>

                <button type="button" class="rl-guest-btn" id="rl-guest-btn-signup">
                    <i data-lucide="compass" style="width: 16px; height: 16px;"></i>
                    <span>Continue as Guest</span>
                </button>

                <div class="rl-auth-footer-text">
                    Already have an account? <a href="javascript:void(0)" class="rl-auth-footer-link" id="rl-switch-to-login">Sign in</a>
                </div>
            </form>
        </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  bindModalEvents();
}

/**
 * Bind Modal Events & Form Submissions
 */
function bindModalEvents() {
  const backdrop = document.getElementById('rl-auth-modal-backdrop');
  if (!backdrop) return;

  // Close Button & Backdrop Click
  const closeBtn = document.getElementById('rl-auth-close-btn');
  closeBtn?.addEventListener('click', () => {
    setAuthPromptDismissed();
    pendingBookingAction = null;
    closeAuthModal();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      setAuthPromptDismissed();
      pendingBookingAction = null;
      closeAuthModal();
    }
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.style.display === 'flex') {
      setAuthPromptDismissed();
      pendingBookingAction = null;
      closeAuthModal();
    }
  });

  // Tabs
  document.getElementById('rl-tab-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('rl-tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('rl-switch-to-signup')?.addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('rl-switch-to-login')?.addEventListener('click', () => switchAuthTab('login'));

  // Continue as Guest buttons
  document.getElementById('rl-guest-btn-login')?.addEventListener('click', continueAsGuest);
  document.getElementById('rl-guest-btn-signup')?.addEventListener('click', continueAsGuest);

  // Password Toggles
  bindPasswordToggles(backdrop);

  // Forgot Password Hint
  document.getElementById('rl-btn-forgot-pwd')?.addEventListener('click', () => {
    showAuthAlert('For demo purposes, use demo@routeline.com with password123.', 'info');
  });

  // Login Form Submit
  const loginForm = document.getElementById('rl-login-form');
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const identifier = document.getElementById('rl-login-email')?.value;
    const password = document.getElementById('rl-login-password')?.value;
    const remember = document.getElementById('rl-login-remember')?.checked;

    const res = loginUser({ identifier, password, remember });
    if (!res.success) {
      showAuthAlert(res.error, 'error');
      return;
    }

    setAuthPromptDismissed();
    closeAuthModal();
    updateHeaderAuthState();
    showAuthToast(`Welcome back, ${res.user.name || 'Traveler'}!`, 'success');
    resumePendingBookingAction();
  });

  // Sign Up Form Submit
  const signupForm = document.getElementById('rl-signup-form');
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rl-signup-name')?.value;
    const email = document.getElementById('rl-signup-email')?.value;
    const password = document.getElementById('rl-signup-password')?.value;
    const confirmPassword = document.getElementById('rl-signup-confirm-password')?.value;

    const res = signupUser({ name, email, password, confirmPassword });
    if (!res.success) {
      showAuthAlert(res.error, 'error');
      return;
    }

    setAuthPromptDismissed();
    closeAuthModal();
    updateHeaderAuthState();
    showAuthToast(`Account created successfully! Welcome, ${res.user.name}!`, 'success');
    resumePendingBookingAction();
  });
}

/**
 * Updates Header / Navbar across pages
 */
export function updateHeaderAuthState() {
  if (typeof document === 'undefined') return;
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  const existingWidget = headerActions.querySelector('.rl-user-profile-widget');
  const existingLoginLink = headerActions.querySelector('.login-link');

  const user = getCurrentUser();

  if (user && user.email) {
    // Authenticated state -> Show user avatar & dropdown
    if (existingLoginLink) existingLoginLink.style.display = 'none';

    if (!existingWidget) {
      const widget = document.createElement('div');
      widget.className = 'rl-user-profile-widget';
      widget.id = 'rl-user-profile-widget';

      const initial = (user.name || user.email).charAt(0).toUpperCase();
      const displayName = user.name ? user.name.split(' ')[0] : 'My Account';

      widget.innerHTML = `
        <div class="rl-user-chip" id="rl-user-chip" title="${user.name || user.email}">
          <div class="rl-user-avatar">${initial}</div>
          <span>${displayName}</span>
          <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
        </div>
        <div class="rl-user-dropdown" id="rl-user-dropdown">
          <div class="rl-dropdown-user-info">
            <p class="rl-dropdown-name">${user.name || 'RouteLine Traveler'}</p>
            <p class="rl-dropdown-email">${user.email}</p>
          </div>
          <a href="ticket.html" class="rl-dropdown-item">
            <i data-lucide="ticket" style="width:15px;height:15px;"></i>
            <span>My Bookings</span>
          </a>
          <button type="button" class="rl-dropdown-item logout" id="rl-btn-logout">
            <i data-lucide="log-out" style="width:15px;height:15px;"></i>
            <span>Logout</span>
          </button>
        </div>
      `;

      headerActions.appendChild(widget);

      const chip = widget.querySelector('#rl-user-chip');
      const dropdown = widget.querySelector('#rl-user-dropdown');
      chip?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown?.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!widget.contains(e.target)) {
          dropdown?.classList.remove('show');
        }
      });

      widget.querySelector('#rl-btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown?.classList.remove('show');
        logoutUser();
      });
    } else {
      existingWidget.style.display = 'inline-flex';
    }
  } else {
    // Guest state -> Show Login / Sign Up link
    if (existingWidget) existingWidget.style.display = 'none';

    if (existingLoginLink) {
      existingLoginLink.style.display = 'inline-flex';
      existingLoginLink.innerHTML = `<i data-lucide="user" class="icon-small"></i> Login / Sign up`;
      existingLoginLink.onclick = (e) => {
        e.preventDefault();
        openAuthModal(null, 'login');
      };
    }
  }

  if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}

/**
 * Main initialization function
 */
export function initAuth(options = {}) {
  const autoPrompt = options.autoPrompt !== undefined ? options.autoPrompt : true;

  ensureUsersStore();
  ensureAuthModalDOM();
  updateHeaderAuthState();

  // Attach global auth trigger
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.logoutUser = logoutUser;
  window.isAuthenticated = isAuthenticated;
  window.requireAuthentication = requireAuthentication;
  window.isAuthPromptDismissed = isAuthPromptDismissed;
  window.setAuthPromptDismissed = setAuthPromptDismissed;
  window.dismissAuthPrompt = dismissAuthPrompt;

  // Check if initial modal popup is requested (e.g. on homepage)
  if (autoPrompt) {
    if (!isAuthenticated() && !isAuthPromptDismissed()) {
      // Small timeout for smooth initial load
      setTimeout(() => {
        if (!isAuthenticated() && !isAuthPromptDismissed()) {
          openAuthModal(null, 'login');
        }
      }, 600);
    }
  }
}
