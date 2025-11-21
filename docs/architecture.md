Here’s a detailed **Architecture & Folder Structure Document** for your desktop application (using Next.js + Electron + TypeScript + Tailwind + ShadCN UI + modular UI/tabs). This is written so your engineering team (even less experienced members) can follow it and build the project in a scalable, maintainable way.

---

## 1. High-Level Architecture Overview

Before folder structures, here’s how the pieces fit together:

* **Renderer process**: The UI layer built with Next.js + React + Tailwind + ShadCN UI. This runs in Electron’s BrowserWindow, shows login UI, file browsers, terminals, etc.
* **Main process**: Handles Electron lifecycle, window creation, IPC (Inter-Process Communication) between renderer and main, manages SSH/connection logic, channel management (SFTP, shell, port-forwarding), credential storage, session management.
* **Shared modules / backend logic**: Modules that manage SSH client (`ssh2`), session manager, file operations, terminal operations. These live in main process or shared folder.
* **UI modules/components**: Renderer side components (tabs, panels, file browser, terminal, editor).
* **Persistence**: Local storage for recent sessions, credentials (encrypted for 24 h), app preferences, layout state.
* **Build & packaging**: Next.js build (export to “out” or `.next/standalone`), Electron packaging (via `electron-builder` or similar).
* **Folder separation**: Keep source code (renderer + main) clearly separated so that UI code, business/SSH logic, platform code are distinct.

---

## 2. Folder Structure

Here’s a recommended project folder structure. You may adjust names, but the idea is clear separation, scalability, and ease of navigation.

```
/my-vps-manager
  /package.json
  /tsconfig.json
  /next.config.js
  /electron.main.ts          ← entry for Electron main process
  /preload.ts                ← electron preload script (for safe IPC)
  /public                    ← static assets (icons, images, fonts)
  /src
    /main                    ← Electron main‐process code
      /connection            ← SSH connection manager, channel manager
        connectionManager.ts
        channelManager.ts
      /ipc                   ← IPC handler definitions (renderer ↔ main)
        handlers.ts
        types.ts
      /storage               ← credential/store logic
        credentialStore.ts
        sessionStore.ts
      /portForwarding        ← logic for port forwarding/tunnelling
        forwardManager.ts
      /utils                 ← utility functions (logging, error handling)
        logger.ts
        errors.ts
    /renderer                ← UI (Next.js + React) code
      /pages                 ← Next.js “pages” or “app” router entry (depending on version)
        _app.tsx
        index.tsx
        login.tsx
        dashboard.tsx
      /components            ← shared UI components
        /tabs
          TabManager.tsx
          Tab.tsx
        /fileBrowser
          FileBrowser.tsx
          FileItem.tsx
        /terminal
          TerminalPanel.tsx
        /editor
          EditorPanel.tsx
        /layout
          Sidebar.tsx
          Header.tsx
          ResizablePanels.tsx
      /hooks                 ← custom React hooks
        useSSHSession.ts
        useTabs.ts
      /services              ← services to call IPC or main logic
        sshService.ts
        fileService.ts
      /styles                ← Tailwind config, global styles
        globals.css
        tailwind.config.js
      /types                 ← shared types/interfaces for renderer
        session.ts
        tab.ts
    /shared                  ← code shared between main & renderer (if any)
      types.ts
      constants.ts
  /build                     ← build output (optional)
  /.env.local                ← environment variables
```

### Notes on structure:

* Use `/src` directory so config files remain at root and source code is contained.
* Within `/renderer`, keep components broken down by feature (tabs, fileBrowser, terminal, editor) so it scales.
* The `/main` directory contains all the Electron main‐process logic—connection management, IPC, storage.
* `shared` can hold types/interfaces that are needed both in renderer and main (to avoid duplication).
* Use `services` in renderer as an abstraction layer for IPC calls (so UI code doesn’t talk to `ipcMain`/`ipcRenderer` directly everywhere).
* For layout/resizable panels/tabs: store those UI helpers in `/components/layout` and `/components/tabs`.
* For Next.js routing: Adjust according to your version (pages directory vs app router). The docs recommend organizing code such that routing and UI are clear. ([Next.js][1])

---

## 3. Architectural Guidelines & Best Practices

Here are guidelines for your engineers to follow, to keep the architecture scalable and maintainable:

### 3.1 Separation of concerns

* UI logic (React components) should be in renderer; avoid embedding SSH logic in UI components.
* Connection/SSH logic lives in main process; renderer interacts via IPC services.
* Keep business logic modular: e.g., channelManager handles multiple SSH channels; connectionManager manages establishing/closing the SSH connection.
* For shared types/interfaces: place in `shared/types.ts` so both renderer and main use same definitions (tab types, session types, etc).
* Services in renderer call `ipcRenderer.invoke(...)` or `send(...)` to main; UI components call services, not raw IPC.

### 3.2 Tab & Panel Management

* Use a tab manager state in renderer: track open tabs (each tab has id, type (browser/editor/terminal), payload (remotePath, filePath), etc).
* Use a panel layout component (`ResizablePanels.tsx`) to manage split panels (left sidebar, main area, bottom area).
* Tabs should be closable, reorderable (use drag & drop if desired).
* When a tab is created, renderer notifies main process (if needed) for setup (e.g., for terminal tab open, main opens shell channel).
* When tab is closed, send cleanup message to main (e.g., close shell channel) so resources aren’t leaked.

### 3.3 Connection & Channel Lifecycle

* On login: main process uses `ssh2` to `Client.connect(...)`. On success store `client` instance.
* Immediately or lazily open SFTP channel: `client.sftp(...)`. Store `sftp` object in connection/session context.
* For each terminal tab: open a new shell channel: `client.shell(...)`. One tab → one shell stream object. Maintain mapping tabId → shellChannel.
* For port forwarding: if user configures a tunnel, call `client.forwardOut()` or `client.forwardIn()`. Track active forwards.
* Reuse the same `client` for all channels; do not create multiple client connections unless intentional. This reduces overhead and simplifies credential logic.
* Keep connection alive: optionally send periodic keep-alive or monitor idle. Listen to `client.on('close')`, `client.on('error')` to handle connection drops.
* On logout: loop through all active channels (shells, forwards), close them; then `client.end()`. Then clear session state in main and notify renderer.
* Avoid opening unnecessary channels: for example, only open a shell channel if the user opens a terminal tab; keep SFTP open throughout session for file operations.

### 3.4 Communication (Renderer ↔ Main)

* Define IPC channels clearly in one file (`ipcHandlers.ts`) with types: e.g., `'ssh:connect'`, `'sftp:listDir'`, `'terminal:create'`, `'tab:close'`, `'forward:create'`, etc.
* Renderer calls a service (e.g., `sshService.connect(credentials)`) which does `ipcRenderer.invoke('ssh:connect', credentials)`.
* Main defines `ipcMain.handle('ssh:connect', async (event, credentials) => { … })`.
* Return results (success/failure) or send events via `ipcMain.emit`/`ipcRenderer.on` for streaming (terminal data).
* Use typed IPC (TypeScript) so you don’t have mismatched message names or data structures.

### 3.5 File Browser & Editor Workflows

* When renderer sends “list directory” request: main uses `sftp.readdir(remotePath)` → returns list → renderer displays.
* Upload: UI drag/drop → send `ipcRenderer.invoke('sftp:upload', { localPaths, remoteDir })` → main uses `sftp.put()` or create stream.
* Download: send `ipcRenderer.invoke('sftp:download', { remotePath, localDestination })`.
* Editor: user opens file → send `ipcRenderer.invoke('sftp:readFile', remotePath)` → return content → load editor. On save: send `ipcRenderer.invoke('sftp:writeFile', { remotePath, content })`.
* External Editor option: Main downloads file to `os.tmpdir()`, opens local path (`shell.openPath()`), monitors change/save, then upload back via `sftp.put()`.
* Path and permissions: The main process should handle mapping remote paths, check for permission errors, send back meaningful error codes to renderer.

### 3.6 Credential & Session Storage

* Use `keytar` (or similar) to store credentials securely (passwords/keys) if “remember me for 24 h” is checked.
* Use `electron-store` for non-sensitive local storage (recent sessions list, layout preferences, open tabs state).
* On app start: check store for valid stored credentials (expiry check). If valid, prefill login or auto-connect.
* On logout or expiry: delete credentials and clear session reference.
* Ensure encryption of stored credentials, and only keep for 24 h (store timestamp). After expiry, prompt re-login.

### 3.7 Build & Packaging

* Develop UI via Next.js in `renderer`. Use Tailwind + ShadCN UI for styling.
* Use Next.js export to `out` directory (or `.next/standalone` if server side). For desktop only you might use static export. Reference: guide on Next.js + Electron. ([Medium][2])
* Electron main process loads the built Next.js UI (in development: load `http://localhost:3000`; in production: load local path).
* Use `electron-builder` to build installers for Windows/macOS/Linux.
* CI scripts: `npm run dev:renderer`, `npm run dev:electron`, `npm run build`, etc. Use workspace commands if monorepo.

---

## 4. Developer Doc / Guidelines for Engineers

Here’s a short “doc” section for your team:

### Getting started (developer flow)

1. Clone repo.
2. `npm install` (or `pnpm`, `yarn` depending).
3. Start renderer in dev mode: `npm run dev:renderer` → launches Next.js dev server on port (e.g., 3000).
4. Start Electron app in dev mode: `npm run dev:electron` → launches Electron window loading renderer.
5. Make changes in `/src/renderer` components; hot reload should reflect.
6. Work on main process code via `/src/main`. Changes may require restarting Electron process.
7. When ready to package: `npm run build` → builds Next.js, then `npm run dist` → packages Electron app with `electron-builder`.

### Coding standards

* Use TypeScript everywhere.
* Use consistent linting/formatting (`eslint`, `prettier`).
* For components: follow directory structure: `components/featureName/ComponentName.tsx`.
* For services: `services/featureNameService.ts`.
* For hooks: `hooks/useFeatureName.ts`.
* For types/interfaces: `types.ts` inside component folder or `shared/types.ts`.
* For main process modules: keep code in `/src/main`, subfolders by feature (connection, ipc, storage).
* Use meaningful naming for IPC channels (prefix like `ssh:`, `sftp:`, `tab:`).
* Write JSDoc/comments for public functions in main process (especially SSH logic) to help less experienced devs.

### Pull requests / reviews

* Ensure new features map to one of the tabs/workflows (e.g., file browser tab, terminal tab, editor tab).
* Write unit tests where applicable (e.g., utility modules).
* Manual testing: connect to a real test VPS, test multiple tabs (terminals, file browser), upload/download files, log out, reconnect.

### Documentation

* Maintain a `docs/architecture.md` in repo describing this folder structure and architectural reasoning.
* Maintain story/task tracking for features (tabs, panels, SSH sessions, file operations).
* Use `README.md` in root summarizing how to build, run, package.

---

## 5. Summary

This folder structure and architecture will allow your team to build a scalable, maintainable desktop application that leverages Next.js + Electron + Tailwind + ShadCN UI. It separates concerns clearly (UI vs main logic), supports modular UI (tabs, panels) and advanced workflows (SSH connection, SFTP, terminal tabs).

If you like, I can **generate a downloadable Markdown document** (e.g., `architecture.md`) with this content formatted for your engineers, ready to be added to your repo. Would that be helpful?

[1]: https://nextjs.org/docs/app/getting-started/project-structure?utm_source=chatgpt.com "Getting Started: Project Structure | Next.js"
[2]: https://medium.com/%40aleksej.gudkov/how-to-build-an-electron-app-with-next-js-a-complete-guide-6f6ddf0111b2?utm_source=chatgpt.com "How to Build an Electron App with Next.js: A Complete Guide"
