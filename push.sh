#!/bin/sh
set -ev

echo 'Updating gh-pages branch...';

setup_git() {
  git config --global user.email "ci@andyhablewitz.com"
  git config --global user.name "CI/CD Pipeline"
}

commit_website_files() {
  git checkout -B gh-pages
  # Remove any existing tracked files to start clean
  git rm -rf --cached . 2>/dev/null || true
  # Move public/* to the branch root so URLs are clean
  cp -r public/* .
  # Ensure CNAME is included for custom domain
  cp CNAME . 2>/dev/null || true
  git add -f .
  git commit --message "Updating resume HTML - Build: $GITHUB_RUN_NUMBER"
}

upload_files() {
  git remote add origin-pages https://${GH_TOKEN}@github.com/android2221/resume.git > /dev/null 2>&1
  git push --quiet --force --set-upstream origin-pages gh-pages
}

setup_git
commit_website_files
upload_files