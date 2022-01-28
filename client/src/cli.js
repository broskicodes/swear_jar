import arg from 'arg';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  sendSwearTx, 
  sendRepentTx,
  sendCJTx, 
} from './functions';

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

const parseOptions = async (opts) => {
  if(opts.help || opts.subCommand === undefined) {
    console.log("--Useful help message--");
    return;
  }

  if(opts.subCommand === "swear"){
    if(opts.param === undefined || opts.args.length > 2){
      badUsageMsg("Usage: sol-swear-jar swear <amount of sol to send> [OPTIONS]...");
      return;
    }
    
    let amnt = parseFloat(opts.param);
    
    if(Number.isNaN(amnt) || amnt < 0){
      console.error("Sol amount must be a positive number.");
      return;
    }

    amnt = opts.isLamports ? amnt : amnt * LAMPORTS_PER_SOL;

    await sendSwearTx(amnt);
  } else if(opts.subCommand === "repent"){
    if(opts.param === undefined || opts.args.length > 2){
      badUsageMsg("Usage: sol-swear-jar repent <percentage of jar to reclaim> [OPTIONS]...");
      return;
    }

    let pct = parseInt(opts.param);
    
    if(Number.isNaN(pct) || pct < 0 || pct > 100){
      console.error("Percentage must be number between 0 and 100");
      return;
    }

    await sendRepentTx(pct);
  } else if(opts.subCommand === "create-jar"){
    if(opts.args.length > 1){
      badUsageMsg("Usage: sol-swear-jar create-jar [OPTIONS]...");
      return;
    }

    try {
      await sendCJTx();
    } catch(err){
      console.error(err);
    }
  } else {
    badUsageMsg("Invalid sub-command.");
    return;
  }

}

export const cli = async (args) => {
  let options = parseArgumentsIntoOptions(args);
  await parseOptions(options);
  
  // console.log(options.args.length);
}

const badUsageMsg = (msg) => {
  console.error(msg);
  console.error("Try 'sol-swear-jar --help' for more information.");
}