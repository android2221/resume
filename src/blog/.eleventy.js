module.exports = function(eleventyConfig) {
  // Pass-through static assets (if any)
  eleventyConfig.addPassthroughCopy("assets");

  // Set input and output directories
  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "../../../public/blog"   // Relative from src/blog to public blog dir
    }
  };
};