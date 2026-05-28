# Blog Design Spec (2026-05-26)

## Goal
Add a static‑site blog under `src/blog` that can be built and deployed together with the existing résumé site, while keeping the résumé completely independent.

## Chosen Static Site Generator
**Eleventy (11ty)** – Node‑based, fits the current npm workflow, lightweight, and easy to integrate into the existing Docker/CI pipeline.

## Directory Layout
```
src/
  résumé/          # existing résumé source files
  blog/            # new blog source files (Eleventy)
    _posts/        # Markdown posts with front‑matter (e.g., YYYY‑MM‑DD‑title.md)
    _includes/    # shared partials (header, footer, etc.)
    _layouts/     # Eleventy layout templates
    assets/       # images, CSS, JS for the blog

public/            # generated site root (committed to gh‑pages)
  index.html       # site entry page (copied from src/resume)
  resume.html      # generated résumé
  blog/            # Eleventy output (HTML pages for posts)
```

```
src/
  résumé/          # existing résumé source files
  blog/            # new blog source files
    _posts/        # Markdown posts with front‑matter (e.g., YYYY-MM-DD-title.md)
    _includes/    # shared partials (header, footer, etc.)
    _layouts/     # Eleventy layout templates
    assets/       # images, CSS, JS for the blog
```

## Build Process
1. **Resume build** – unchanged (npm start writes `resume.html` to `public/`).
2. **Blog build** – Eleventy (11ty) will generate the blog into `public/blog/`.
   - Add a `package.json` in `src/blog` with scripts:
     ```json
     "scripts": {
       "build": "eleventy",
       "serve": "eleventy --serve"
     }
     ```
   - Install Eleventy as a dev dependency: `npm install --save-dev @11ty/eleventy`.
   - Eleventy will read Markdown posts from `src/blog/_posts/` and output HTML to `public/blog/` (default `_site` directory is overridden to `public/blog`).
   - Configure Eleventy in `src/blog/.eleventy.js` to set `output: "../public/blog"`.
3. **Docker compose command** – will run both builds sequentially:
   ```bash
   npm install && npm start && \
   cd /code/src/blog && npm install && npx eleventy && \
   rm -rf ./node_modules && echo "Cleared node_modules"
   ```
   This ensures the résumé and blog are both generated into the mounted `public/` folder.
   
4. **Eleventy now generates `public/index.html` with a link to `resume.html`.**

1. **Docker image** – Extend the current `node:10.15.3` image to install Eleventy globally:
   ```bash
   npm install -g @11ty/eleventy
   ```
2. **npm scripts** – Add to `src/blog/package.json`:
   ```json
   "scripts": {
     "build": "eleventy",
     "serve": "eleventy --serve"
   }
   ```
3. **Combined CI step** – In `docker-compose.yaml` run both builds:
   ```bash
   # Build résumé (existing steps)
   npm start && 
   # Build blog
   cd /code/src/blog && npm install && npm run build && 
   # Copy blog output to the shared save directory
   cp -R _site/* /save-dir/
   ```
   The blog output will be placed alongside `resume.html` in the repository root.

## Integration with Existing Site
- The current `index.html` will be left unchanged; it will continue to point to `resume.html`.
- Add a new link in `index.html` (or a separate navigation component) that points to `/blog/` (the generated blog index).
- No changes to the résumé generation pipeline are required; the résumé remains fully independent.

## Deployment
- GitHub Actions already pushes the generated `resume.html` to the `gh-pages` branch.
- After the blog build, the generated files (`/save-dir/blog/…`) will be committed by an updated `push.sh` script.
- **push.sh changes**: add `git add -f resume.html blog/` (or a wildcard `git add -f *`) to include the blog output alongside the résumé.
- No separate deployment workflow is needed.

## Testing & Verification
- **Local**: Run `docker compose up` and verify that both `resume.html` and the blog content (`/blog/index.html` and post pages) are generated.
- **CI**: Ensure the workflow succeeds and the `gh-pages` branch contains both the résumé and blog assets.

## Open Items (to confirm before implementation)
- Choose a default Eleventy theme or minimal layout.
- Decide on a permalink structure for blog posts (e.g., `/blog/:slug/`).
- Whether to add RSS feed generation.

---
*End of design spec*