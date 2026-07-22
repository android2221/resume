# Add Eleventy Blog and Generated Index

> **For agentic workers:** REQUIRED SUB‑SKILL: Use `superpowers:subagent‑driven‑development` (recommended) or `superpowers:executing‑plans` to implement this plan task‑by‑task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static‑site blog powered by Eleventy (11ty) under `src/blog`, generate the site into `public/`, and have Eleventy render a simple `public/index.html` that links to `resume.html`.

**Architecture:**
- Source files live in `src/blog/` (Eleventy) and `src/resume/` (existing generator).
- Docker compose mounts the host `public/` directory (`../../public:/save-dir`) so both generators write into the same output folder.
- `push.sh` stages the entire `public/` folder, which is then pushed to the `gh-pages` branch.

**Tech Stack:** Node 10 (existing), Eleventy (`@11ty/eleventy`), Bash, Git.

---

### Task 1: Add Eleventy to the repository

**Files:**
- `src/blog/package.json` – create (dev dependency on Eleventy, scripts).
- `src/blog/.eleventy.js` – create (configure input/output).

- [ ] **Step 1: Write the failing test** – not needed (Eleventy config is declarative).
- [ ] **Step 2: Run test to verify it fails** – run `npm run build` in `src/blog`; it should error because the config file is missing.
- [ ] **Step 3: Implement the minimal implementation**

```json
// src/blog/package.json
{
  "name": "blog",
  "version": "0.1.0",
  "description": "Eleventy blog for the resume site",
  "private": true,
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve"
  },
  "devDependencies": {
    "@11ty/eleventy": "^2.0.0"
  }
}
```

```js
// src/blog/.eleventy.js
module.exports = function(eleventyConfig) {
  // Pass‑through static assets (if any)
  eleventyConfig.addPassthroughCopy("assets");

  // Set input and output directories
  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "../public/blog"   // Relative to src/blog
    }
  };
};
```

- [ ] **Step 4: Run test to verify it passes** – `cd src/blog && npm install && npm run build`. It should create `public/blog/index.html` (empty for now) without errors.
- [ ] **Step 5: Commit**

```bash
git add src/blog/package.json src/blog/.eleventy.js
git commit -m "feat(blog): add Eleventy configuration and package"
```

---

### Task 2: Create basic Eleventy blog source structure

**Files:**
- `src/blog/_posts/2026-05-26-welcome.md` – dummy post (will be ignored later but validates the pipeline).
- `src/blog/_includes/header.njk` – simple header partial (optional).
- `src/blog/_layouts/base.njk` – base layout that yields content.

- [ ] **Step 1: Write a failing test** – not applicable (template rendering).
- [ ] **Step 2: Run test to verify failure** – `npm run build` should succeed but output minimal HTML.
- [ ] **Step 3: Implement source files**

```markdown
---
# src/blog/_posts/2026-05-26-welcome.md
---
title: "Welcome"
date: 2026-05-26
layout: base.njk
---
# Welcome to the blog

This is the first post.
```

```html
<!-- src/blog/_includes/header.njk -->
<header>
  <h1>Andy Hablewitz Blog</h1>
  <nav><a href="/resume.html">Resume</a></nav>
</header>
```

```html
<!-- src/blog/_layouts/base.njk -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{{ title }}</title>
</head>
<body>
  {% include "header.njk" %}
  <main>
    {{ content | safe }}
  </main>
</body>
</html>
```

- [ ] **Step 4: Verify rendering** – `npm run build` should produce `public/blog/2026-05-26-welcome/index.html` with the layout applied.
- [ ] **Step 5: Commit**

```bash
git add src/blog/_posts src/blog/_includes src/blog/_layouts
git commit -m "feat(blog): add starter post, header, and base layout"
```

---

### Task 3: Add Eleventy index page that links to the résumé

**Files:**
- `src/blog/index.md` – markdown that Eleventy will render to `public/index.html`.

- [ ] **Step 1: Write a failing test** – not applicable.
- [ ] **Step 2: Run test to verify failure** – `npm run build` will produce an `index.html` without the résumé link.
- [ ] **Step 3: Implement the index file**

```markdown
---
# src/blog/index.md
---
title: "Home"
layout: base.njk
permalink: "/index.html"
---
# Home

[View my résumé](/resume.html)
```

- [ ] **Step 4: Verify** – `npm run build`; open `public/index.html` and ensure the link points to `/resume.html`.
- [ ] **Step 5: Commit**

```bash
git add src/blog/index.md
git commit -m "feat(blog): create index page with résumé link"
```

---

### Task 4: Adjust the résumé generator to write into `public/`

**File:** `src/resume/js/generate-resume.js`

- [ ] **Step 1: Write a failing test** – not applicable (script output).
- [ ] **Step 2: Verify current failure** – after running Docker compose, `public/resume.html` should already exist because `saveDir` is set to `/save-dir/public/`. Confirm the file is present.
- [ ] **Step 3: Ensure the script writes to the correct folder** (already set, but verify the line exists):

```js
var saveDir = '/save-dir/public/';   // Ensure this line is present
var finalFile = saveDir + 'resume.html';
```

- [ ] **Step 4: Run a quick build** – `docker compose up` and check `public/resume.html`.
- [ ] **Step 5: Commit (if any change required)**

```bash
git add src/resume/js/generate-resume.js
git commit -m "fix(resume): ensure output goes to public/ folder"
```

---

### Task 5: Update Docker Compose to run both builds

**File:** `src/resume/docker-compose.yaml`

- [ ] **Step 1: Write failing test** – running `docker compose up` should succeed but not yet build the blog.
- [ ] **Step 2: Implement combined command**

```yaml
# src/resume/docker-compose.yaml
version: '3.6'
services:
  build-resume:
    image: node:10.15.3
    working_dir: /code/
    volumes:
      - ./:/code/
      - ../../public:/save-dir/
    environment:
      - RENDER_FILE_LOCATION=/code/Resume.md
    command: >
      bash -c '
        npm install && npm start && \
        cd /code/src/blog && npm install && npx eleventy && \
        rm -rf ./node_modules && echo "Cleared node_modules"
      '
```

- This runs the résumé build, then installs Eleventy in `src/blog`, runs the Eleventy build (outputting to `../public/blog`), and finally cleans `node_modules`.
- [ ] **Step 3: Verify** – `docker compose up`; after it finishes, `public/` should contain `resume.html`, `index.html`, and the `blog/` folder with generated posts.
- [ ] **Step 4: Commit**

```bash
git add src/resume/docker-compose.yaml
git commit -m "chore(ci): run Eleventy blog build after résumé build"
```

---

### Task 6: Ensure `push.sh` stages the full site

**File:** `push.sh` (already contains `git add -f public/`). Verify no other paths are added.

- [ ] **Step 1: Verify** – run `./push.sh` locally (you may need a temporary `gh-pages` branch). Ensure it commits the entire `public/` directory.
- [ ] **Step 2: No changes required – just confirm**. If any adjustment is needed, edit accordingly.
- [ ] **Step 3: Commit (if edited)**

```bash
git add push.sh
git commit -m "chore(ci): ensure push.sh stages entire public folder"
```

---

### Task 7: Add a short entry to the design spec (optional)

**File:** `docs/superpowers/specs/2026-05-26-blog-design.md`

- Append a bullet under “Build Process” noting that Eleventy now generates `public/index.html`.

- [ ] **Step 1: Edit spec** – add the line:

> - Eleventy now generates `public/index.html` with a link to `resume.html`.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-05-26-blog-design.md
git commit -m "docs: note that Eleventy generates public/index.html"
```

---

## Execution Hand‑off

**Plan saved to:** `docs/superpowers/plans/2026-05-26-add-eleventy-blog-and-index.md`.

Two execution options:

1. **Sub‑agent‑driven (recommended)** – I will dispatch a fresh sub‑agent for each task, pause for your review after every commit, and iterate quickly.
2. **Inline execution** – I will run the tasks sequentially in this session using the `executing-plans` skill.

Which approach would you like to use?