use anchor_lang::prelude::*;
use solana_program;

pub mod errors;
use errors::*;

declare_id!("83LUtAjXJarg5wVPS7mqJny4p3ZPZtZmKAbh4sYECdAi");

#[program]
pub mod swear_jar {
  use super::*;
  pub fn init_jar(ctx: Context<InitJar>, bump: u8, jar_num: String) -> ProgramResult {
    // let (address, expexted_bump) = Pubkey::find_program_address(
    //   &[b"jar", ctx.accounts.user.key.as_ref()],
    //   &ctx.program_id,
    // );

    // if address != *ctx.accounts.jar.key {
    //   return Err(ErrorCode::BadPDA.into());
    // }
    // if expexted_bump != bump {
    //   return Err(ErrorCode::BadBump.into());
    // }

    ctx.accounts.jar.owner = *ctx.accounts.user.key;

    Ok(())
  }

  pub fn swear(ctx: Context<Swear>, lamports: u64) -> ProgramResult {
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
}

#[derive(Accounts)]
#[instruction(bump: u8, jar_num: String)]
pub struct InitJar<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(
    init, payer = user, space = 64,
    seeds = [b"jar".as_ref(), user.key.as_ref(), jar_num.as_bytes()], bump = bump
  )]
  pub jar: Account<'info, SwearJar>,
  pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
pub struct Swear<'info> {
  #[account(mut)]
  pub user: Signer<'info>,
  #[account(mut)]
  pub jar: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
}

#[account]
pub struct SwearJar {
  pub owner: Pubkey,
}
