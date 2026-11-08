# RouteLine Contribution & Code Quality Guidelines

Thank you for contributing to RouteLine. To maintain high code quality, consistency, and multi-environment stability, all changes must adhere to the following conventions.

---

## 1. Core Principles (Karpathy Guidelines)

1. **Think Before Coding**: Understand existing code and surface tradeoffs. Do not silently guess or change working functionality.
2. **Simplicity First**: Prefer the minimal, cleanest solution that solves the issue. Avoid overengineering and speculative abstractions.
3. **Surgical Changes**: Touch only what is strictly necessary. Never perform drive-by refactoring or reformats of unrelated files.
4. **Goal-Driven Execution**: Define verifiable criteria, run linting (`npm run lint`), and build checks (`npm run build`) before committing.

---

## 2. Asset & Script Path Resolution Conventions

RouteLine is deployed and previewed across diverse hosting environments:
- **Direct Local File (`file:///`)**: Opening `.html` files directly in a browser.
- **Local Static Servers (VS Code Live Server / SimpleHTTPServer)**: Running from project root.
- **Vite Development & Production (`base: '/RouteLine-Travelling-Project/'`)**: Bundled Rollup output.
- **GitHub Pages**: Sub-path deployment at `https://<user>.github.io/RouteLine-Travelling-Project/`.

### Mandatory Path Rules:
- **Never use leading slashes** (`/vendor/...`, `/src/...`) for HTML scripts or CSS links. Leading slashes break `file://` protocol and resolve to the root domain on GitHub Pages.
- **Root Pages (`index.html`)**: Use relative paths (`./vendor/...`, `./src/...`).
- **Subpages (`pages/*/*.html`)**: Use relative directory paths (`../../vendor/...`, `../../src/...`).
- **Vendor Scripts**: Always pair local vendor scripts with an unpkg/Cloudflare CDN fallback:
  ```html
  <script src="../../vendor/lucide.min.js"></script>
  <script>
    if (typeof lucide === 'undefined') {
      document.write('<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"><\\/script>');
    }
  </script>
  ```

---

## 3. Verification & Quality Commands

```bash
# Lint code with Oxlint
npm run lint

# Compile production bundle
npm run build

# Run asset integrity check
node scripts/verify-assets.js
```
