CURRENTLY ONLY ON DEVNET!

The Sol Swear Jar is an on-chain program that essentially functions just like a swear jar. It lets you put sol into the jar, then also allows you to take that sol out.

Money put into the jar is stored in a PDA with seed: ['jar', user.pubkey], so that only a jar's creater is able to interact with it through the program. However, since a jar is simply a Solana account, it is possible for anyone to send sol to any jar with a simple transfer transaction.

Currently, there is no real purpose for this program other than a seperate account to store sol. I have ideas to extend this in the future, but they are not fully formed.
    
I believe that this program is secure in that there SHOULD be no way for anyone one other than the creator of a jar to recover the funds. However, this program is not audited, so use at your own risk.

