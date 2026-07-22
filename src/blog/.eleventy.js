module.exports = function(eleventyConfig) {
  const isProduction = process.env.ELEVENTY_ENV === "production";

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi
      .getFilteredByGlob("./_posts/*.md")
      .filter((post) => !(isProduction && post.data.draft))
      .sort((a, b) => b.date - a.date);
  });

  // Draft posts (draft: true in front matter) get no output file in
  // production, so they can't be reached even via a direct URL. Outside
  // production they render normally.
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (isProduction && data.draft) {
        return false;
      }
      return data.permalink;
    }
  });

  // Register a date filter for Nunjucks templates
  eleventyConfig.addFilter("date", function(dateObj, format) {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
    if (format === "YYYY") return String(year);
    return `${year}-${month}-${day}`;
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      output: "../../public"
    }
  };
};
