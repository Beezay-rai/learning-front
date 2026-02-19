// Default Vite + React project files
export const DEFAULT_FILES: Record<string, string> = {
  "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,

  "vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`,

  "package.json": `{
  "name": "my-vite-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}`,

  "src/main.jsx": `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

  "src/App.jsx": `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⚡ Vite + React</div>
        <h1>Hello, Playground!</h1>
        <div className="card">
          <button onClick={() => setCount((c) => c + 1)}>
            Count: {count}
          </button>
        </div>
        <p className="hint">
          Edit <code>src/App.jsx</code> and save to see changes
        </p>
      </header>
    </div>
  )
}

export default App`,

  "src/App.css": `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-header {
  text-align: center;
  color: #fff;
  padding: 2rem;
}

.logo {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #61dafb, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card {
  margin: 1.5rem auto;
}

button {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.hint {
  margin-top: 1.5rem;
  color: rgba(255,255,255,0.5);
  font-size: 0.875rem;
}

code {
  background: rgba(255,255,255,0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}`,
};

// Get the folder structure from flat file paths
export type FileNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; path: string; children: FileNode[] };

export function buildTree(files: Record<string, string>): FileNode[] {
  const root: FileNode[] = [];
  const folderMap: Record<string, FileNode & { type: "folder" }> = {};

  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    if (parts.length === 1) {
      root.push({ type: "file", name: parts[0], path: filePath });
    } else {
      // ensure folders exist
      let currentPath = "";
      let currentChildren = root;
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        if (!folderMap[currentPath]) {
          const folder: FileNode & { type: "folder" } = {
            type: "folder",
            name: parts[i],
            path: currentPath,
            children: [],
          };
          folderMap[currentPath] = folder;
          currentChildren.push(folder);
        }
        currentChildren = (folderMap[currentPath] as FileNode & { type: "folder" }).children;
      }
      currentChildren.push({
        type: "file",
        name: parts[parts.length - 1],
        path: filePath,
      });
    }
  }

  return root;
}

export function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jsx": return "⚛️";
    case "tsx": return "⚛️";
    case "js": return "📜";
    case "ts": return "📘";
    case "css": return "🎨";
    case "html": return "🌐";
    case "json": return "📋";
    case "svg": return "🖼️";
    case "md": return "📝";
    default: return "📄";
  }
}
