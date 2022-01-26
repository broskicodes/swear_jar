const anchor = require('@project-serum/anchor');
const { assert } = require('chai');

const { BN, web3 } = anchor;

const JAR_SIZE = 64 + 8;

describe('swear_jar', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SwearJar;

  let enc = new TextEncoder();  
  let jar = null;
  let pool = null;
  let jarBump = null;
  let poolBump = null;


  const user = web3.Keypair.generate();
  
  it("inits", async () => {
    let res = await provider.connection.requestAirdrop(user.publicKey, 0.5 * web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(res);
    // console.log(res);
    [jar, jarBump] = await web3.PublicKey.findProgramAddress(
      [
        enc.encode('jar'),
        user.publicKey.toBytes(),
        // program.programId.toBytes(),
      ],
      program.programId,
    );

    [pool, poolBump] = await web3.PublicKey.findProgramAddress(
      [
        enc.encode('pool'),
        jar.toBytes(),
        user.publicKey.toBytes(),
        // program.programId.toBytes(),
      ],
      program.programId,
    );
  });
 

  it('Is initialized!', async () => {
    // const minBal = await provider.connection.getMinimumBalanceForRentExemption(JAR_SIZE)

    const tx = await program.rpc.initPool(jarBump, poolBump,
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          pool: pool,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );

    await program.rpc.updatePool(jarBump, poolBump,
      {
        accounts: {
          user: user.publicKey,
          jar: jar,
          pool: pool,
          // systemProgram: web3.SystemProgram.programId,
        },
        signers: [user]
      }
    );

    let acc = await program.account.fundingPool.fetch(pool);
    assert.equal(acc.owner.toString(), user.publicKey.toString());
  });

  it('transfers sol!', async () => {
    let bal1 = await provider.connection.getBalance(jar);

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
    assert.equal(bal2 - bal1, 10000);
  });

  it('sends sol!', async () => {
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