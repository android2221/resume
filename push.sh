#!/bin/sh
set -ev

echo 'Updating gh-pages branch...';

setup_git() {
  git config --global user.email "ci@andyhablewitz.com"
  git config --global user.name "CI/CD Pipeline"
}

# Publish only the built site (public/) to gh-pages, not the repo source.
# .nojekyll disables GitHub Pages' Jekyll build so files are served as-is.
commit_website_files() {
  # docker compose runs the build as root, so public/ is root-owned on the
  # runner's host filesystem; reclaim it before writing into it here.
  sudo chown -R "$(id -u):$(id -g)" public/
  cp CNAME public/
  touch public/.nojekyll
  cd public
  git init -b gh-pages
  git add -A
  git commit --message "Updating site - Build: $GITHUB_RUN_NUMBER"
}

upload_files() {
  git push --quiet --force "https://${GH_TOKEN}@github.com/android2221/resume.git" gh-pages
}

setup_git
commit_website_files
upload_files
