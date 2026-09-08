/**
 * RouteLine - Login Form Logic & Validation (login.js)
 */

export function validateLoginInput(identifier, password) {
  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    return { valid: false, error: 'Please enter your email or username.' };
  }

  // If email format, validate structure
  if (cleanId.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanId)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }
  }

  if (!cleanPass) {
    return { valid: false, error: 'Please enter your password.' };
  }

  if (cleanPass.length < 4) {
    return { valid: false, error: 'Password must be at least 4 characters.' };
  }

  return { valid: true, error: null };
}

export function bindPasswordToggles(container) {
  if (!container) return;
  const toggles = container.querySelectorAll('.rl-toggle-pwd');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = container.querySelector(`#${targetId}`);
      if (!input) return;

      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';

      const icon = btn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (typeof window !== 'undefined' && window.lucide && window.lucide.createIcons) {
          window.lucide.createIcons();
        }
      }
    });
  });
}
