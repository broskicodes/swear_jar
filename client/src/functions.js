import * as anchor from '@project-serum/anchor';


export const sendSwearTx = (amnt) => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
}

export const sendRepentTx = (pct) => {
  console.log(pct + "% sorry");
}