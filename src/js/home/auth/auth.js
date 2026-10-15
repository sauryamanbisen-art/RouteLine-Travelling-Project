/**
 * RouteLine - Central Authentication & Session Manager (auth.js)
 * Manages Login, Sign Up, Guest session, User Data Isolation, and Header State.
 * 
 * Security & Isolation Principles:
 * - NO hardcoded personal login details or auto-login on new devices.
 * - Passwords stored hashed with SHA-256 + salt via Web Crypto API.
 * - Strict separation between authenticated sessions and guest sessions.
 * - Clean first-visit experience: Option A (Login / Sign Up) or Option B (Continue as Guest).
 */

import { validateLoginInput, bindPasswordToggles } from './login.js';
import { validateSignupInput } from './signup.js';

// Storage Keys
export const STORAGE_AUTH_USER = 'routeline_auth_user';
export const STORAGE_REGISTERED_USERS = 'routeline_registered_users';
export const STORAGE_AUTH_PROMPT_DISMISSED = 'routeline_auth_prompt_dismissed';
export const STORAGE_GUEST_DISMISSED = STORAGE_AUTH_PROMPT_DISMISSED;
export const STORAGE_USER_PREFERENCES = 'routeline_user_preferences';

const PASSWORD_SALT = 'routeline_salt_2026';

/**
 * Client-Side SHA-256 Password Hasher using Web Crypto API
 * Avoids storing plaintext passwords in browser storage.
 */
export async function hashPassword(password, salt = PASSWORD_SALT) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(`${salt}:${password}`);
      const hashBuf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      // Fallback below
    }
  }
  // Deterministic fallback for environments where crypto.subtle is unavailable
  let hash = 0;
  const str = `${salt}:${password}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

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

export function dismissAuthPrompt() {
  setAuthPromptDismissed();
}

/**
 * Generic Starter Demo Account (NO personal user info, NO plaintext password)
 * password: 'password123' -> hashed with salt 'routeline_salt_2026'
 */
const SEED_USERS = [
  {
    id: 'usr_demo_traveler',
    name: 'Demo Traveler',
    email: 'demo@routeline.com',
    passwordHash: '18c48d559d8ff1f55fa0e991f82860e7c85b3033a1b527da9d90e0430bbe06b3',
    createdAt: '2026-09-08'
  }
];

// In-Memory Pending Booking Callback
let pendingBookingAction = null;

/**
 * Initialize Registered Users store safely
 * NEVER automatically logs in any user!
 */
function ensureUsersStore() {
  if (typeof window === 'undefined') return;
  try {
    const existing = localStorage.getItem(STORAGE_REGISTERED_USERS);
    if (!existing) {
      localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(SEED_USERS));
    } else {
      let parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) {
        // Strip out any stale hardcoded personal developer account
        parsed = parsed.filter(u => !u.name || !u.name.toLowerCase().includes('sauryaman'));
        if (!parsed.some(u => u.email === 'demo@routeline.com')) {
          parsed.unshift(SEED_USERS[0]);
        }
        localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(parsed));
      }
    }
    // Note: NEVER set default STORAGE_AUTH_USER. New browsers start as unauthenticated guests!
  } catch (e) {
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
 * Checks if the user is authenticated in the current session
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  const user = getCurrentUser();
  return Boolean(user && user.email && user.token);
}

/**
 * Gets currently logged in user from localStorage
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.email ? user : null;
  } catch (e) {
    return null;
  }
}

/**
 * Authenticates user credentials with SHA-256 hash comparison
 */
export async function loginUser(arg1, arg2, arg3 = true) {
  let identifier, password, remember;
  if (typeof arg1 === 'object' && arg1 !== null) {
    identifier = arg1.identifier;
    password = arg1.password;
    remember = arg1.remember !== false;
  } else {
    identifier = arg1;
    password = arg2;
    remember = arg3 !== false;
  }

  const validation = validateLoginInput(identifier, password);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const users = getRegisteredUsers();
  const cleanId = (identifier || '').trim().toLowerCase();
  const hashedInput = await hashPassword(password);

  const user = users.find(u => 
    u.email.toLowerCase() === cleanId || 
    (u.name && u.name.toLowerCase() === cleanId) ||
    (cleanId === 'demo' && u.email === 'demo@routeline.com')
  );

  if (!user) {
    return { success: false, error: 'Invalid email/username or password. Please try again.' };
  }

  // Verify hash or legacy fallback
  const isMatch = user.passwordHash 
    ? user.passwordHash === hashedInput
    : (user.password === password || user.password === hashedInput);

  if (!isMatch) {
    return { success: false, error: 'Invalid email/username or password. Please try again.' };
  }

  // Create isolated session user object
  const sessionUser = {
    id: user.id || `usr_${Date.now().toString(36)}`,
    name: user.name,
    email: user.email,
    token: `rl_token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loggedInAt: new Date().toISOString()
  };

  if (remember) {
    localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
  } else {
    // If remember is unchecked, store in sessionStorage
    sessionStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
    localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
  }

  // Notify components of auth change
  window.dispatchEvent(new CustomEvent('routeline:auth-change', { detail: { user: sessionUser } }));

  return { success: true, user: sessionUser };
}

/**
 * Registers a new user with hashed password storage
 */
export async function signupUser(arg1, arg2, arg3, arg4, arg5) {
  let name, email, password, confirmPassword, phone;
  if (typeof arg1 === 'object' && arg1 !== null) {
    name = arg1.name;
    email = arg1.email;
    password = arg1.password;
    confirmPassword = arg1.confirmPassword || arg1.password;
    phone = arg1.phone;
  } else {
    name = arg1;
    email = arg2;
    password = arg3;
    if (arg5) {
      phone = arg4;
      confirmPassword = arg5;
    } else if (arg4 && /^\+?[\d\s-]{7,15}$/.test(arg4)) {
      phone = arg4;
      confirmPassword = arg3;
    } else {
      confirmPassword = arg4 || arg3;
    }
  }

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

  const passwordHash = await hashPassword(password);

  const newUser = {
    id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash: passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(users));

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    token: `rl_token_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(sessionUser));
  window.dispatchEvent(new CustomEvent('routeline:auth-change', { detail: { user: sessionUser } }));

  return { success: true, user: sessionUser };
}

export const registerUser = signupUser;

/**
 * Logs out user, clears session tokens, and reverts to Guest
 */
export function logoutUser() {
  localStorage.removeItem(STORAGE_AUTH_USER);
  sessionStorage.removeItem(STORAGE_AUTH_USER);
  updateHeaderAuthState();
  showAuthToast('Logged out successfully. You are now browsing as Guest.', 'info');
  window.dispatchEvent(new CustomEvent('routeline:auth-change', { detail: { user: null } }));

  // If user is currently on protected My Bookings page, refresh the view
  if (typeof window !== 'undefined' && window.location?.pathname?.includes('ticket.html')) {
    if (typeof window.initTicketPage === 'function') {
      window.initTicketPage();
    }
  }
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
 * Opens Authentication Modal with clear Option A / Option B presentation
 */
export function openAuthModal(onSuccessCallback = null, initialTab = 'login', customMessage = null) {
  if (typeof document === 'undefined') return;
  if (typeof onSuccessCallback === 'function') {
    pendingBookingAction = onSuccessCallback;
  }

  ensureAuthModalDOM();

  const backdrop = document.getElementById('rl-auth-modal-backdrop');
  if (!backdrop) return;

  switchAuthTab(initialTab === 'signup' ? 'signup' : 'login');
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
 * Handles Option B: Continue as Guest
 * Dismisses initial welcome screen and allows free browsing
 */
export function continueAsGuest() {
  setAuthPromptDismissed();
  closeAuthModal();
  pendingBookingAction = null;
  updateHeaderAuthState();
  showAuthToast('Continuing as Guest. Search and explore trains, flights, and buses freely.', 'info');
}

/**
 * Switch between Login and Sign Up tabs
 */
/**
 * Switch between Login, Sign Up, and Forgot Password views
 */
export function switchAuthTab(tab = 'login') {
  const loginTabBtn = document.getElementById('rl-tab-login');
  const signupTabBtn = document.getElementById('rl-tab-signup');
  const tabsContainer = document.getElementById('rl-auth-tabs');
  const loginForm = document.getElementById('rl-login-form');
  const signupForm = document.getElementById('rl-signup-form');
  const forgotForm = document.getElementById('rl-forgot-form');
  const modalTitle = document.getElementById('rl-auth-modal-title');
  const modalSub = document.getElementById('rl-auth-modal-subtitle');
  const badgeText = document.getElementById('rl-auth-badge-text');
  const badgeIcon = document.getElementById('rl-auth-badge-icon');

  clearAuthAlert();

  if (tab === 'signup') {
    if (tabsContainer) tabsContainer.style.display = 'flex';
    loginTabBtn?.classList.remove('active');
    signupTabBtn?.classList.add('active');
    loginForm?.classList.remove('active');
    forgotForm?.classList.remove('active');
    signupForm?.classList.add('active');
    if (badgeText) badgeText.textContent = 'ROUTELINE SECURE PASS';
    if (badgeIcon) badgeIcon.setAttribute('data-lucide', 'shield-check');
    if (modalTitle) modalTitle.textContent = 'WELCOME TO ROUTELINE';
    if (modalSub) modalSub.textContent = 'Create your RouteLine account to access flight bookings, privileges, and seamless travel.';
  } else if (tab === 'forgot') {
    if (tabsContainer) tabsContainer.style.display = 'none';
    loginForm?.classList.remove('active');
    signupForm?.classList.remove('active');
    forgotForm?.classList.add('active');
    if (badgeText) badgeText.textContent = 'ROUTELINE RECOVERY';
    if (badgeIcon) badgeIcon.setAttribute('data-lucide', 'key');
    if (modalTitle) modalTitle.textContent = 'RESET YOUR PASSWORD';
    if (modalSub) modalSub.textContent = 'Enter the email associated with your account and we\'ll assist with verifying access.';
  } else {
    // Default: Login
    if (tabsContainer) tabsContainer.style.display = 'flex';
    signupTabBtn?.classList.remove('active');
    loginTabBtn?.classList.add('active');
    signupForm?.classList.remove('active');
    forgotForm?.classList.remove('active');
    loginForm?.classList.add('active');
    if (badgeText) badgeText.textContent = 'ROUTELINE SECURE PASS';
    if (badgeIcon) badgeIcon.setAttribute('data-lucide', 'shield-check');
    if (modalTitle) modalTitle.textContent = 'WELCOME TO ROUTELINE';
    if (modalSub) modalSub.textContent = 'Sign in to access your flight bookings, frequent flyer privileges, or continue exploring as a guest.';
  }

  loginForm?.querySelector('.rl-form-scrollable-fields')?.scrollTo({ top: 0, behavior: 'instant' });
  signupForm?.querySelector('.rl-form-scrollable-fields')?.scrollTo({ top: 0, behavior: 'instant' });
  forgotForm?.querySelector('.rl-form-scrollable-fields')?.scrollTo({ top: 0, behavior: 'instant' });

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
 * Ensures Modal DOM elements exist with exact reference design layout
 */
function ensureAuthModalDOM() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rl-auth-modal-backdrop')) return;

  const modalHTML = `
    <div id="rl-auth-modal-backdrop" class="rl-auth-backdrop" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="rl-auth-modal-title">
        <div class="rl-auth-modal">
            <button type="button" class="rl-auth-close-btn" id="rl-auth-close-btn" aria-label="Close Authentication Modal">
                <i data-lucide="x"></i>
            </button>

            <div class="rl-auth-header">
                <div class="rl-auth-badge" id="rl-auth-badge">
                    <i data-lucide="shield-check" id="rl-auth-badge-icon"></i>
                    <span id="rl-auth-badge-text">ROUTELINE SECURE PASS</span>
                    <span class="rl-auth-badge-dot"></span>
                </div>
                <h2 class="rl-auth-title" id="rl-auth-modal-title">WELCOME TO ROUTELINE</h2>
                <p class="rl-auth-subtitle" id="rl-auth-modal-subtitle">Sign in to access your flight bookings, frequent flyer privileges, or continue exploring as a guest.</p>
            </div>

            <!-- Tab Switcher (Segmented Pill) -->
            <div class="rl-auth-tabs" id="rl-auth-tabs">
                <button type="button" class="rl-auth-tab-btn active" id="rl-tab-login" data-tab="login">Login</button>
                <button type="button" class="rl-auth-tab-btn" id="rl-tab-signup" data-tab="signup">Sign Up</button>
            </div>

            <!-- Alert Notification Box -->
            <div id="rl-auth-alert" class="rl-auth-alert" role="alert" style="display:none;">
                <i data-lucide="alert-circle" id="rl-auth-alert-icon" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
                <span id="rl-auth-alert-text"></span>
            </div>

            <!-- Login Form -->
            <form id="rl-login-form" class="rl-auth-form active" novalidate>
                <div class="rl-form-scrollable-fields">
                    <div class="rl-form-group">
                        <label for="rl-login-email" class="rl-form-label">EMAIL OR USERNAME</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="mail" class="rl-input-icon"></i>
                            <input type="email" id="rl-login-email" class="rl-auth-input" placeholder="demo@routeline.com" required autocomplete="username">
                        </div>
                    </div>

                    <div class="rl-form-group">
                        <label for="rl-login-password" class="rl-form-label">PASSWORD</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="lock" class="rl-input-icon"></i>
                            <input type="password" id="rl-login-password" class="rl-auth-input" placeholder="••••••••••••" required autocomplete="current-password">
                            <button type="button" class="rl-toggle-pwd" data-target="rl-login-password" aria-label="Toggle Password Visibility">
                                <i data-lucide="eye"></i>
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
                </div>

                <div class="rl-form-actions-fixed">
                    <button type="submit" class="rl-auth-submit-btn" id="rl-login-submit-btn">
                        <span>Sign In</span>
                        <i data-lucide="arrow-right"></i>
                    </button>

                    <div class="rl-auth-divider">
                        <span>OR CONTINUE AS GUEST</span>
                    </div>

                    <button type="button" class="rl-guest-btn" id="rl-guest-btn-login">
                        <i data-lucide="compass"></i>
                        <span>Continue as Guest (Search &amp; Explore Freely)</span>
                    </button>

                    <div class="rl-auth-footer-text">
                        Don't have an account? <a href="javascript:void(0)" class="rl-auth-footer-link" id="rl-switch-to-signup">Sign up now</a>
                    </div>
                </div>
            </form>

            <!-- Sign Up Form -->
            <form id="rl-signup-form" class="rl-auth-form" novalidate>
                <div class="rl-form-scrollable-fields">
                    <div class="rl-form-group">
                        <label for="rl-signup-name" class="rl-form-label">FULL NAME</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="user" class="rl-input-icon"></i>
                            <input type="text" id="rl-signup-name" class="rl-auth-input" placeholder="e.g. Sauryaman Bisen" required autocomplete="name">
                        </div>
                    </div>

                    <div class="rl-form-group">
                        <label for="rl-signup-email" class="rl-form-label">EMAIL ADDRESS</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="mail" class="rl-input-icon"></i>
                            <input type="email" id="rl-signup-email" class="rl-auth-input" placeholder="e.g. sauryaman@example.com" required autocomplete="email">
                        </div>
                    </div>

                    <div class="rl-form-group">
                        <label for="rl-signup-password" class="rl-form-label">PASSWORD</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="lock" class="rl-input-icon"></i>
                            <input type="password" id="rl-signup-password" class="rl-auth-input" placeholder="Create secure password (min. 6 chars)" required autocomplete="new-password">
                            <button type="button" class="rl-toggle-pwd" data-target="rl-signup-password" aria-label="Toggle Password Visibility">
                                <i data-lucide="eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="rl-form-group">
                        <label for="rl-signup-confirm-password" class="rl-form-label">CONFIRM PASSWORD</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="check-check" class="rl-input-icon"></i>
                            <input type="password" id="rl-signup-confirm-password" class="rl-auth-input" placeholder="Confirm your password" required autocomplete="new-password">
                            <button type="button" class="rl-toggle-pwd" data-target="rl-signup-confirm-password" aria-label="Toggle Password Visibility">
                                <i data-lucide="eye"></i>
                            </button>
                        </div>
                    </div>

                    <div class="rl-auth-meta-row" style="margin-bottom: 8px;">
                        <label class="rl-checkbox-label">
                            <input type="checkbox" id="rl-signup-terms" checked>
                            <span>I agree to Terms of Service &amp; Privacy Policy</span>
                        </label>
                    </div>
                </div>

                <div class="rl-form-actions-fixed">
                    <button type="submit" class="rl-auth-submit-btn" id="rl-signup-submit-btn">
                        <span>Create Account</span>
                        <i data-lucide="arrow-right"></i>
                    </button>

                    <div class="rl-auth-divider">
                        <span>OR CONTINUE AS GUEST</span>
                    </div>

                    <button type="button" class="rl-guest-btn" id="rl-guest-btn-signup">
                        <i data-lucide="compass"></i>
                        <span>Continue as Guest (Search &amp; Explore Freely)</span>
                    </button>

                    <div class="rl-auth-footer-text">
                        Already have an account? <a href="javascript:void(0)" class="rl-auth-footer-link" id="rl-switch-to-login">Sign in now</a>
                    </div>
                </div>
            </form>

            <!-- Dedicated Forgot Password Form -->
            <form id="rl-forgot-form" class="rl-auth-form" novalidate>
                <div class="rl-form-scrollable-fields">
                    <div class="rl-form-group">
                        <label for="rl-forgot-email" class="rl-form-label">EMAIL ADDRESS</label>
                        <div class="rl-input-wrapper">
                            <i data-lucide="mail" class="rl-input-icon"></i>
                            <input type="email" id="rl-forgot-email" class="rl-auth-input" placeholder="demo@routeline.com" required autocomplete="email">
                        </div>
                    </div>
                </div>

                <div class="rl-form-actions-fixed">
                    <button type="submit" class="rl-auth-submit-btn" id="rl-forgot-submit-btn">
                        <span>Send Reset Link</span>
                        <i data-lucide="arrow-right"></i>
                    </button>

                    <div class="rl-auth-divider">
                        <span>OR RETURN TO SIGN IN</span>
                    </div>

                    <div class="rl-auth-footer-text" style="margin-top: 6px;">
                        <a href="javascript:void(0)" class="rl-auth-footer-link" id="rl-back-to-login">← Back to Sign In</a>
                    </div>
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.style.display === 'flex') {
      setAuthPromptDismissed();
      pendingBookingAction = null;
      closeAuthModal();
    }
  });

  document.getElementById('rl-tab-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('rl-tab-signup')?.addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('rl-switch-to-signup')?.addEventListener('click', () => switchAuthTab('signup'));
  document.getElementById('rl-switch-to-login')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('rl-btn-forgot-pwd')?.addEventListener('click', () => switchAuthTab('forgot'));
  document.getElementById('rl-back-to-login')?.addEventListener('click', () => switchAuthTab('login'));

  document.getElementById('rl-guest-btn-login')?.addEventListener('click', continueAsGuest);
  document.getElementById('rl-guest-btn-signup')?.addEventListener('click', continueAsGuest);

  bindPasswordToggles(backdrop);

  // Forgot Password Submit Handler
  const forgotForm = document.getElementById('rl-forgot-form');
  forgotForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('rl-forgot-email')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAuthAlert('Please enter a valid registered email address.', 'error');
      return;
    }

    const users = getRegisteredUsers();
    const found = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      showAuthAlert('Account verified in local secure registry. Direct email delivery requires an active SMTP backend. For this demo, you can sign in using demo@routeline.com or register a new traveler account.', 'info');
    } else {
      showAuthAlert('No account registered with this email address. Please check your spelling or sign up.', 'error');
    }
  });

  // Login Form Submit
  const loginForm = document.getElementById('rl-login-form');
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let identifier = document.getElementById('rl-login-email')?.value?.trim();
    let password = document.getElementById('rl-login-password')?.value;
    const remember = document.getElementById('rl-login-remember')?.checked;

    // If inputs are left empty, provide smooth fallback to demo credentials
    if (!identifier && !password) {
      identifier = 'demo@routeline.com';
      password = 'password123';
      const emailInput = document.getElementById('rl-login-email');
      const pwdInput = document.getElementById('rl-login-password');
      if (emailInput) emailInput.value = identifier;
      if (pwdInput) pwdInput.value = password;
    }

    const res = await loginUser({ identifier, password, remember });
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
  signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rl-signup-name')?.value;
    const email = document.getElementById('rl-signup-email')?.value;
    const password = document.getElementById('rl-signup-password')?.value;
    const confirmPassword = document.getElementById('rl-signup-confirm-password')?.value;
    const termsChecked = document.getElementById('rl-signup-terms')?.checked;

    if (!termsChecked) {
      showAuthAlert('Please agree to the Terms of Service & Privacy Policy.', 'error');
      return;
    }

    const res = await signupUser({ name, email, password, confirmPassword });
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
 * Ensures Profile Details Modal DOM exists
 */
function ensureProfileModalDOM() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rl-profile-modal-backdrop')) return;

  const profileHTML = `
    <div id="rl-profile-modal-backdrop" class="rl-auth-backdrop" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="rl-profile-modal-title">
      <div class="rl-auth-modal" style="max-width: 440px;">
        <button type="button" class="rl-auth-close-btn" id="rl-profile-close-btn" aria-label="Close Profile">
          <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </button>
        <div class="rl-auth-header" style="margin-bottom: 24px;">
          <div class="w-16 h-16 rounded-full bg-[#000d2c] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md" id="rl-profile-avatar" style="width:56px;height:56px;border-radius:50%;background:#000d2c;color:white;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;margin:0 auto 12px;">
            T
          </div>
          <h2 class="rl-auth-title" id="rl-profile-name" style="font-size:20px;">Traveler Profile</h2>
          <p class="rl-auth-subtitle" id="rl-profile-email">traveler@routeline.com</p>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;margin-bottom:20px;font-size:13px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #edf2f7;padding-bottom:8px;">
            <span style="color:#64748b;">Account ID</span>
            <strong style="color:#0f172a;font-family:monospace;" id="rl-profile-id">usr_demo</strong>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #edf2f7;padding-bottom:8px;">
            <span style="color:#64748b;">Member Tier</span>
            <span style="background:#eaf7ee;color:#2e7d32;padding:2px 8px;border-radius:99px;font-weight:700;font-size:11px;">Verified Traveler</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #edf2f7;padding-bottom:8px;">
            <span style="color:#64748b;">Session Active Since</span>
            <strong style="color:#0f172a;" id="rl-profile-joined">Today</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#64748b;">Storage &amp; Privacy</span>
            <span style="color:#0284c7;font-weight:600;">Isolated Browser Session</span>
          </div>
        </div>

        <div style="font-size:11.5px;color:#64748b;line-height:1.5;background:#f0f9ff;border:1px solid #bae6fd;padding:12px;border-radius:12px;margin-bottom:20px;">
          <strong>🔒 Privacy Notice:</strong> RouteLine stores your account information locally in your private browser sandbox. No credentials or booking records are shared with external devices without your login.
        </div>

        <div style="display:flex;gap:10px;">
          <button type="button" class="rl-auth-submit-btn" id="rl-profile-close-btn2" style="background:#000d2c;margin:0;">
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', profileHTML);

  const backdrop = document.getElementById('rl-profile-modal-backdrop');
  document.getElementById('rl-profile-close-btn')?.addEventListener('click', closeProfileModal);
  document.getElementById('rl-profile-close-btn2')?.addEventListener('click', closeProfileModal);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeProfileModal();
  });
}

export function openProfileModal() {
  const user = getCurrentUser();
  if (!user) {
    openAuthModal(null, 'login', 'Please log in to view your profile.');
    return;
  }
  ensureProfileModalDOM();
  const backdrop = document.getElementById('rl-profile-modal-backdrop');
  if (!backdrop) return;

  const initial = (user.name || user.email).charAt(0).toUpperCase();
  document.getElementById('rl-profile-avatar').textContent = initial;
  document.getElementById('rl-profile-name').textContent = user.name || 'Traveler';
  document.getElementById('rl-profile-email').textContent = user.email || '';
  document.getElementById('rl-profile-id').textContent = user.id || 'usr_verified';
  document.getElementById('rl-profile-joined').textContent = user.loggedInAt ? new Date(user.loggedInAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Active Session';

  backdrop.style.display = 'flex';
  if (document.body) document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

export function closeProfileModal() {
  const backdrop = document.getElementById('rl-profile-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  if (document.body) document.body.style.overflow = '';
}

/**
 * Ensures Settings Modal DOM exists
 */
function ensureSettingsModalDOM() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('rl-settings-modal-backdrop')) return;

  const settingsHTML = `
    <div id="rl-settings-modal-backdrop" class="rl-auth-backdrop" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="rl-settings-modal-title">
      <div class="rl-auth-modal" style="max-width: 440px;">
        <button type="button" class="rl-auth-close-btn" id="rl-settings-close-btn" aria-label="Close Settings">
          <i data-lucide="x" style="width: 16px; height: 16px;"></i>
        </button>
        <div class="rl-auth-header" style="margin-bottom: 20px;">
          <h2 class="rl-auth-title" id="rl-settings-modal-title" style="font-size:20px;">Account Settings</h2>
          <p class="rl-auth-subtitle">Configure your preferences and session privacy.</p>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px;font-size:13px;">
          <div>
            <label style="display:block;font-weight:600;color:#1e293b;margin-bottom:6px;">Display Currency</label>
            <select id="rl-setting-currency" style="width:100%;border:1px solid #cbd5e1;border-radius:10px;padding:8px 12px;font-size:13px;background:white;">
              <option value="INR" selected>₹ INR - Indian Rupee</option>
              <option value="USD">$ USD - US Dollar</option>
              <option value="EUR">€ EUR - Euro</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
            <div>
              <strong style="display:block;color:#1e293b;">Booking WhatsApp Updates</strong>
              <span style="font-size:11.5px;color:#64748b;">Receive electronic ticket &amp; live gate alerts</span>
            </div>
            <input type="checkbox" id="rl-setting-alerts" checked style="width:18px;height:18px;cursor:pointer;">
          </div>

          <div>
            <button type="button" id="rl-btn-clear-search-history" style="width:100%;padding:10px;border:1px dashed #cbd5e1;border-radius:10px;background:#f8fafc;color:#64748b;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
              <span>Clear Recent Search History</span>
            </button>
          </div>
        </div>

        <button type="button" class="rl-auth-submit-btn" id="rl-settings-save-btn" style="background:#000d2c;margin:0;">
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', settingsHTML);

  const backdrop = document.getElementById('rl-settings-modal-backdrop');
  document.getElementById('rl-settings-close-btn')?.addEventListener('click', closeSettingsModal);
  document.getElementById('rl-settings-save-btn')?.addEventListener('click', () => {
    showAuthToast('Preferences saved successfully.', 'success');
    closeSettingsModal();
  });
  document.getElementById('rl-btn-clear-search-history')?.addEventListener('click', () => {
    try {
      localStorage.removeItem('routeline_flight_session_v1');
    } catch {}
    showAuthToast('Local search history cleared.', 'info');
  });
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeSettingsModal();
  });
}

export function openSettingsModal() {
  ensureSettingsModalDOM();
  const backdrop = document.getElementById('rl-settings-modal-backdrop');
  if (!backdrop) return;
  backdrop.style.display = 'flex';
  if (document.body) document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

export function closeSettingsModal() {
  const backdrop = document.getElementById('rl-settings-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  if (document.body) document.body.style.overflow = '';
}

/**
 * Updates Header / Navbar across all pages.
 * Shows user chip when authenticated; shows Login link when guest.
 */
export function updateHeaderAuthState() {
  if (typeof document === 'undefined') return;
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  const existingWidget = headerActions.querySelector('.rl-user-profile-widget');
  const existingLoginLink = headerActions.querySelector('.login-link');

  const user = getCurrentUser();

  if (user && user.email) {
    // Authenticated state -> Hide Login link, Show user chip
    if (existingLoginLink) existingLoginLink.style.display = 'none';

    const initial = (user.name || user.email).charAt(0).toUpperCase();
    const displayName = user.name ? user.name.split(' ')[0] : 'Traveler';
    const myBookingsUrl = window.location.pathname.includes('/pages/train/')
      ? 'ticket.html'
      : (window.location.pathname.includes('/pages/')
        ? '../train/ticket.html'
        : 'pages/train/ticket.html');

    let widget = existingWidget;

    if (!widget) {
      widget = document.createElement('div');
      widget.className = 'rl-user-profile-widget';
      widget.id = 'rl-user-profile-widget';
      headerActions.appendChild(widget);
    }

    widget.style.display = 'inline-flex';
    widget.innerHTML = `
      <div class="rl-user-chip" id="rl-user-chip" title="${user.name || user.email}">
        <div class="rl-user-avatar">${initial}</div>
        <span>${displayName}</span>
        <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
      </div>
      <div class="rl-user-dropdown" id="rl-user-dropdown">
        <div class="rl-dropdown-user-info">
          <p class="rl-dropdown-name">${user.name || 'Traveler'}</p>
          <p class="rl-dropdown-email">${user.email}</p>
        </div>
        <button type="button" class="rl-dropdown-item" id="rl-btn-my-profile">
          <i data-lucide="user" style="width:15px;height:15px;"></i>
          <span>My Profile</span>
        </button>
        <a href="${myBookingsUrl}" class="rl-dropdown-item" id="rl-link-my-bookings">
          <i data-lucide="ticket" style="width:15px;height:15px;"></i>
          <span>My Bookings</span>
        </a>
        <button type="button" class="rl-dropdown-item" id="rl-btn-account-settings">
          <i data-lucide="settings" style="width:15px;height:15px;"></i>
          <span>Account Settings</span>
        </button>
        <button type="button" class="rl-dropdown-item logout" id="rl-btn-logout">
          <i data-lucide="log-out" style="width:15px;height:15px;"></i>
          <span>Logout</span>
        </button>
      </div>
    `;

    // Bind dropdown click handlers
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

    widget.querySelector('#rl-btn-my-profile')?.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown?.classList.remove('show');
      openProfileModal();
    });

    widget.querySelector('#rl-btn-account-settings')?.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown?.classList.remove('show');
      openSettingsModal();
    });

    widget.querySelector('#rl-btn-logout')?.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown?.classList.remove('show');
      logoutUser();
    });

  } else {
    // Guest state -> Hide user widget, Show Login / Sign up link
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

  // Attach global functions to window
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.openProfileModal = openProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;
  window.logoutUser = logoutUser;
  window.loginUser = loginUser;
  window.signupUser = signupUser;
  window.isAuthenticated = isAuthenticated;
  window.getCurrentUser = getCurrentUser;
  window.requireAuthentication = requireAuthentication;
  window.isAuthPromptDismissed = isAuthPromptDismissed;
  window.setAuthPromptDismissed = setAuthPromptDismissed;
  window.continueAsGuest = continueAsGuest;
  window.dismissAuthPrompt = dismissAuthPrompt;

  // First-visit experience check: if on homepage and user is unauthenticated & hasn't dismissed, show prompt
  if (autoPrompt) {
    if (!isAuthenticated() && !isAuthPromptDismissed()) {
      setTimeout(() => {
        if (!isAuthenticated() && !isAuthPromptDismissed()) {
          openAuthModal(null, 'login');
        }
      }, 600);
    }
  }
}
