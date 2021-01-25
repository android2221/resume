// Require
var md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true
  });
var fs = require("fs");

console.log("current dir " + __dirname);

// setup
var saveDir = '/code/';
var finalFile = saveDir + 'index.html';
var htmlDir = '/code/src/html/';

if (!fs.existsSync(saveDir)){
    fs.mkdirSync(saveDir);
}

// Do Work
var htmlHeader  = fs.readFileSync(htmlDir + "header.html");
var htmlFooter = fs.readFileSync(htmlDir + "footer.html");

var FileToRender = process.env.RENDER_FILE_LOCATION;
var content = fs.readFileSync(FileToRender, 'utf8');
var renderResult = md.render(content);

console.log("Rendered resume, writing to file!");

fs.writeFileSync(finalFile, htmlHeader);
fs.appendFileSync(finalFile, renderResult);
fs.appendFileSync(finalFile, htmlFooter);

console.log("Resume build complete!");
