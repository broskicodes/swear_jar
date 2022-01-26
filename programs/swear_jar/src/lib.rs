use anchor_lang::prelude::*;
use solana_program;

pub mod error;
use error::*;

declare_id!("83LUtAjXJarg5wVPS7mqJny4p3ZPZtZmKAbh4sYECdAi");

#[program]
pub mod swear_jar {
  use super::*;
  pub fn init_pool(
    ctx: Context<InitPool>,
    _jar_bump: u8, 
    _pool_bump: u8
  ) -> ProgramResult {
    let pool = &mut ctx.accounts.pool;

    pool.owner = *ctx.accounts.user.key;
    pool.jar = *ctx.accounts.jar.key;
    pool.opted_in = false;
    pool.recipients = None;
    pool.share = 0;

    Ok(())
  }

  pub fn update_pool(
    ctx: Context<UpdatePool>,
    _jar_bump: u8, 
    _pool_bump: u8
  ) -> ProgramResult {
    let pool = &mut *ctx.accounts.pool;

    pool.opted_in = true;
    pool.recipients = Some(vec![*ctx.accounts.user.key]);
    pool.share = 20;

    Ok(())
  }

  pub fn swear(ctx: Context<TransferCtx>, bump: u8, lamports: u64) -> ProgramResult {
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
    // let bal = amount - jar.min_bal;

    let lamports = (amount * percentage as u64) / 100;
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
#[instruction(jar_bump: u8, pool_bump: u8)]
pub struct InitPool<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(
    seeds = [b"jar".as_ref(), user.key.as_ref()], bump = jar_bump
  )]
  pub jar: UncheckedAccount<'info>,
  #[account(
    init, payer = user, space = 32 + 32 + 1 + 8 + 5 * 32,
    seeds = [b"pool".as_ref(), jar.key.as_ref(), user.key.as_ref()], bump = pool_bump
  )]
  pub pool: Account<'info, FundingPool>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(jar_bump: u8, pool_bump: u8)]
pub struct UpdatePool<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(
    seeds = [b"jar".as_ref(), user.key.as_ref()], bump = jar_bump
  )]
  pub jar: UncheckedAccount<'info>,
  #[account(
    mut,
    seeds = [b"pool".as_ref(), jar.key.as_ref(), user.key.as_ref()], bump = pool_bump
  )]
  pub pool: Account<'info, FundingPool>,
  // pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct TransferCtx<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(
    mut,
    seeds = [b"jar".as_ref(), user.key.as_ref()], bump = bump
  )]
  pub jar: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
pub struct FundingPool {
  pub owner: Pubkey,
  pub jar: Pubkey,
  pub recipients: Option<Vec<Pubkey>>,
  pub opted_in: bool,
  pub share: u8,
}

// #[account]
// pub struct BaseAccount