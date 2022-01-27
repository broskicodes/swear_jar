use anchor_lang::prelude::*;
use solana_program;

pub mod error;
use error::*;

declare_id!("83LUtAjXJarg5wVPS7mqJny4p3ZPZtZmKAbh4sYECdAi");

#[program]
pub mod swear_jar {
  use super::*;
  pub fn initialize(ctx: Context<InitCtx>, min_bal: u64) -> ProgramResult {
    ctx.accounts.base_account.rent_exempt_bal = min_bal;

    Ok(())
  }
  pub fn swear(ctx: Context<TransferCtx>, lamports: u64) -> ProgramResult {
    let account_list = vec![
      ctx.accounts.user.to_account_info(),
      ctx.accounts.jar.to_account_info(),
    ];

    let transfer_instruction = solana_program::system_instruction::transfer(
      ctx.accounts.user.key,
      ctx.accounts.jar.key,
      lamports,
    );

    solana_program::program::invoke(
      &transfer_instruction,
      account_list.as_slice(),
    )?;

    Ok(())
  }

  pub fn repent(ctx: Context<TransferCtx>, bump: u8, percentage: u8) -> ProgramResult {
    if percentage > 100 {
      return Err(ErrorCode::InvalidPercentage.into());
    }
    let amount = ctx.accounts.jar.to_account_info().lamports();
    let bal = amount - ctx.accounts.base_account.rent_exempt_bal;

    let lamports = (bal * percentage as u64) / 100;
    let seeds = [b"jar", ctx.accounts.user.key.as_ref(), &[bump]];
    
    solana_program::program::invoke_signed(
      &solana_program::system_instruction::transfer(
        ctx.accounts.jar.key,
        ctx.accounts.user.key,
        lamports,
      ),
      vec![
        ctx.accounts.user.to_account_info(),
        ctx.accounts.jar.to_account_info(),
      ].as_slice(),
      &[&seeds],
    )?;

    Ok(())
  }
}

#[derive(Accounts)]
// #[instruction(bump: u8)]
pub struct InitCtx<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,
  #[account(
    init, payer = payer, space = 64,
    seeds = [b"base account".as_ref(), program_id.as_ref()], bump,
  )]
  pub base_account: Account<'info, BaseAccount>,
  #[account(address = solana_program::system_program::ID)]
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
// #[instruction(jar_bump: u8, account_bump: u8)]
pub struct TransferCtx<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(
    mut,
    seeds = [b"jar".as_ref(), user.key.as_ref()], bump,
  )]
  pub jar: UncheckedAccount<'info>,
  #[account(
    seeds = [b"base account".as_ref(), program_id.as_ref()], bump,
  )]
  pub base_account: Account<'info, BaseAccount>,
  #[account(address = solana_program::system_program::ID)]
  pub system_program: Program<'info, System>,
}

#[account]
pub struct BaseAccount {
  rent_exempt_bal: u64,
}
