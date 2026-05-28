module.exports = function(eleventyConfig) {
  // Set input and output directories
  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "../../public"   // From src/blog to repo-root public/
    }
  };
};