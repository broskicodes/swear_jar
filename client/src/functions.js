import * as anchor from '@project-serum/anchor';
import 'dotenv/config';
import { web3, Provider, Program, BN } from '@project-serum/anchor';
import idl from '../idl/idl.json';

const provider = Provider.env();
anchor.setProvider(provider);
const program = new Program(idl, idl.metadata.address, provider);
let enc = new TextEncoder();  

export const sendCJTx = async () => {
  const [baseAccount, acntBump] = await getBaseAccountPDA();
  const [jar, jarBump] = await getJarPDA();

  const tx = await program.rpc.createJar(
    {
      accounts: {
        user: provider.wallet.publicKey,
        baseAccount,
        jar,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: []
    }
  );

  console.log(tx);
}

export const sendSwearTx = async (amnt) => {
  const [baseAccount, acntBump] = await getBaseAccountPDA();
  const [jar, jarBump] = await getJarPDA();

  const tx = await program.rpc.swear(new BN(amnt),
    {
      accounts: {
        user: provider.wallet.publicKey,
        baseAccount,
        jar,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: []
    }
  );

  console.log(tx);
}

export const sendRepentTx = async (pct) => {
  const [baseAccount, acntBump] = await getBaseAccountPDA();
  const [jar, jarBump] = await getJarPDA();

  const tx = await program.rpc.repent(jarBump, new BN(pct),
    {
      accounts: {
        user: provider.wallet.publicKey,
        jar: jar,
        baseAccount,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: []
    }
  );
  console.log(tx);
}

const getBaseAccountPDA = async () => {
  const [baseAccount, bump] = await web3.PublicKey.findProgramAddress(
    [
      enc.encode('base account'),
      program.programId.toBytes(),
    ],
    program.programId,
  );

  return [baseAccount, bump];
}

const getJarPDA = async () => {
  const [jar, bump] = await web3.PublicKey.findProgramAddress(
    [
      enc.encode('jar'),
      provider.wallet.publicKey.toBytes(),
      // program.programId.toBytes(),
    ],
    program.programId,
  );

  return [jar, bump];
}