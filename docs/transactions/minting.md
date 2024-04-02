# [Transactions](README.md) / Minting Tokens and NFTs

## Introduction

Ethereum tokens, NFTs and other assets are concepts (in-memory balance sheets) created by developers on smart contracts, on Solidity code. The protocol itself does not know what these are. Only smart-contract code does.

On Cardano, one of the low level protocol features offered out-of-the-box is the concept of native assets. The protocol itself is self-aware of the balances and the available supply of tokens and NFTs, in the same fashion it's aware of it's coins.

Under same mindset of a limited set of transaction features is that Cardano provides a limited set of native asset features, out of the box. Basically you can send, mint and burn them. Three basic, but rock-solid native protocol features. 

On previous section we spent some tokens and NFTs to send them on a transaction output.

Now lets mint and burn them.

## Mint 101 and Burn 100 tokens

For minting new assets we must state what the minting policy will be, the rules that tells who can mint or burn assets and when this can be done in time. We need to stablish a law. A contract.

But for this we will not be using a fully featured on-chain executable logic or smart contract yet.

We will use what I like to call a "dumb contract" instead. Another protocol native feature, a very limited "smart contract" that consists of any combination of 6 possible instructions. But don't get me wrong, these are very powerful and so simple that are the most popular ones, and allowed a cambric explosion of early tokenomics on Cardano when Plutus Validators or "the smart-contracts" were not yet available. 

These "dumb contracts" are called native scripts. They can be used in the same fashion as smart contracts, to rule over several blockchain actions. 

On this example we will be using a self-sovereign user native script to rule over the minting policy of a token to mint and burn.

```js
{
    "type": "script",
    "title":"Mint 101 - Burn 100 tokens",
    "description":"In this example you will mint 101 tokens on a first transaction and on a second one you will burn 100",
    //notice that on this example we are only exporting data from last child block, not from this main block of code
    "run": {
        // this nested block will solve common data to be used later on, such as the native script
        "dependencies": {
            "type": "script",
            "run": {
                //this variable will hold the user's spending public key
                "issuer": {
                    "type": "getSpendingPublicKey"
                },
                //this variable will hold the built native script
                "mintingPolicy": {
                    "type": "nativeScript",
                    "script": {
                        //we only use the "pubKeyHashHex" instruction of native script "mini-language", 
                        //we dictate here a law that says the contract is valid only with a signature from the user's spending public key
                        //for this we provide the hash of the public key into the "pubKeyHashHex" instruction
                        "pubKeyHashHex": "{get('cache.dependencies.issuer.pubKeyHashHex')}"
                    }
                }
            }
        },
        //this nested block will build the minting transaction
        "buildMint": {
            "type": "buildTx",
            "name": "built-mint",
            "tx": {
                //using the "mints" feature we instruct the blockchain to mint or burn a list of native assets
                "mints": [
                    {
                        //policyId is the hash of the "dumb or smart contract" that rules over the minting of this native asset
                        "policyId": "{get('cache.dependencies.mintingPolicy.scriptHashHex')}",
                        //the list of assets to mint or burn using "policyId"
                        "assets": [
                            {
                                //every native asset has an "assetName" property, a string 
                                "assetName": "WillDieToken",
                                //and also a "quantity". If a positive number is provided we are minting new tokens  
                                "quantity": "100"
                            },
                            {
                                "assetName": "WillNotDieToken",
                                "quantity": "1"
                            }
                        ]
                    }
                ],
                //using the "witnesses" transaction feature we state that also a contract will be used to validate a part of this transaction
                "witnesses": {
                    // it can be a list of "nativeScripts" (dumb contracts) and of "plutusScripts"(smart contracts)
                    "nativeScripts": {
                        //here we pass the value of the built script, the CBOR structure of the script in hexadecimal encoding. 
                        "mintingPolicyScript": "{get('cache.dependencies.mintingPolicy.scriptHex')}"
                    }
                }
            }
        },
        "signMint": {
            "type": "signTxs",
            "namePattern": "signed-mint",
            "txs": [
                "{get('cache.buildMint.txHex')}"
            ],
            "detailedPermissions": false
        },
        "submitMint": {
            "type": "submitTxs",
            "namePattern": "submitted-mint",
            "txs": "{get('cache.signMint')}"
        },
        //this nested block will build the burning transaction
        "buildBurn": {
            "type": "buildTx",
            // note that instead of using title to save an on-chain transaction title, here we use "name" to put a label to transactions in local wallet storage
            "name": "built-burn",
            "tx": {
                "mints": [
                    {
                        "policyId": "{get('cache.dependencies.mintingPolicy.scriptHashHex')}",
                        "assets": [
                            {
                                "assetName": "WillDieToken",
                                //If a negative number is provided we are burning tokens from user's wallet balance  
                                "quantity": "-100"
                            }
                        ]
                    }
                ],
                "witnesses": {
                    "nativeScripts": {
                        "mintingPolicyScript": "{get('cache.dependencies.mintingPolicy.scriptHex')}"
                    }
                }
            }
        },
        "signBurn": {
            "type": "signTxs",
            "detailedPermissions": false
            "namePattern": "signed-burn",
            "txs": [
                "{get('cache.buildBurn.txHex')}"
            ],
        },
        "submitBurn": {
            "type": "submitTxs",
            "namePattern": "submitted-burn",
            "txs": "{get('cache.signBurn')}"
        },
        //only this last block will export data, in this case all it's solved children.
        //here we are exporting the transaction hashes plus other relevant data such as the native script itself
        "finally": {
            "type": "script",
            "exportAs": "MintAndBurn",
            "run": {
                "issuer": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.issuer.pubKeyHashHex')}"
                },
                "policyId": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.mintingPolicy.scriptHashHex')}"
                },
                "policyScript": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.mintingPolicy.scriptHex')}"
                },
                "mintTxHash": {
                    "type": "macro",
                    "run": "{get('cache.buildMint.txHash')}"
                },
                "burnTxHash": {
                    "type": "macro",
                    "run": "{get('cache.buildBurn.txHash')}"
                }
            }
        }
    }
}

```

So in conclusion, we first mint
- \+ 100x WillDieToken
- \+ 1x WillNotDieToken

and later on the same script we burn
- \- 100x WillDieToken

This means that if you ran the script, if you check your balance you should have only 
- 1x WillNotDieToken


## Minting 1 NFT

"What's the main difference between a token and an NFT?"

Well, NFTs are Non Fungible Tokens, tokens that are not divisible for quantification or for sending.

It's not enough to only mint 1 unit of a native asset to consider it an NFT, because how can you provide assurance that no new native assets of the same kind will ever be minted again? 

For that matter is important to rule over the minting policy to not only restrict "who" can mint but also "when" can do so. If we make a rule that says that no more native assets will be ever minted again starting from today, and today only 1 unit was minted, we can say we have created an *NFT minting policy*

Also NFTs are just that, an asset kind and a supplied quantity of 1 unit. They can be used to represent a user on a game, a deed of a house, song rights from an artist, an entire GCFS file system, or also the most popular kind: on-chain references to images of cool cyberpunks from Disco Solaris, cute astronauts, ugly monkeys or clays.

On Cardano, the most popular standard to create Image (or media) NFTs is the [CIP 25](https://cips.cardano.org/cip/CIP-25/) specification. It combines 2 simple Cardano native features to work: `mints` and `auxiliaryData` or metadata. 

Once again, everything on Cardano is a combination of native, rock-solid, building-block features.


Let's mint 1 NFT!

```js
{
    "type": "script",
    "title": "NFT Minting Demo",
    "description": "Example that creates a native script and uses it as policy to mint an NFT. Image has been previously uploaded and pinned on IPFS",
    "exportAs": "NFTMinting",
    "return": {
        "mode": "last"
    },
    "run": {
        // this nested block will solve common data to be used later on, such as the native script design
        "dependencies": {
            "type": "script",
            "run": {
                //another way of getting a spending (or staking) key hash is by decoding a user's address
                //so first lets get the address
                "address": {
                    "type": "getCurrentAddress"
                },
                //now lets parse it to later use the resulting "paymentKeyHash" property
                "addressInfo": {
                    "type": "macro",
                    "run": "{getAddressInfo(get('cache.dependencies.address'))}"
                },
                //lets define an native asset name as a constant
                "assetName": {
                    "type": "data",
                    "value": "GameChangerNFT"
                },
                //the minimum time unit on Cardano blockchain is a slot, it equals to a second
                //lets retrieve the latest time reported on-chain, the "now" time
                "currentSlotNumber": {
                    "type": "getCurrentSlot"
                },
                //now lets use a macro to add to the "now" time a time window, like 24 hours (86400 seconds)
                //this new time value will get stored on this variable
                "deadlineSlotNumber": {
                    "type": "macro",
                    "run": "{addBigNum(get('cache.dependencies.currentSlotNumber'),'86400')}"
                },
                //now lets design our NFT minting policy script
                //a native script that will be valid only if 
                //      the user's public spending key is used
                //      and
                //      if the transaction takes place before the calculated "deadlineSlotNumber"
                "mintingPolicy": {
                    "type": "nativeScript",
                    "script": {
                        //the all instruction is valid when all sub instructions are valid
                        "all": {
                            // the "pubKeyHashHex" instruction is valid when the transaction gets signed using this key
                            "issuer": {
                                "pubKeyHashHex": "{get('cache.dependencies.addressInfo.paymentKeyHash')}"
                            },
                            // the "slotNumEnd" instruction is valid when the transaction takes place before the provided slot time
                            "timeLock": {
                                "slotNumEnd": "{get('cache.dependencies.deadlineSlotNumber')}"
                            }
                        }
                    }
                }
            }
        },
        "build": {
            "type": "buildTx",
            "name": "built-NFTMint",
            "title": "NFT Minting Demo",
            "tx": {
                //when time validations take place, we add a time-to-live "ttl" property on transaction body
                "ttl": {
                    "until": "{get('cache.dependencies.deadlineSlotNumber')}"
                },
                "mints": [
                    {
                        //here we use the native script hash as policyId for the NFT
                        "policyId": "{get('cache.dependencies.mintingPolicy.scriptHashHex')}",
                        "assets": [
                            {
                                //here we use the previously stored constant as asset name for the NFT
                                "assetName": "{get('cache.dependencies.assetName')}",
                                //and of course, we use a quantity of 1. 
                                "quantity": "1"
                            }
                        ]
                    }
                ],
                //using the "witnesses" transaction feature we state that also a contract will be used to validate a part of this transaction, the minting feature more specifically in this case
                "witnesses": {
                    "nativeScripts": {
                        //here we provide the built native script
                        "mintingScript": "{get('cache.dependencies.mintingPolicy.scriptHex')}"
                    }
                },
                //and here is where we use metadata following the CIP25 standard to add the NFT information 
                //this data will be used in-wallet and on other services and explorers to render the asset properly
                //notice how we provide the assetName and policyId values using Inline Scripting
                "auxiliaryData": {
                    "721": {
                        "{get('cache.dependencies.mintingPolicy.scriptHashHex')}": {
                            "{get('cache.dependencies.assetName')}": {
                                "url": "https://gamechanger.finance",
                                "name": "{get('cache.dependencies.assetName')}",
                                "description": "Only 1 unit was minted",
                                "author": "GameChanger Wallet",
                                // this is the most important part: the reference to the image file stored somewhere
                                "image": "ipfs://QmVWGxAKpB2Sxy3ZnfZsdt3gxocFEUUe8GPBcraLTZSQKT",
                                "version": "1.0",
                                "mediaType": "image/png",
                            }
                        }
                    }
                }
            }
        },
        "sign": {
            "type": "signTxs",
            "namePattern": "signed-NFTMint",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        "submit": {
            "type": "submitTxs",
            "namePattern": "submitted-NFTMint",
            "txs": "{get('cache.sign')}"
        },
        "finally": {
            "type": "script",
            "run": {
                "txHash": {
                    "type": "macro",
                    "run": "{get('cache.build.txHash')}"
                },
                "assetName": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.assetName')}"
                },
                "policyId": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.mintingPolicy.scriptHashHex')}"
                },
                "canMintUntilSlotNumber": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.deadlineSlotNumber')}"
                },
                "mintingScript": {
                    "type": "macro",
                    "run": "{get('cache.dependencies.mintingPolicy.scriptHex')}"
                }
            }
        }
    }
}

```

# Contracts or Validators?

Now you know how to create your own native scripts, or "dumb contracts".

In Cardano, we don't like to say contracts too much because that's not technically accurate. Here we are not running extensive on-chain program logic, but rather pre-baking transactions off-chain and only running a tiny portion of them on-chain: the transaction witnesses that are either native scripts or plutus scripts. These are small pieces of validation logic that runs on-chain. Not like in Ethereum where entire Solidity code runs on-chain. This brings us huge scaling, cost, performance and reliability benefits.

Let's now jump to the next section to level up from "dumb" to "smart" ~~contracts~~ validators: Plutus Scripts

Previous: [Payments](payments.md) | Next: [Smart Contracts](smart-contracts.md)