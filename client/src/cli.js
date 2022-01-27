import arg from 'arg';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { sendSwearTx, sendRepentTx } from './functions';

const parseArgumentsIntoOptions = (rawArgs) => {
  const args = arg(
    {
      "--lamports": Boolean,
      "--help": Boolean,
      "--yes": Boolean,
      "-l": "--lamports",
      "-h": "--help",
      "-y": "--yes",
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  // console.log(args);
  return {
    subCommand: args._[0],
    param: args._[1],
    isLamports: args["--lamports"] || false,
    help: args["--help"] || false,
    verify: !args["--yes"],
    args: args._,
  };
}

const parseOptions = (opts) => {
  if(opts.help || opts.subCommand === undefined) {
    console.log("--Useful help message--");
    return;
  }

  if(opts.subCommand === "swear"){
    if(opts.param === undefined || opts.args.length > 2){
      console.error("Usage: sol-swear-jar swear <amount of sol to send> [OPTIONS]...");
      console.error("Try 'sol-swear-jar --help' for more information.");

      return;
    }
    
    let amnt = parseInt(opts.param);
    
    if(Number.isNaN(amnt) || amnt < 0){
      console.error("Sol amount must be a positive integer.");
      return;
    }

    amnt = opts.isLamports ? amnt : amnt * LAMPORTS_PER_SOL;
    sendSwearTx(amnt);
  } else if(opts.subCommand === "repent"){
    if(opts.param === undefined || opts.args.length > 2){
      console.error("Usage: sol-swear-jar repent <percentage of jar to reclaim> [OPTIONS]...");
      console.error("Try 'sol-swear-jar --help' for more information.");

      return;
    }

    let pct = parseInt(opts.param);
    
    if(Number.isNaN(pct) || pct < 0 || pct > 100){
      console.error("Percentage must be number between 0 and 100");
      return;
    }

    sendRepentTx(pct);
  } else {
    console.error("Invalid sub-command.");
    console.error("Try 'sol-swear-jar --help' for more information.");
    return;
  }

}

export const cli = (args) => {
  let options = parseArgumentsIntoOptions(args);
  parseOptions(options);
  
  // console.log(options.args.length);
}