use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
  #[msg("Jar account does not match required PDA")]
  BadPDA,
  #[msg("Bump does not match")]
  BadBump,
  #[msg("Invalid percentage")]
  InvalidPercentage,
}