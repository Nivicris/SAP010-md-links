#!/usr/bin/env node
const { mdLinks } = require("./mdlink");
const chalk = require("chalk");

const args = process.argv.slice(2);
const filePath = args[0];
const options = {
  validate: args.includes("--validate"),
  stats: args.includes("--stats"),
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
  console.log(`${chalk.bold("\n--- Validate ---")}\n`);  
  links.forEach((link) => {    
    const { file, href, text, status } = link;
    const linkStatus = status === 200 ? `ok ${status}` : `fail ${status}`;
    
    console.log(`${chalk.cyan("file:")} ${chalk.bold.white(file)}\n`);
    console.log(`${chalk.cyan("href:")} ${chalk.blueBright(href)}\n`);
    const styledStatus = linkStatus.includes("ok") ? chalk.green(linkStatus) : chalk.red(linkStatus);
    console.log(`${chalk.cyan("status:")} ${styledStatus}\n`);
    console.log(`${chalk.cyan("text:")} ${chalk.yellowBright(text)}\n`);
    console.log(`**********************************`);
  });
}

function outputStats(stats) {
  console.log(`${chalk.bold("\n--- Stats ---")}\n`);
  console.log(`${chalk.cyan("Total:")} ${chalk.yellow(stats.total)}`);
  console.log(`${chalk.cyan("Unique:")} ${chalk.yellow(stats.unique.size)}\n`);
}

function outputStatsBroken(stats) {
  console.log(`${chalk.bold("\n--- Stats e Validate ---")}\n`);
  console.log(`${chalk.cyan("Total:")} ${chalk.yellow(stats.total)}`);
  console.log(`${chalk.cyan("Unique:")} ${chalk.yellow(stats.unique.size)}`);
  console.log(`${chalk.cyan("Broken:")} ${chalk.red(stats.broken)}\n`);
}

function mdLinksCli(path, options) {
  mdLinks(path, options)
    .then((result) => {
      if (result.length === 0) {
        console.log("O arquivo não contém links");
        return;
      }
      if (options.validate && options.stats) {
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
