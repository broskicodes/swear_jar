import arg from 'arg';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
// import execa from 'execa';
import { 
  sendSwearTx, 
  sendRepentTx,
  sendCJTx, 
} from './anchor';

const parseArgumentsIntoOptions = (rawArgs) => {
  const args = arg(
    {
      "--lamports": Boolean,
      "--help": Boolean,
      // "--yes": Boolean,
      "-l": "--lamports",
      "-h": "--help",
      // "-y": "--yes",
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
    // verify: !args["--yes"],
    args: args._,
  };
}

const parseOptions = async (opts) => {
  if(opts.help || opts.subCommand === undefined) {
    displayHelp();
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

// const createDotEnv = async () => {
//   const result = await execa('touch', ['.env'])
// }

const displayHelp = () => {
  console.log("I HIGHLY recomment you view the description of this program on https://github.com/nibbus0x/swear_jar in the README.md. Or call the 'description' command\n");
  console.log(`Commands: 
    - create-jar: Funds the user's jar account with enough lamports to make it rent-exempt. Must be done before any other interaction, and can only be done once per user.
    - swear: Requires an <amount> parameter. Transfers <amount> of $SOL (or lamports, see options) from the user's bal account to their jar. <amount> denomination defaults to $SOL.
    - repent: Requires a <percentage> parameter. Transfers (account balance - rent exempt balance) * <percentage> lamports back to the user's account.
    - description: displays the project description. The same can be viewed on Github.

  Options:
    - -h (--help): view this message
    - -l (--lamports): When used with the swear command changes the <amount> denomination to lamports.
  `)
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