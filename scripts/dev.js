const chokidar = require('chokidar');
const fs = require("fs");
const yaml = require("yaml");
const chalk = require("chalk");
const cl = require("chalkline");
const shell = require("shelljs");
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const args = yargs(hideBin(process.argv)).argv

const file = args.file || "./plugin.yml";
const cwd = args.cwd || process.cwd();

const runGoTemplate = () => {
  const fileContents = fs.readFileSync(file).toString();
  let stepsTemplate = yaml.parse(fileContents).spec.stepsTemplate;

  // strip lines with comments
  stepsTemplate = stepsTemplate.replace(/^#.*$/mg, "").trim();
  stepsTemplate = stepsTemplate.replace(/.Arguments/g,`(datasource ".").Arguments`);
  stepsTemplate = stepsTemplate.replace(/\$\(/g,"(");

  console.info(chalk.underline.yellowBright("Input"));
  console.info(stepsTemplate);

  // create temporary file
  const tmpFile = ".tmp.json";
  fs.writeFileSync(tmpFile, stepsTemplate);

  // run gomplate on tmp file
  console.info("\n");
  console.info(chalk.underline.greenBright("Output"));

  shell.exec(`gomplate --file ${tmpFile} --left-delim='[[' --right-delim=']]' -d .=./data.json`,{
    cwd
  });
  // remove temporary file
  shell.exec(`rm ${tmpFile}`);
}

runGoTemplate();
console.info(chalk.whiteBright("\nWatching for changes"));
chokidar.watch(file).on('change', (event, path) => {
  console.info("\nWatching for changes");
  runGoTemplate();
});