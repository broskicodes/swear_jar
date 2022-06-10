CURRENTLY ONLY ON DEVNET!

The Sol Swear Jar is an on-chain program that essentially functions just like a swear jar. It lets you put $SOL into the jar, then also allows you to take that $SOL out.

Money put into the jar is stored in a PDA with seed: ['jar', user.pubkey], so that only a jar's creater is able to interact with it through the program. This also means that each user can only interact with one jar. However, since a jar is simply a Solana account, it is possible for anyone to send $SOL to any jar with a simple transfer transaction.

This program was really just a way for me to experiment with Solana account PDAs and $SOL transfers. Currently, there is no real purpose for this program other than a seperate account to store $SOL (say to make it one step harder for you to ape into the next NFT). I have ideas to extend this in the future, but they are not fully formed.
    
I believe that this program is secure in that there SHOULD be no way for anyone one other than the creator of a jar to recover the funds. However, this program is not audited, so use at your own risk.

Side note: this program is in early stages. Whlie I believe program functionality works as intended, if you do something that is unintended (like calling create-jar twice for the same user), expect to see an ugly error message.

P.S.: This program was only tested on Linux Ubuntu. Be wary if using with a differnt OS.