# My Resume
My resume is written in markdown, built with Docker and TravisCI, and deployed to GitHub pages. See it at android2221.github.io/resume

## About
I wanted to be able use one source document for both print and web, while avoiding cumbersome desktop publishing apps.

I use markdown-it in a Docker container to do the rendering, and I use TravisCI to run my Dockerfile and a script that commits the results to my GitHub pages branch. Markdown-it allows me to use some traditional HTML tags which helps with complicated formatting that markdown just can't do. 

I use the 'save as PDF' functionality in Chrome to create flat files as needed.

## Running Locally
Running the Docker container will render the Resume.md file. You can simply wipe it out and replace with your contents.
```
git clone https://github.com/android2221/resume.git
cd resume/
docker-compose up
```

This will render an index.html in the root of this repository.

## Deploying
Deploy is configured in ".travis.yml": it runs push.sh to update the GitHub pages branch.

## Todos
- I'd like to switch this to use GitHub actions, free TravisCI is very slow lately.
