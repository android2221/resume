# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Build the resume and blog locally** (Docker):
  ```bash
  docker compose up
  ```
  This runs the `node` container defined in `docker-compose.yaml`, which:
  1. Installs npm dependencies for the resume generator.
  2. Executes `npm start` (runs `src/resume/js/generate-resume.js`).
  3. Changes to `src/blog` and runs the Eleventy blog build.
  4. Writes the rendered HTML to `public/` (resume.html, index.html, and blog/).

- **Run the generator without Docker** (requires Node >=10):
  ```bash
  cd src/resume
  npm install   # one‑time setup
  RENDER_FILE_LOCATION=Resume.md npm start
  ```
  The script reads `src/resume/Resume.md`, combines it with `src/resume/html/header.html` and `footer.html`, and produces `resume.html` in the repository root.

- **Clean up after a local build** (removes heavy `node_modules` added by the container):
  ```bash
  rm -rf src/resume/node_modules
  ```

- **Deploy (CI)**: GitHub Actions run `docker compose up` on every push to `master`/`main` and then execute `./push.sh` to push the generated `resume.html` to the `gh-pages` branch. No manual steps are required for deployment.

- **Run a single test**: There are no test suites in this repo. If you add tests later, use the standard `npm test` convention.

## High‑Level Architecture

- **Source Markdown** – `src/resume/Resume.md` is the single source of truth for the résumé content.

- **HTML Template** – `src/resume/html/header.html` and `footer.html` provide static surrounding markup. The generator inserts the rendered Markdown between them.

- **Generator** – `src/resume/js/generate-resume.js`:
  1. Configures `markdown-it` with HTML, linkify, and typographer enabled.
  2. Reads the header, footer, and the Markdown file (path supplied via `RENDER_FILE_LOCATION`).
  3. Renders the Markdown to HTML.
  4. Writes `resume.html` to a shared volume (`/save-dir/`) which maps to the repository root.

- **Docker Build Environment** – `docker-compose.yaml` defines a `node:10.15.3` container that mounts the repository root at `/code/` and `public/` at `/save-dir/`. It runs the resume generator, then the Eleventy blog builder, then cleans up `node_modules`.

- **CI Pipeline** – `.github/workflows/build-resume.yml` triggers on pushes to `master`/`main`.
  1. Checks out the code.
  2. Logs into Docker Hub (required for pulling the Node image).
  3. Executes `docker compose up` to build the résumé.
  4. Runs `./push.sh` (uses `GH_TOKEN`) to push the generated `resume.html` to the `gh-pages` branch for GitHub Pages hosting.

- **Entry Point** – `public/` contains the generated site (resume.html, index.html, blog/). `push.sh` publishes these files to the gh-pages branch root for GitHub Pages.

## Project‑Specific Notes

- The build relies on the environment variable `RENDER_FILE_LOCATION` to locate the Markdown source. Changing the source file path requires updating this variable in `docker-compose.yaml` or the local command.
- No linting or test configuration is present; add a linter (e.g., `eslint`) and scripts in `package.json` if future contributors need code quality checks.
- The `push.sh` script handles committing and pushing the generated HTML to the `gh-pages` branch; understand its flow before modifying deployment.

---

*End of CLAUDE.md*