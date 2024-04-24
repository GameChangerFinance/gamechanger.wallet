# [Workspaces](README.md) / Overview

## Introduction

### "What is a **wallet**?"

You can think of a wallet as a locker in an *almost* infinitely big storage room filled with lockers. Each locker:

- it has a unique locker ID (public)
- it has a unique key (private) that opens it 
    - each key has a unique (public) key ID
- stores things only owned by anyone having 
    - the right (private) key
    - knowing the locker ID (public)

So we can say about wallets that:
- a wallet is like a locker
- a wallet address is like the unique locker ID
- a private key is like the unique key that opens the locker
- a public key is like the ID of the unique key that opens the locker
- a personal account is a numbered section of the storage room where you own all the keys to all it's lockers
- a multisig wallet is special locker that only opens if a group of keys is used at the same time
    - some keys you own
    - some keys others may own
    - some keys that are special keys
        - that can be triggered or expire in time
        - that can be smart and work based on some programmable logic combining other kind of keys
- new wallets are not created, but *located by address* and *owned by private keys*, in the same way all possible lockers already exist on the storage room and only knowing the right ID and having the right key allows you to manage and own it's contents.


We can say wallet software is like an accountant that keeps track of all the sections you own on this big storage room
- the wallet software is non-custodial if only you know the private keys, not it.
- the wallet software is custodial if it knows the private keys
- some accountants like to keep track of locker keys based different sequences of keys. In wallets this is called key derivation scheme, and there are several standards that define these schemes. 
    - when using only one private key, usually the first one, we say it's a *single address wallet*, or a *single address mode*
    - when using an incremental sequence of private keys we may be referring to a *hierarchical deterministic wallet*
    - *hierarchical deterministic wallets* has weak spots like
        - it mixes locker balances every time you move a single coin, making it a nightmare for keeping individual wallet records
        - in Cardano it breaks the intended anonymity as all addresses, lockers, are identifiable as yours at plain sight    
    - when dealing with multisig wallets or script based wallets there are no popular standards involved
    - accountants don't like to work with each other, making all these options incompatible across wallet implementations
    - usually accountants are amnesic, wallets care only for managing keys but not remembering locker IDs, wallet addresses,this may lead to loss of funds

As you may see accounting on the big storage room can get messy, and depends a lot on your accounting tastes or needs, this is why GameChanger Wallet created the concept of *Workspaces*...  

### Workspaces

*Workspaces* are groups of different accounting tastes on a single software wallet, making them compatible and interoperable with each other and with dapps while giving users total control, auditability, backup and sharing options for setup recovery on all devices and across different wallet types. 

Instead of forcing you to follow one standard or another, you can follow them all, or even none, as you are free to design the accounting setup you need, the one you may not find on any other software wallet.

More specifically a *Workspace* is a group of wallet items or *artifacts* tagged under the same workspace id or namespace. 

### Artifacts 

These *artifacts* are the actual building blocks of *workspaces*
- keys
- addresses
- native scripts
- artifact names 
- and more...

These items
- have a unique id (hash) that makes them irreplaceable
- can have one or more human-friendly names can be attached to them
- can belong to several workspaces at the same time
- hold within themselves a recipe on how to re-create them again
- recipes are composable, relating artifacts with each other dynamically (by name or other dynamic properties) or statically (by hash, or constant value)  
- are *wallet agnostic*: the same (dynamically designed) recipe executed on my wallet will produce same former artifact but a different one if executed on your wallet

All these properties allows you to **audit, modify, backup, share or recover any artifact created on your wallet**   

*With our Workspaces you will be owning your keys, **fully and freely**.*

Previous: [Workspaces](README.md) | Next: [Quick Start](quick-start.md)