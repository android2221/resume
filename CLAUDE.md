# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the repository.

## Common Development Commands

- **Production build** (Docker, one-shot):
  ```bash
  docker compose up
  ```
  Builds the resume and blog into `public/`. Used by CI/CD. Cleans up `node_modules` after.

- **Local development** (Docker, hot reload):
  ```bash
  docker compose -f docker-compose.dev.yml up
  ```
  Starts two services:
  1. **resume-watch** — watches `Resume.md` and `html/`, rebuilds resume on change.
  2. **blog-serve** — Eleventy dev server with live reload, serves at `http://localhost:8080`.

  Both services mount the repo root so file changes on your host trigger rebuilds automatically.

- **Run the generator without Docker** (requires Node >=18):
  ```bash
  cd src/resume
  npm install            # one‑time setup
  RENDER_FILE_LOCATION=Resume.md npm start   # one-shot build
  npm run watch          # watch mode (requires nodemon, installed via devDependencies)
  ```

- **Run the blog without Docker**:
  ```bash
  cd src/blog
  npm install            # one‑time setup
  npx @11ty/eleventy --serve --output=../../public
  ```

- **Clean up after a Docker build** (removes heavy `node_modules` added by the container):
  ```bash
  rm -rf src/resume/node_modules src/blog/node_modules
  ```

- **Deploy (CI)**: GitHub Actions run `docker compose up` on every push to `master`/`main` and then execute `./push.sh` to push the generated `public/` contents to the `gh-pages` branch. No manual steps required.

- **Run a single test**: There are no test suites in this repo. If you add tests later, use the standard `npm test` convention.

## High‑Level Architecture

- **Source Markdown** – `src/resume/Resume.md` is the single source of truth for the résumé content.

- **HTML Template** – `src/resume/html/header.html` and `footer.html` provide static surrounding markup. The generator inserts the rendered Markdown between them.

- **Generator** – `src/resume/js/generate-resume.js`:
  1. Configures `markdown-it` with HTML, linkify, and typographer enabled.
  2. Reads the header, footer, and the Markdown file (path supplied via `RENDER_FILE_LOCATION`).
  3. Renders the Markdown to HTML.
  4. Writes `resume/index.html` to `/save-dir/` (mapped to `public/`).

- **Blog** – `src/blog/` is an Eleventy (11ty) site. `.eleventy.js` configures input/output dirs and watch targets. Output goes to `public/`.

- **Docker Compose (Production)** – `docker-compose.yaml` defines a single `node:18` service that runs the resume generator, copies CSS, runs Eleventy, then cleans up.

- **Docker Compose (Dev)** – `docker-compose.dev.yml` defines two services (`resume-watch` and `blog-serve`) for local development with hot reloading. Use `-f docker-compose.dev.yml` to select it.

- **CI Pipeline** – `.github/workflows/build-resume.yml` triggers on pushes to `master`/`main`.
  1. Checks out the code.
  2. Logs into Docker Hub.
  3. Executes `docker compose up` to build.
  4. Runs `./push.sh` (uses `GH_TOKEN`) to push to `gh-pages`.

- **Entry Point** – `public/` contains the generated site. `push.sh` publishes these files to the gh-pages branch root for GitHub Pages.

## Project‑Specific Notes

- The build relies on the environment variable `RENDER_FILE_LOCATION` to locate the Markdown source.
- No linting or test configuration is present; add a linter (e.g., `eslint`) and scripts in `package.json` if needed.
- The `push.sh` script handles committing and pushing the generated HTML to the `gh-pages` branch.
- Dev mode uses `nodemon` (added to `src/resume/devDependencies`) for resume watching and Eleventy's built-in `--serve` for the blog.

---

*End of CLAUDE.md*
