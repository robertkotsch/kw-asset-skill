# Multi-Game Architecture (Variant)

> Back to [kw-asset-skill.md](../kw-asset-skill.md)
>
> **This is an ALTERNATIVE architecture, not the default single-asset flow.** Use it only
> when one repository must produce **several independent HTML5 games/assets**, each compiled
> into its own `.zip` for separate upload to Knowledgeworker. The baseline
> `/kw-asset-setup-workflow` scaffolds a single vanilla-JS asset; this variant uses
> **TypeScript + SCSS** and a single `vite.config.ts` that builds N games independently.
>
> Replace `my-multi-game-asset` and the `game_1 … game_5` list with your own project name
> and the actual number of games (N). The architectural rules in §5 are identical to the
> single-asset skill (no hardcoded colors/text/values).

---

## 1. Project Initialization

Create the repo (or clone your empty remote), set your own Git identity, then initialize:

```bash
mkdir my-multi-game-asset
cd my-multi-game-asset
git init
pnpm init
```

Install the dependencies (drop d3/gsap/pixi.js if a given game doesn't need them):
```bash
# Core API
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v4.0.0
pnpm add d3 gsap pixi.js resize-observer-polyfill

# Dev Dependencies
pnpm add -D vite typescript sass cross-env vite-plugin-zip-pack vite-plugin-html @types/node
```

Update `package.json` with one standalone build script per game (here: 5 games):
```json
{
  "name": "my-multi-game-asset",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "build:game_1": "cross-env GAME_BUILD=game_1 vite build --config vite.config.ts",
    "build:game_2": "cross-env GAME_BUILD=game_2 vite build --config vite.config.ts",
    "build:game_3": "cross-env GAME_BUILD=game_3 vite build --config vite.config.ts",
    "build:game_4": "cross-env GAME_BUILD=game_4 vite build --config vite.config.ts",
    "build:game_5": "cross-env GAME_BUILD=game_5 vite build --config vite.config.ts"
  }
}
```

---

## 2. Directory Scaffolding
Replicate this exact folder structure to strictly isolate the game scopes:
```text
my-multi-game-asset/
|-- package.json
|-- tsconfig.json
|-- vite.config.ts
|-- vite-plugin-ts-middleware.ts
|-- .gitignore          // Standard Node.js Git ignores
|-- index.html          // Dev Hub Page for previewing all games
|-- src/
    |-- styles/
    |   +-- global.scss
    +-- app/
        |-- game_1/
        |   |-- index.html      // Game entry point
        |   |-- index.ts        // Game logic
        |   |-- config.json     // Variables/metrics
        |   |-- labels.json     // Extracted strings
        |   +-- assets/         // Local media
        |-- game_2/
        |-- game_3/
        |-- game_4/
        +-- game_5/
```

Add this minimal `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts", "vite-plugin-ts-middleware.ts"]
}
```

Create a standard `.gitignore` file to avoid tracking unwanted build or local system files:
```text
node_modules/
dist/
.DS_Store
*.local
.env
.env.*
.vscode/
npm-debug.log*
pnpm-debug.log*
```

Create a root `index.html` as a **Dev Hub Page** so you can easily navigate between games when the development server is running:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Games Dev Hub</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; background: #f9fafb; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { margin-top: 0; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 0.5rem; }
        a { display: block; padding: 1rem; background: #eff6ff; color: #1d4ed8; text-decoration: none; border-radius: 4px; font-weight: bold; transition: background 0.2s; }
        a:hover { background: #dbeafe; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Games Dev Hub</h1>
        <p>Select a game to preview in development mode:</p>
        <ul>
            <li><a href="/games/game_1/">Game 1</a></li>
            <li><a href="/games/game_2/">Game 2</a></li>
            <li><a href="/games/game_3/">Game 3</a></li>
            <li><a href="/games/game_4/">Game 4</a></li>
            <li><a href="/games/game_5/">Game 5</a></li>
        </ul>
    </div>
</body>
</html>
```

---

## 3. Custom Vite configuration files

You must create TWO custom files in the root directory to handle individual building, static asset mapping, and DOM routing for independent games.

### File 1: `vite-plugin-ts-middleware.ts`
```typescript
import { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export default function tsMiddleware(): Plugin {
  return {
    name: 'ts-middleware',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/src/')) {
            try {
              const filePath = resolve(process.cwd(), '.' + req.url);
              const content = readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/javascript');
              res.end(content);
              return;
            } catch (e) {
              console.error('Error serving file:', e);
            }
          }
          next();
        });
      };
    },
  };
}
```

### File 2: `vite.config.ts` (Core Build Engine)
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import zipPack from 'vite-plugin-zip-pack';
import tsMiddleware from './vite-plugin-ts-middleware';

const gameList = ['game_1', 'game_2', 'game_3', 'game_4', 'game_5'];
const game = process.env.GAME_BUILD;

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [resolve(process.cwd(), 'src/styles')],
      },
    },
  },
  base: './', // CRITICAL for relative path LMS embedding
  publicDir: game && gameList.includes(game) ? false : 'public',
  root: '.',
  build: (() => {
    if (game && gameList.includes(game)) {
      return {
        outDir: `dist/${game}`,
        emptyOutDir: true,
        rollupOptions: {
          input: resolve(process.cwd(), `src/app/${game}/index.html`),
          output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          }
        }
      };
    } else {
      // Default: build all games
      const inputs: Record<string, string> = {};
      gameList.forEach(g => {
        inputs[`${g}/index`] = resolve(process.cwd(), `src/app/${g}/index.html`);
      });
      return {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
          input: inputs,
          output: {
            entryFileNames: 'assets/[name]-[hash].js',
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash][extname]',
          }
        }
      };
    }
  })(),
  server: {
    port: 5173,
    strictPort: true,
    open: '/',
    fs: { strict: false, allow: ['..'] }
  },
  resolve: { alias: { '@': resolve(process.cwd(), 'src') } },
  plugins: [
    ...((game && gameList.includes(game) ? [{
      name: 'copy-json-assets',
      async closeBundle() {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const srcDir = path.join(process.cwd(), 'src', 'app', game);
        const distDir = path.join(process.cwd(), 'dist', game);
        if (fs.existsSync(srcDir) && fs.existsSync(distDir)) {
          // Copy json
          fs.readdirSync(srcDir).forEach(file => {
            if (file.endsWith('.json')) {
              fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
            }
          });
          // Copy assets folder
          const assetsDir = path.join(srcDir, 'assets');
          const distAssetsDir = path.join(distDir, 'assets');
          if (fs.existsSync(assetsDir)) {
            if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });
            fs.readdirSync(assetsDir).forEach(file => {
               const srcPath = path.join(assetsDir, file);
               if(fs.statSync(srcPath).isFile()){
                 fs.copyFileSync(srcPath, path.join(distAssetsDir, file));
               }
            });
          }
        }
      }
    }, {
      name: 'move-html-to-root',
      async closeBundle() {
        const fs = await import('node:fs');
        const path = await import('node:path');
        const distDir = path.join(process.cwd(), 'dist', game);
        const nestedHtmlPath = path.join(distDir, 'src', 'app', game, 'index.html');
        const rootHtmlPath = path.join(distDir, 'index.html');
        if (fs.existsSync(nestedHtmlPath)) {
          let htmlContent = fs.readFileSync(nestedHtmlPath, 'utf-8');
          // Fix to relative paths
          htmlContent = htmlContent.replace(/src="\/assets\//g, 'src="assets/');
          htmlContent = htmlContent.replace(/href="\/assets\//g, 'href="assets/');
          fs.writeFileSync(rootHtmlPath, htmlContent);
          fs.rmSync(path.join(distDir, 'src'), { recursive: true, force: true });
        }
      }
    }] : []) as any[]),
    ...((game && gameList.includes(game) ? [{
      ...zipPack({
        inDir: `dist/${game}`,
        outDir: 'dist',
        outFileName: `${game}.zip`
      }),
      enforce: 'post'
    }] : []) as any[]),
    {
      name: 'games-dev-html-mapper',
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          if (req.url && req.method === 'GET') {
            const htmlMatch = req.url.match(/^\/games\/([a-zA-Z0-9_\-]+)\/?(index\.html)?$/);
            if (htmlMatch) {
              const gameMatch = htmlMatch[1];
              const fs = await import('node:fs');
              const path = await import('node:path');
              const htmlPath = path.resolve(process.cwd(), `src/app/${gameMatch}/index.html`);
              if (fs.existsSync(htmlPath)) {
                res.setHeader('Content-Type', 'text/html');
                res.end(fs.readFileSync(htmlPath, 'utf-8'));
                return;
              }
            }
            const assetMatch = req.url.match(/^\/games\/([a-zA-Z0-9_\-]+)\/(.+)$/);
            if (assetMatch && assetMatch[2] !== '' && assetMatch[2] !== 'index.html') {
              req.url = `/src/app/${assetMatch[1]}/${assetMatch[2]}`;
            }
          }
          next();
        });
      }
    },
    tsMiddleware()
  ] as any[],
});
```

---

## 4. Boilerplate for a Game

In `src/app/game_1/index.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game 1</title>
    <!-- Base must be relative for final output -->
    <base href="./"> 
</head>
<body>
    <div class="game-container">
        <!-- Render your game logic here -->
        <h1 id="title-label"></h1> 
        <button id="start-btn" class="kw-button-primary"></button>
    </div>
    <!-- Script path is absolute during dev, but vite moves it properly during build -->
    <script type="module" src="/src/app/game_1/index.ts"></script>
</body>
</html>
```

In `src/app/game_1/index.ts`:
```typescript
import { configure, onInitialize, setHeight, setSuspendData, completed } from 'knowledgeworker-embedded-asset-api';

document.addEventListener('DOMContentLoaded', () => {
    configure({ autoCompletion: false });

    onInitialize(async (configuration) => {
        // 1. Restore State if exists
        let gameState = { score: 0 };
        if (configuration.suspendData) {
            gameState = JSON.parse(configuration.suspendData);
        }

        // 2. Fetch external Config and Labels dynamically relative to index.html
        try {
            const labelsRes = await fetch('./labels.json');
            const labels = await labelsRes.json();
            document.getElementById('title-label')!.innerText = labels.title;
            document.getElementById('start-btn')!.innerText = labels.startBtn;
        } catch(e) {
            console.error("Failed to fetch labels", e);
        }

        // 3. Keep height synced dynamically
        setHeight(document.documentElement.scrollHeight);
        new ResizeObserver(() => setHeight(document.documentElement.scrollHeight)).observe(document.body);
    });
});
```

---

## 5. Architectural Mandates
When writing code for each game, you MUST follow the same architectural directives as the single-asset skill:

1. **Colors**: **NEVER** use hardcoded colors (rgb, hex, 'red'). Rely entirely on `--kw-text-color`, `--kw-action-color`, etc., exposed globally by the Knowledgeworker API.
2. **Text**: Strings must NEVER be hardcoded in HTML or TypeScript. All display text must be configured dynamically from a local `labels.json` to allow translation replacement.
3. **Values**: Timeouts, target goals, or completion parameters must be externalized inside `config.json`.
4. **Completion API**: Explicitly compute win states against the variables loaded from `config.json`, then invoke `completed()` to tell the LMS the specific subset game has been cleared.
