const anchor = require('@project-serum/anchor');
const { assert } = require('chai');

const { BN, web3 } = anchor;

// const jarProgramAddress = new web3.PublicKey("83LUtAjXJarg5wVPS7mqJny4p3ZPZtZmKAbh4sYECdAi");

describe('swear_jar', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SwearJar;

  let enc = new TextEncoder();  
  let jar = null;
  let jarBump = null;
  let baseAccount = null;
  let acntBump = null;
  
  const user = web3.Keypair.generate();
  
  it("setups vars", async () => {
    let aTx = await provider.connection.requestAirdrop(user.publicKey, 0.5 * web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(aTx);
    
    [jar, jarBump] = await web3.PublicKey.findProgramAddress(
      [
        enc.encode('jar'),
        user.publicKey.toBytes(),
        // program.programId.toBytes(),
      ],
      program.programId,
    );

    [baseAccount, acntBump] = await web3.PublicKey.findProgramAddress(
      [
        enc.encode('base account'),
        program.programId.toBytes(),
      ],
      program.programId,
    );
  });

  // it('inits base account!', async () => {
  //   let amnt = await provider.connection.getMinimumBalanceForRentExemption(0);
  //   const tx = await program.rpc.initialize(acntBump, new BN(amnt),
  //     {
  //       accounts: {
  //         payer: provider.wallet.publicKey,
  //         baseAccount,
  //         systemProgram: web3.SystemProgram.programId,
  //       },
  //       signers: []
  //     }
  //   );

  //   let acnt = program.account.baseAccount.fetch(baseAccount);

  //   assert.equal(acnt.rentExemptBal, amnt);
  // });

  it('inits jar!', async () => {
    let bal1 = await provider.connection.getBalance(jar);

    let amnt = await provider.connection.getMinimumBalanceForRentExemption(0);
    const tx = await program.rpc.swear(new BN(amnt),
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          baseAccount,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );

    let bal2 = await provider.connection.getBalance(jar);

    // console.log(jar.toString());
    assert.equal(bal2 - bal1, amnt);
  });

  it('swears!', async () => {
    let bal1 = await provider.connection.getBalance(jar);

    let amnt = 1000000;
    const tx = await program.rpc.swear(new BN(amnt),
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          baseAccount,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );
    // console.log(tx);

    let bal2 = await provider.connection.getBalance(jar);

    assert.equal(bal2 - bal1, amnt);
  });

  it('repents!', async () => {
    // let user = web3.Keypair.generate();
    let bal1 = await provider.connection.getBalance(jar);
    let amnt = await provider.connection.getMinimumBalanceForRentExemption(0);
    bal1 = bal1 - amnt;

    const tx = await program.rpc.repent(jarBump, new BN(20),
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          baseAccount,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );
    // console.log(tx);

    let bal2 = await provider.connection.getBalance(jar);

    assert.equal(bal1 - Math.floor(bal1 * 20 / 100) + amnt, bal2);
  });
});
