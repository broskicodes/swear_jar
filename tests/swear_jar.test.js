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
  let bump = null;
  let jarNum = 7;
  
  it("inits", async () => {
    [jar, bump] = await web3.PublicKey.findProgramAddress(
      [
        enc.encode('jar'),
        provider.wallet.publicKey.toBytes(),
        enc.encode(jarNum.toString()),
        // program.programId.toBytes(),
      ],
      program.programId,
    );
  });
 

  it('Is initialized!', async () => {
    const recipient = web3.Keypair.generate();

    const tx = await program.rpc.initJar(bump, jarNum.toString(),
      {
        accounts: {
          user: provider.wallet.publicKey,
          jar: jar,
          systemProgram: web3.SystemProgram.programId,
        },
        // signers: [recipient]
      }
    );

    let acc = await program.account.swearJar.fetch(jar);
    assert.equal(acc.owner.toString(), provider.wallet.publicKey.toString());
  });

  it('transfers sol!', async () => {
    let bal1 = await provider.connection.getBalance(jar);

    const tx = await program.rpc.swear(new BN(1000),
      {
        accounts: {
          user: provider.wallet.publicKey,
          jar: jar,
          systemProgram: web3.SystemProgram.programId,
        },
        // signers: [recipient]
      }
    );

    let bal2 = await provider.connection.getBalance(jar);
    assert.equal(bal2 - bal1, 1000);
  });
});
