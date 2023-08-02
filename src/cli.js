#!/usr/bin/env node
const { mdLinks } = require("./mdlink");

const args = process.argv.slice(2);
const filePath = args[0];
const options = {
  validate: args.includes("--validate"),
  stats: args.includes("--stats"),
  validateStats: args.includes("--validate") && args.includes("--stats"), // Correção do nome da variável
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
    const { file, href, text, status } = link;
    const linkStatus = status === 200 ? `ok ${status}` : `fail ${status}`;
    console.log(`${file} ${href} ${linkStatus} ${text}`);
  });
}

function outputStats(stats) {
  console.log("Total:", stats.total);
  console.log("Unique:", stats.unique.size); // Exibir o valor numérico de links únicos
}

function outputStatsBroken(stats) {
  console.log(`Total: ${stats.total}`);
  console.log(`Unique: ${stats.unique.size}`); // Exibir o valor numérico de links únicos
  console.log(`Broken: ${stats.broken}`);
}

function mdLinksCli(path, options) {
  mdLinks(path, options)
    .then((result) => {
      if (result.length === 0) {
        console.log("O arquivo não contém links");
        return;
      }
      if (options.validateStats) {
        const linkStats = linkStatistics(result);
        outputStatsBroken(linkStats);
      } else if (options.validate) {
        outputLinks(result);
      } else if (options.stats) {
        const stats = linkStatistics(result);
        outputStats(stats);
      } else {
        outputLinks(result);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

mdLinksCli(filePath, options);

