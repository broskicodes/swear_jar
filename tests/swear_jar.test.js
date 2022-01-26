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

  const user = web3.Keypair.generate();
  
  it("inits", async () => {
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
  });

  it('swears!', async () => {
    let bal1 = await provider.connection.getBalance(jar);
    let balu = await provider.connection.getBalance(user.publicKey);


    const tx = await program.rpc.swear(jarBump, new BN(10000),
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );
    // console.log(tx);

    let bal2 = await provider.connection.getBalance(jar);
    let baluu = await provider.connection.getBalance(user.publicKey);

    console.log(balu - baluu);
    assert.equal(bal2 - bal1, 10000);
  });

  it('repents!', async () => {
    // let user = web3.Keypair.generate();
    let bal1 = await provider.connection.getBalance(jar);


    const tx = await program.rpc.repent(jarBump, new BN(20),
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );
    console.log(tx);

    let bal2 = await provider.connection.getBalance(jar);

    assert.equal(bal1 - Math.floor(bal1 * 20 / 100), bal2);
  });
});
