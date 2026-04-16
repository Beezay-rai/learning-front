/**
 * Builds a self-contained HTML document that:
 * 1. Uses importmap to resolve React/ReactDOM from esm.sh
 * 2. Uses @babel/standalone (CDN) to transpile JSX
 * 3. Inlines all user files as blob: URLs, resolving relative imports
 */
export function buildPreviewDoc(files: Record<string, string>): string {
  // Resolve all user files, producing a map of path -> blobified module URL
  // We'll inline everything into a single script by replacing imports

  const resolveImports = (code: string, currentDir: string): string => {
    // Replace relative imports with inlined module content
    return code.replace(
      /from\s+['"](\.[^'"]+)['"]/g,
      (match, importPath) => {
        let resolved = resolveRelative(currentDir, importPath);
        // Try adding extensions if not present
        const candidates = [resolved, resolved + ".jsx", resolved + ".js", resolved + ".tsx", resolved + ".ts"];
        for (const c of candidates) {
          if (files[c]) return `from '${c}'`;
        }
        return match;
      }
    );
  };

  // Build a big inline script that defines all modules using Blob URLs via import
  // We'll use a simpler approach: collect all files, then use an eval-based runner

  // Build a module registry that Babel can use
  const moduleEntries: string[] = [];

  for (const [path, content] of Object.entries(files)) {
    if (!path.endsWith(".jsx") && !path.endsWith(".js") && !path.endsWith(".tsx") && !path.endsWith(".ts") && !path.endsWith(".css")) continue;

    if (path.endsWith(".css")) {
      // CSS files: inject as <style>
      moduleEntries.push(`__modules["${path}"] = { __css: ${JSON.stringify(content)} };`);
    } else {
      const resolved = resolveImports(content, dirname(path));
      moduleEntries.push(
        `__modules["${path}"] = async function(require, module, exports) {\n${resolved}\n};`
      );
    }
  }

  // Find the main entry
  const mainEntry = files["src/main.jsx"] ? "src/main.jsx" :
    files["src/main.tsx"] ? "src/main.tsx" :
      files["src/index.jsx"] ? "src/index.jsx" :
        "src/main.jsx";

  const htmlContent = files["index.html"] || `<!DOCTYPE html><html><body><div id="root"></div></body></html>`;
  // Strip the DOCTYPE/html/body shell to just get the body content for injection
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : '<div id="root"></div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Vite Preview</title>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.2.0",
    "react-dom": "https://esm.sh/react-dom@18.2.0",
    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
    "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime"
  }
}
</script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; }
</style>
</head>
<body>
${bodyContent}
<script type="text/javascript">
(async () => {
  // --- Module Registry ---
  const __registry = {};

  // 1. Pre-load all external dependencies from the importmap synchronously
  //    before running any user code.
  const __externals = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'];
  for (const ext of __externals) {
    try {
      const mod = await import(ext);
      __registry[ext] = mod;
      // Expose globally for classic scripts/libraries
      if (ext === 'react') window.React = mod.default || mod;
      if (ext === 'react-dom') window.ReactDOM = mod.default || mod;
    } catch (e) {
      console.error('Failed to pre-load external: ' + ext, e);
    }
  }

  // CSS injector
  function __injectCss(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // User file contents (raw strings)
  const __sources = ${JSON.stringify(Object.fromEntries(
    Object.entries(files).filter(([p]) =>
      p.endsWith(".jsx") || p.endsWith(".js") || p.endsWith(".tsx") || p.endsWith(".ts") || p.endsWith(".css")
    )
  ))};

  // Resolve a relative path
  function __resolve(from, to) {
    if (!to.startsWith('.')) return to;
    const fromParts = from.split('/').slice(0, -1);
    const toParts = to.split('/');
    for (const part of toParts) {
      if (part === '..') fromParts.pop();
      else if (part !== '.') fromParts.push(part);
    }
    const resolved = fromParts.join('/');
    // Try with and without extensions
    const exts = ['', '.jsx', '.js', '.tsx', '.ts'];
    for (const ext of exts) {
      if (__sources[resolved + ext] !== undefined) return resolved + ext;
    }
    return resolved;
  }

  // Load a module (Synchronous to satisfy Babel-transpiled require calls)
  function __require(from, specifier) {
    // External (already pre-loaded into registry)
    if (!specifier.startsWith('.')) {
      if (__registry[specifier]) return __registry[specifier];
      console.warn('External module "' + specifier + '" not pre-loaded. Trying dynamic import (may fail if called sync).');
      // Fallback if not pre-loaded (unlikely to work sync but better than nothing)
      return __registry[specifier]; 
    }

    const path = __resolve(from, specifier);
    if (__registry[path]) return __registry[path];
    if (__registry[path] === null) throw new Error('Circular dependency: ' + path);
    
    const src = __sources[path];
    if (src === undefined) throw new Error('Module not found: ' + path);

    __registry[path] = null; // mark as loading

    // CSS module
    if (path.endsWith('.css')) {
      __injectCss(src);
      __registry[path] = {};
      return {};
    }

    // Transpile with Babel
    // We add 'typescript' preset to support .tsx/.ts files
    // Use runtime: 'automatic' to avoid "React is not defined" issues
    const transpiled = Babel.transform(src, {
      presets: [
        ['react', { runtime: 'automatic' }],
        'env',
        'typescript'
      ],
      filename: path,
    }).code;

    // Execute
    const mod = { exports: {} };
    const req = (sp) => __require(path, sp);
    try {
      const fn = new Function('require', 'module', 'exports', transpiled);
      fn(req, mod, mod.exports);
      __registry[path] = mod.exports;
      return mod.exports;
    } catch (err) {
      console.error('Error executing ' + path, err);
      throw err;
    }
  }

  try {
    // Run the entry point
    __require('', './' + ${JSON.stringify(mainEntry)});
  } catch(e) {
    document.body.innerHTML = '<div style="padding:2rem;font-family:monospace;color:#f87171;background:#1e293b;min-height:100vh;"><h2>⚠️ Preview Error</h2><pre style="margin-top:1rem;white-space:pre-wrap;">' + e.message + '\\n\\n' + (e.stack || '') + '</pre></div>';
    console.error(e);
  }
})();
</script>
</body>
</html>`;
}

function dirname(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
}

function resolveRelative(from: string, to: string): string {
  if (!to.startsWith(".")) return to;
  const fromParts = from ? from.split("/") : [];
  const toParts = to.split("/");
  for (const part of toParts) {
    if (part === "..") fromParts.pop();
    else if (part !== ".") fromParts.push(part);
  }
  return fromParts.join("/");
}
