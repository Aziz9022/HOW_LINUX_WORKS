# How Linux Works: Personal Interactive Learning Lab

A locally runnable, offline-capable interactive textbook, Linux simulation laboratory, visual systems explorer, and spaced-repetition revision workbench grounded strictly in **How Linux Works, 3rd Edition** by Brian Ward (No Starch Press, 2021).

## Key Features

- **Stage 1 Source Audit Deliverables**: Includes `SOURCE_MANIFEST.md`, `CURRICULUM.md`, and `CONTENT_DATABASE.json`, plus an in-app **Source Audit** view cataloging all 17 chapters, 41 original book illustrations, and documented source limitations.
- **17 Book-Grounded Chapters**: Follows the book's exact chapter and section progression, separating book-grounded instruction from `[Supplemental]` context.
- **14 Tailored Interactive Visualizers**: Step-through `fork()`/`exec()`, file mode & `umask` calculator, FHS explorer, SCSI driver stack tracer, LVM PV/VG/LV extent allocator, Inode/`unlink()` graph, Boot/GRUB editor, systemd parallel vs. sequential startup simulator, PAM rule stack evaluator, Crontab builder, Virtual Memory/swap thrashing simulator, cgroups v1 vs. v2 explorer, IPv4 longest-prefix router, `iptables` chain tracer, `accept()`/`fork()` server model, shell quoting sandbox, `rsync` trailing-slash simulator, `make` dependency graph, and Docker `netns`/OverlayFS explorer.
- **Simulated Linux Terminal Lab**: Safe, in-browser virtual Linux filesystem and command simulator with guided chapter exercises, hints, and reset (clearly labeled as a simulation; does not run on your host OS).
- **Varied Assessments & Mastery Tracking**: Multiple-choice, true/false, fill-in-the-blank, command-writing, output interpretation, debugging, scenario, and short-answer checks with explanations and mastery thresholds (`Not started`, `In progress`, `Completed`, `Needs revision`).
- **Local Persistence & Portability**: Uses **IndexedDB** for progress, personal notes, bookmarks, missed-answer history, and SM-2 spaced-repetition flashcards, **LocalStorage** for theme/font preferences, and schema-validated **JSON Export / Import** with inline **Merge** vs. **Replace** confirmation. Zero backend, zero accounts, zero API keys required.

## Offline Operation

All application code, curriculum data (`CONTENT_DATABASE.json`), interactive visualizers, simulated terminal logic, and all 41 original book illustrations (`/assets/aistudio/*.png`) are bundled and served locally. The only optional external references are Google Fonts stylesheets in `index.html` (`Bricolage Grotesque`, `Plus Jakarta Sans`, and `IBM Plex Mono`), which fail gracefully to local system sans-serif and monospace font stacks when offline without blocking rendering or functionality.

## Running Locally

```bash
# 1. Install dependencies (Node.js 20+ recommended)
npm install

# 2. Start local development server on http://localhost:3000
npm run dev

# 3. Type-check and build static production bundle
npm run lint
npm run build
npm run preview
```

## Deploying to GitHub Pages

This project is pre-configured for GitHub Pages (`base: './'` in `vite.config.ts`, subpath-safe figure paths, and `.github/workflows/deploy.yml`):

1. Push the repository to GitHub on the `main` branch.
2. Open **Settings → Pages** in your GitHub repository and set **Source** to **GitHub Actions**.
3. The **Deploy to GitHub Pages** workflow automatically builds `dist/` and publishes your live URL (`https://<username>.github.io/<repo>/`).
