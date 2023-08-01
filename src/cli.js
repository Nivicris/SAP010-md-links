const { mdLinks } = require("./mdlink.js");


const args = process.argv.slice(2);
const filePath = args[0];
const options = {
  validate: args.includes("--validate"),
  stats: args.includes("--stats"),
  validadeAndStats: args.includes("--validate") && args.includes("--stats"),
};

function linkStatistics(links) {
  return links.reduce(
    (acc, link) => {
      acc.total++;
      acc.unique.add(link.href);
      if (link.status !== 200) {
        acc.broken++;
      }
      return acc;
    },
    { total: 0, unique: new Set(), broken: 0 }
  );
}

function outputLinks(links) {
  links.forEach((link) => {
    const { file, href, text, status, statusText } = link;
    const linkStatus = status === 200 ? `ok ${status}` : `fail ${status}`;
    console.log(`${file} ${href} ${linkStatus} ${text}`);
  });
}


function outputStats(stats) {
  console.log("Total:", stats.total);
  console.log("Unique:", stats.unique);
  console.log("Broken:", stats.broken);
}

function mdLinksCli(path, options) {
  mdLinks(path, options)
    .then((result) => {
      if (options.validate) {
        outputLinks(result);
      } else if (options.stats) {
        const stats = linkStatistics(result);
        outputStats(stats);
      } else if (options.validateAndStats) {
        const linkStats = linkStatistics(result);
        outputStats(linkStats);
      } else {
        outputLinks(result);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

mdLinksCli(filePath, options);
