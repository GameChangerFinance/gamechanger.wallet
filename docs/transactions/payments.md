# [Transactions](README.md) / Payments

## Introduction

While we are not going to cover in detail the Cardano eUTXO model, you must know the basics: 

*Your wallet balance is a sum of outputs someone else or you have previously sent to your address.*

Every time you make a payment to another wallet you are sending groups of coins and native assets (tokens, NFTs,etc..) from previous outputs sent to your wallet (eUTXOs) to another address, while often sending some other outputs back to yourself as well (change outputs). The transaction feature that allow you to move assets from one wallet address to another is called `outputs`.

Also on Cardano we can store arbitrary data, and if you store it using one of many standardized formats you can interact with different applications, services, smart contracts and protocols. One of the kinds of arbitrary data you can use on a transaction is called metadata, or `auxiliaryData`.

So in this section the native transaction features we will be using are `outputs` and `auxiliaryData`.

## One output

In GameChanger we define an asset through the `assetName` and `policyId` properties.
- When `assetName` and `policyId` values are `"ada"` we are referring to the coin of the network, ADA for Mainnet and tADA or TestAda for Pre-Production Testnet networks.
- When `assetName` and `policyId` values are different than `"ada"` we are referring to a native asset. To know which type, if token, or NFT or any other, this information is not enough and you may need to query and process that information from the chain. GameChanger wallet will tell you this information on the user interface.
- For ADA/tADA we work with it's minimum unit, *a lovelace*, and `1,000,000 lovelaces = 1 ADA/tADA` 

Finally, remember that to send assets to a wallet you need to know it's `address`.


Here is a minimal example of just 1 output of 1 tADA to 1 address.

```js
{
    "type": "script",
    "run": {
        // we craft the off-line transaction, an hexadecimal structure (CBOR)
        "build":{
            "type": "buildTx",
            "tx": {
                //This is the list of transaction outputs
                //"whom" to send to, "how much" to send and "what" to send
                "outputs": [
                    {
                        "address":"addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
                        "assets": [{ 
                            "policyId": "ada", 
                            "assetName": "ada", 
                            // we ALWAYS work with BigNum, lovelace amounts can get so big that is safer to express them as text
                            "quantity": "1000000" 
                        }]
                    }
                ]
            }
        },
        // we ask the user to sign the transaction hexadecimal CBOR with all the available and required private keys
        "sign":{
            "type": "signTxs",
            // everything on GCScript is based on deterministic permissions,
            // but transactions may require different inputs (UTXOs) when built
            // so on these cases we cannot promise a set of permissions upfront  
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        // until now this point the transaction is like a signed-check non-handed to anybody. Let's now go "for real"
        // once the CBOR carries the embedded signatures or key witnesses, then we can deliver it to a Cardano Node to go on-chain
        "submit":{
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        }
    }
}

```
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA1WPwU7DMAyG38WXgTRNrICY9gRwQRx2QxPKGrdLlaZt7KyJqrw7SRhoJIf8_m1_jhfgMCLsgWqrRoY1WGdgv8DJKS2zuOZLfPCpgH22B8ejY4L95wJCSouUdFFfjMTbi71UfagfO3yeXhrfGNF1bfc0mWDOctxVloI2XaX7XRAz0zy36U10QYRX7DhoVYc3WbjiN_cuevxzJicMKw7J2D6UA_GYblwDqdbc_D-HB0-pRyILpVF-oO0VkRpMGtcITZh3y6NhaZHvVrWoz7gpi2_Yv6Jf3Uc4ZrQ79Ypv4cX4wRfEP0IenVtjjN-p5FpEbwEAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[buildTx](https://beta-wallet.gamechanger.finance/doc/api/v2/buildTx.html),
[signTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/signTxs.html),
[submitTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/submitTxs.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

When the script runs on a user's wallet, a transaction with one outgoing output will be built, require to be signed through wallet user interface and submitted to the blockchain.

Users will be spending 1 tADA from the output + around 0.18 tADA for network fees. The bigger in bytes the transaction gets, bigger will be the fee.

Important: 
>The fees, the outputs, everything is written in stone, once signed and submitted **it will not spend more nor less funds from a user balance randomly or by any means**. This is why we say Cardano transactions are deterministic.

## Multiple outputs

Here is an example for making a payment to 6 addresses on a single transaction, using GCScript arguments and inline scripting (ISL) for convenience, and this time exporting the transaction hash (the unique ID of transactions that can be used later for checking their status on the chain).


```js
{
    "type": "script",
    "title": "🚀 6-in-1 Payment",
    "description": "This is a payment request to send 1 tADA to 6 different addresses on a single transaction",
    "args":{
        "addressA": "addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
        "addressB": "addr_test1vrp4jqn97fg7ucmhpsncfm87hcg3h788alzfpapme9yyj9cvlh24z",
        "addressC": "addr_test1vpzmm2ffh9qjcvckw8sg5v9ekfkkn5uw4u9le8avhvtprxg9zqwll",
        "addressD": "addr_test1vz4nsqaw9hnlzzqaersvwldxr2me4s20qw56uax04fnk22c25mjz7",
        "addressE": "addr_test1vzqtssvqusv2qp8tchw0hsyvzp7k0unp0h0w2y9n2m3dxxs6w79am",
        "addressF": "addr_test1vqqj3qgy50d26lv7kzqlyc6s4qr343694nd9wckkq9vf5ygfalzy8"
    },
    "exportAs": "multiPayment",
    "return": {
        "mode": "last"
    },
    "run": {
        "assetsToSend":{
            "type":"data",
            "value":[
                {
                    "policyId": "ada",
                    "assetName": "ada",
                    "quantity": "1000000"
                }
            ]
        },
        "build": {
            "type": "buildTx",
            "title": "🚀 6-in-1 Payment",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressA')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressB')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressC')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressD')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressE')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressF')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
        "sign": {
            "type": "signTxs",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        "submit": {
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        },
        "results": {
            "type": "macro",
            "run": {
                "txHash":"{get('cache.build.txHash')}"
            }
        }
    }
}

```
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA62UyW7bMBCGX0XQJS3gBLIsW1Juzob2UgSob0VQMBS1kpTIoRbKMNDn6KWv2EcoKSexnUOLAhYESDOc-YbLP9y6SjfEvXYBy6JR7sxVhaLW8fvXzx_O6rLgl3PnEWlGuB1NyD6wqLmJ2eQFOOZFTrOPcCQRLQHlqNoBwhNn7qj13dqaKycp0pRIG4WSRBIAAk7NTTIUPKPEURJxQHhiz1wkM3Cvt-5L7NqUs7_flcHPO9n5TONFSZYiTIeUo7LMykBwzfOkiXwJmvLSpyzSqFfQ95n5WugedvMO1gSl4HGYZmGLWd4AxymLwhxnizyMIkTHtEENI7HWZYw7mvvBeIDdnsKakTE_TfNYlLjDVR9BtuxiUqVVxZdtH7QxJRHq8k41csjiUfSUHmB3p7Ax4CBQH-ecjqNARELX02SQPiMB-J7ol6sWDV6Q8sr3sb9k5RgeYPfvYEIBdKKFzhdNpHDeeznobmzCymt54-Ve7-uY-2yRDAOs-jBG7AB7OIUJUS5Eppde4q9oF1ajoBqvIBByESxWccCTuMdVJeIuXeosNXuoI3c3c8nQ1FKtzdG6rKWqOEhLEtVKbo-c1YlVIEWgbIpsJy8yglGwqb8aXVn7RbgJUshkd4i2xvy2dZuaFlh_Tqb52qEp8Qti5M0jWsSNzrVxzL3pcXdPptJzW9Bj9mRvhn92hRpsUt2qplUwTeJl00zGNiPqw4VV89WrlC8-7l6ndYjACOfk6niRNmw3-zvr5oys2zOy7s7Iuj8j6-F_WE87owkoMn4kCWtuBpiuQoUKSpJHIlkBYG4tAzRCB2IFYWVwQp-0dKWGT2SwcCs3aJ9ZoY7hk2OPnxAnBFt6v0bTK2CaB45SGcKydt-axdRBkL8DvE3BDE0g8_wBpXLyDwEGAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[buildTx](https://beta-wallet.gamechanger.finance/doc/api/v2/buildTx.html),
[signTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/signTxs.html),
[submitTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/submitTxs.html),
[macro](https://beta-wallet.gamechanger.finance/doc/api/v2/macro.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

When the script runs on a user's wallet, the transaction will be built, signed and submitted, the script will return something like this:

```json
{
  "exports": {
    "multiPayment": {
      "txHash": "2ced21a5f6a978d3e95e14828f0bd974082cbc9c34c366b3b784214910ca40e4"
    }
  }
}
```

As you can see, there is no coin selection being done by the developer here (cherry-picking which UTXOs to consume to build the new transaction), nor the change output design (the calculation of which values you are not spending on the transaction that you need to send back to your wallet). This is because by default *coin selection* and *change output optimization* are taken care by GameChanger Wallet itself, nor by users delegating them complicate tasks like late-fixing their own wallets, nor by dapps letting them hold the power to damage user wallets with unhealthy eUTXO management. *This is the GameChanger Wallet way*. 

If you want to consume an specific eUTXO you can do it by specifying it on the `inputs` property, also coin selection and change optimization can be customized or disabled using the `options` property.

## Outputs + Auxiliary Data

You didn't notice that you already used metadata on the previous example.

When we included the `title` property on the `buildTx` function we instructed the wallet to use *a metadata specification for attaching a title to the transaction that will be rendered on the wallet user interface*. A title text that is now stored forever on your transaction on Cardano blockchain.

Let's send a unique message to the 6 addresses using CIP-20, a well known message over metadata specification or protocol.

```js
{
    "type": "script",
    "title": "🚀 6-in-1 Payment",
    "description": "This is a payment request to send 1 tADA to 6 different addresses on a single transaction",
    "args":{
        "addressA": "addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
        "addressB": "addr_test1vrp4jqn97fg7ucmhpsncfm87hcg3h788alzfpapme9yyj9cvlh24z",
        "addressC": "addr_test1vpzmm2ffh9qjcvckw8sg5v9ekfkkn5uw4u9le8avhvtprxg9zqwll",
        "addressD": "addr_test1vz4nsqaw9hnlzzqaersvwldxr2me4s20qw56uax04fnk22c25mjz7",
        "addressE": "addr_test1vzqtssvqusv2qp8tchw0hsyvzp7k0unp0h0w2y9n2m3dxxs6w79am",
        "addressF": "addr_test1vqqj3qgy50d26lv7kzqlyc6s4qr343694nd9wckkq9vf5ygfalzy8"
    },
    "exportAs": "multiPayment",
    "return": {
        "mode": "last"
    },
    "run": {
        "assetsToSend":{
            "type":"data",
            "value":[
                {
                    "policyId": "ada",
                    "assetName": "ada",
                    "quantity": "1000000"
                }
            ]
        },
        "build": {
            "type": "buildTx",
            "title": "🚀 6-in-1 Payment",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressA')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressB')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressC')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressD')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressE')}",
                        "assets":"{get('cache.assetsToSend')}"
                    },
                    {
                        "address":"{get('args.addressF')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ],
                "auxiliaryData": {
                    "674": {
                        "msg": [
                            "Created with GameChanger Wallet API. CIP-20 message ahead\n",
                            "Invoice-No: 1234567890\n",
                            "Customer-No: 555-1234\n",
                            "P.S.1: i will shop again at your store :-) ",
                            "I find you very sexy, what's your Cardano address? ;-)"
                        ]
                    }
                }
            }
        },
        "sign": {
            "type": "signTxs",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        "submit": {
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        },
        "results": {
            "type": "macro",
            "run": {
                "txHash":"{get('cache.build.txHash')}"
            }
        }
    }
}

```
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA62VzW7jNhDHX4XQJQ1gG7IsWZJ7KLzObpvLwsAG2EMbFFyJkiiTlMShPqjAwD5HL33FfYSSchLbObQoEMKATM7MbyjyP6MnR-maOBsHEklr5cwcRRWzCz_-_us7Ws-pmC_RHmtOhLWm5ORIK2F8HgoKyPwwqk8eSJKmJaCQqhAQkaIlUtu7rZ2uUUqzjEjrhdNUEgACqBImGKjIGUFKYgE4mdgzB8scnM2T8-y7Nens3z-VwS872XlcJ6uSBE2YDZnAZZmXfiO0KNI68iRoJkqP8UjjXkHf5-ZpoSfYhzew2i8bEYdZHrYJL2oQScajsEjyVRFGEWZjVuOak1jrMk46Vnj-eIbtrmH1yLmXZUXclEmXHPoI8qCLySE7HETQ9n4bMxLhruhULYc8HpuesTPs7ho2-gIa3MeFYOPYYCKh61k6SI8THzy36YN1iwfXz8TB8xIv4OUYnmEf38AaBdA1LXReU0cqKXq3AN2NdXhwW1G7hdt7OhYeX6XDAOs-jDE_wz5dw5qmXDW5DtzUW7MuPIwN08ka_Eau_NU69kUa98nh0MRdFug8M2eoI-c4c8hQV1JtzdU6vGWKnqUliWqlsFfOq9QqkGFQNkS20yo2glHwUH0xurLzZ-GmWGET3WHWmunvT05dMZro-3TarzVNgZ8xJ68rTYuF0bk2C0t3Gs7x0WT61lJ2yZ7mD8N_VoUabFDVqrpVMG3i-dBMxFNO1E83Vs2LFynf3B5ftnX2SHBSkMXlS1q34-zfWR_ekbV7R9bdO7I-viPr0_9hPRrHdqCMYqnvrMzMJa9Df5Io5OaenZ0kWJEU9VQV6FcjsV2BRU4k-ooZIwpt9_cLtLvfzz0XcZMe5wThguD0D9vi7kVX0YTMP1cbtPRWfrAOo9idTLsWVMWJnGxBEMytfbLsF18Wyw2iJidjCIqqRjjH1PRRhXTVSmQCJUGb-S2yKVBGTRs2BtQRqU1THvQM9QVWN3By32GZYlG99ORf0M_zW-fxaMbMAZqLi3Kw04cBps-AwpSRdE8kpwCmY5vDNEUOxBaDLYGrk53qaKGG38hgD9aWGrTfOFWX8GnhhJ8QVwSb-nS_pk-AaRxwEcpxIivntVGYPBiKN4DXLRjTBDLjH0f9yBD9BgAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[buildTx](https://beta-wallet.gamechanger.finance/doc/api/v2/buildTx.html),
[signTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/signTxs.html),
[submitTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/submitTxs.html),
[macro](https://beta-wallet.gamechanger.finance/doc/api/v2/macro.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

Run the example with addresses from wallets you own or you have access to, to check the sender's message ;)

This example is great for showing how building on Cardano looks like. You are combining several protocol native features like `outputs` and  `auxiliaryData` into a single transaction. You can pack all the features you want on a transaction, until you hit the transaction size limit. The more bytes a transaction has, more network fee you will require to pay, but it never gets too big in comparison with what you can end up paying on a bad (network busy) day on Ethereum. 

## Multiple transactions

GameChanger is a wallet designed for simple and also very advanced use cases. With *GCFS, our On-Chain File Storage Protocol on Cardano* you can store entire file systems on-chain, and this is done by splitting the file system data into a sequence of several transactions on a single GCScript execution, so `buildTx`, `signTxs` and `submitTxs` are functions well prepared to handle more than one transaction at a time, with an eUTXO management system that prevents consuming same eUTXOs on several concurrent transactions and other features like improved user experience for multi-transaction (even multi-sig) operations as no other wallet can do on Cardano.

Let's create now the opposite situation, we will send 1 tADA to each of the 6 previous addresses but now on 6 different transactions with one outgoing output each.

```js
{
    "type": "script",
    "title": "🚀 1-in-6 Payments",
    "description": "This is a payment request to send 1 tADA to 6 different addresses on 6 different transactions",
    "args":{
        "addressA": "addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
        "addressB": "addr_test1vrp4jqn97fg7ucmhpsncfm87hcg3h788alzfpapme9yyj9cvlh24z",
        "addressC": "addr_test1vpzmm2ffh9qjcvckw8sg5v9ekfkkn5uw4u9le8avhvtprxg9zqwll",
        "addressD": "addr_test1vz4nsqaw9hnlzzqaersvwldxr2me4s20qw56uax04fnk22c25mjz7",
        "addressE": "addr_test1vzqtssvqusv2qp8tchw0hsyvzp7k0unp0h0w2y9n2m3dxxs6w79am",
        "addressF": "addr_test1vqqj3qgy50d26lv7kzqlyc6s4qr343694nd9wckkq9vf5ygfalzy8"
    },
    "exportAs": "multiTransaction",
    "return": {
        "mode": "last"
    },
    "run": {
        "assetsToSend":{
            "type":"data",
            "value":[
                {
                    "policyId": "ada",
                    "assetName": "ada",
                    "quantity": "1000000"
                }
            ]
        },
        "buildA": {
            "type": "buildTx",
            "title": "🚀 Payment A",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressA')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
        "buildB": {
            "type": "buildTx",
            "title": "🚀 Payment B",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressB')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
       "buildC": {
            "type": "buildTx",
            "title": "🚀 Payment C",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressC')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
       "buildD": {
            "type": "buildTx",
            "title": "🚀 Payment D",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressD')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
       "buildE": {
            "type": "buildTx",
            "title": "🚀 Payment E",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressE')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },       
        "buildF": {
            "type": "buildTx",
            "title": "🚀 Payment F",
            "tx": {
                "outputs": [
                    {
                        "address":"{get('args.addressF')}",
                        "assets":"{get('cache.assetsToSend')}"
                    }
                ]
            }
        },
        "sign": {
            "type": "signTxs",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.buildA.txHex')}",
                "{get('cache.buildB.txHex')}",
                "{get('cache.buildC.txHex')}",
                "{get('cache.buildD.txHex')}",
                "{get('cache.buildE.txHex')}",
                "{get('cache.buildF.txHex')}"
            ]
        },
        "submit": {
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        },
        "results": {
            "type": "macro",
            "run": {
                "txHashes":{
                    "A":"{get('cache.buildA.txHash')}",
                    "B":"{get('cache.buildB.txHash')}",
                    "C":"{get('cache.buildC.txHash')}",
                    "D":"{get('cache.buildD.txHash')}",
                    "E":"{get('cache.buildE.txHash')}",
                    "F":"{get('cache.buildF.txHash')}"
                }
            }
        }
    }
}

```
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA52VS27bMBCGryJo0xZIA0eWLSk7P9FuigL1rigKhqKeJCVyqGcQoOfoplfsEUrKSWylRmBHMGCR8_Ofj-SQurdVVxL71gYs01LZV7ZKFTUdf__8_mXdfEz5x7n1FXWMcAU6HJK9Mi24Fu2SFCz9Q1a5l1iSiIqAslRhAeGhdWOpxXphmnMrTKOISKNCYSgJAAGr4KOAkogDwsbeZEMyBvv23n7UL3RK8_pT6RQ3tawd1uFpRmbCi9qIoyyLM1fwjidh6TsSOsozhzK_Q42Cpon1vzHdmy1fmJVuJnjgRbFXYZaUwHHEfC_B8TTxfB_RPipRyUjQdVmAa5o4bn8wW43Nyp4xJ4qSQGS4xnnjQzyrA5JHec5nVeNWASU-qpNalbKNg140lB7M1mOz3uUgUBMknPa9QERC3dCwlQ4jLjgT0czmFWonbsRzx8HOjGW9dzDbvDATCqAWFdSOKH2Fk2aSQFf3pZdPKl5OkknjdAF32DRsW5g3XoDYwWw7NhMim4q4m01CZ05rL-8F7fAcXCGn7nQeuDwMGpznIqijWRdHeg073364sklbFlIt9NbarKIq3R12XeeSRFWSm21nRWhKkSJQZpishl6kC0fBrvim68u0Hys4RArp0TWilW5-v7fLgqa4-xwOzCY0DPyCGHnuERXiuuA73XEzGR774YfOdFelNFwcmQ8du_bl-Xg8GNbCBFqjLypVVvqkGIDHRdPi-5io9-9MNV8_lfK7Dw9PSAcFRjgh18cTNDKN9MS0PJ9peTHT8m1Mq_OZVhczrd7GtD6faX0x0_ptTJvzmTYXM23exrQ9n2l7MdP2YiZIY35EZJq7dv_ZUSilJPxKJEsBhs_Drb5QgBgogzJy35_fa9V-Iu0e4r_o8tXo6tXo-tXo5tXo9hA1Nw1UdyxVx3MeOvazHmY2sjArMiyXuSZB351wNJQhLAv7-Z7UeRAkZFAsXvgcFkhL9qTLU5LlSLI6JVmNJOtTkvVIsjkl2Ywk21OS7ZHkwTz_AIsyrWm9CAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[buildTx](https://beta-wallet.gamechanger.finance/doc/api/v2/buildTx.html),
[signTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/signTxs.html),
[submitTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/submitTxs.html),
[macro](https://beta-wallet.gamechanger.finance/doc/api/v2/macro.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

And after the script builds the 6 transactions sequentially, sign and submit all the transactions at once, you will receive some exported results like this:

```json
{
  "exports": {
    "multiTransaction": {
      "txHashes": {
        "A": "8f50bfefc6639bab1f40e404dbf75db19b95edad76bf32ce046b3937dbb9988a",
        "B": "b637f3296a05bbcd0267c64e86e80cd79215cb49be6fdc58bd62c25b06cfd69e",
        "C": "b0574c4623507b04a7cff4a5e2c9896a3d22f33235ae258b4e11b1cd84da4e0c",
        "D": "50780b3b8f210bcaf55f64576d1106feba29309e26f6647aba9b3737244ca8c8",
        "E": "d6b0c2fcd77a4642b07e75185e82166020ecf80a029da706ce4f71f054b16121",
        "F": "529bcc546bc5b9f41f741d57f461b1db5f193ee5eb1d91ba0e3ab4a447a0f5a7"
      }
    }
  }
}
```

## Multi-asset outputs

"What about sending coins, NFTs and Tokens on a single transaction output?"

Well for that you will need those on your wallet. We will mint some on the next section but for now keep in mind that this is how it looks like:

```js
{
    "type": "script",
    "run": {
        "build":{
            "type": "buildTx",
            "tx": {
                "outputs": [
                    {
                        "address":"addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
                        "assets": [
                            {
                                "policyId": "94154242672900d611533747d21b8d6df80933d6f9805756927d5269",
                                "assetName": "GameChangerNFT #1",
                                "quantity": "1"
                            },
                            {
                                "policyId": "a1267cbb4f224250db4f7735e571b7b4bdc8ea0be7180756b7fb6b3e",
                                "assetName": "FakeUSD",
                                "quantity": "5"
                            }
                        ]
                    }
                ]
            }
        },
        "sign":{
            "type": "signTxs",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        "submit":{
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        }
    }
}

```
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA12RXU-DMBSG_4qpF9NkWWihFHarmXqzmDivzGJaemBF6BgtG2Thv9uiJpvpxfns87bnnJEdGkBLZLJWNRbNUdtptDwj0alKeue3PsWb3jXY3qf3nW06a9Dy44y4lC0Y50_epwVj8bE9knrIwhLogeV9rnlZFmV00IPeySYhrRkqXZKqTgZ-suZ0Kpx1dG4M_GKbfaWy4cW9AqURphGJSMxIGgQyxpiGIYuYJFgkMpZ5EqRhKOM8TQLKaJwSJimJ0z_gmtf-E0_OPOy4LqBdrzY3t9jVDx3XVtnBlTEa51eyHDvFTIgoJ06cBtJ5jIUUKMOCiUjILAEeCGA4CZysYLmIRQj_ZFf8C97fHq_FKBq37oxzZFShLybtw01vXLcEy1UF8hXaWhmj9toNJueVAb8FPyR0LsDezTKe7WAxrWhh-2foZ_cj2np0J2plL-FT4gc_Ia4IXtpfHcfxG6odnTwZAgAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[buildTx](https://beta-wallet.gamechanger.finance/doc/api/v2/buildTx.html),
[signTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/signTxs.html),
[submitTxs](https://beta-wallet.gamechanger.finance/doc/api/v2/submitTxs.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

On Cardano there are several ledger rules, one of those is that there is a practical *minimum coin value per output* that you need to fulfill in order for a transaction to be valid. 

On this transaction we did not specify any coin to be sent on the output, so GameChanger will adapt it to became valid by adding a minimum coin value (around 1.25tADA) on the output for you, so you don't have to calculate this on your own. 

Remember you can always review each GCScript prior to execution, and each transaction prior to be signed.

Previous: [Overview](overview.md) | Next: [Minting](minting.md)