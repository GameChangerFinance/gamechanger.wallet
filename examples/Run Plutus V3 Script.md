
# Cardano Example Dapp

## **Run Plutus V3 Script**

Demo that locks and redeem some coin from an Always-Succeed Plutus V3 smart contract. A GameChanger Wallet Dapp Demo. https://gamechanger.finance/


## Try it online: 

-  Visit [HTML5 Dapp](https://gamechangerfinance.github.io/gamechanger.wallet/examples/Run%20Plutus%20V3%20Script.html)
-  Run [Standalone URL dapp connection](https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6VW227bRhD9FYIvSQFHpihStvImyEAS1EiM2m0eAiMY7g4tIstLucNEiqF_7-wuJZKyXLON_CLPzM7lzDm7evRpW6H_1teiziryz3zKSBnDH03h3aiGGu39NfNu926JLjIrCw66wrz0aA3kqVJ80x4U0qtRIuaeLnP0RJkVXlqXOXu8pfoBW_3mthECUfaS6xxq4tiCahA08ZbeO8hxtYbiAWvvMyiF5F1BVXmm3sRbE1X67fn5A0cJFzVJswIKgefcIm6qsqaldkO4MmROsq9Gamru_NHPS2nGVKDJ37GjsVaJFRYSC5GhNv8fo9OGmWl7bgkE7PwOqkFjNmOzOZwH5mNQA2ry97hh4xSCILwAEXV20GvnS2SKwOglIgzjaRrFABKSeJrIRZqGU4nJ5XwRSpjDRYxxHC8SGXMAXIoAIIxn_o4n0QTfcGW2UFAG6tk2fZDBDCLAKE7CaRoHqcT5xSKez-axSNNFJJNomojgEkIRXs7DKJhJ_j6LDFz7ZfWyVxboA1FayNjvvrkJo3kUB1P-C8JoseAwxes7HP763Y0AUtao-wtImkzJZWs-8wvePFtXbRedw5y0Nc0aXS8dvI8PSK9fCRBrnPQXPTlQT_dPvPpt57dw3jTJ77gdkekIfJNitzMj2QGuh7SxtrtNN48x0BtLLhbixoSWDVUNMRRfHjtYnq_fhrjWLbssq4c0e_a0qTzpB9v-GVWtse2hKlUmth-k5Y9hk_V9dP07y98N8PC0fbGSkYmtcL-7P_NLe6nYpTtRf2JDnv1EXqj_8ZNvYdTZQ3GEojHdbfasuAEiNAq3dpR7NCUSZArlDdZ5prWrlILSaJA2sw2aPaxrQpsWh3tTvknyjI4bsMaTLVgPdV3YSoNC-4FapG3dPws1iihN0aatoGa-3W3M1o7yDwZht2OG41ZWHKhF489mvEQ-HvA32Y1qOuE5bUrfrPNHRgUz0V2jTt7dZeCK9i-G0drc67K9OF4-ZwIdy-y1pZsc60H9X7sf-iKD8fo6aMs9l1j3CWWOGKQJ8w_PYsyq2Q1VUyoFHApqxcK6RYWifaavl7fXy6tOQU8I9oKGDkT7PypyxU7p6GkbI5R06OW0llzOFlvzo0Cp7fiHPAdRl3vvv--xLWF_u6yevoYjM51m93Fep81fzT240gf5l0_e25Eles8N5zSw3G1GZTl1tXAGt9z_kqNj1z6L-fwDg1JgktcKAAA)

## Source code:

- dapp connection code: [GCScript DSL](Run%20Plutus%20V3%20Script.gcscript)
- frontend (using @gamechanger-finance/gc): [HTML5 dapp](Run%20Plutus%20V3%20Script.html)
- frontend (without official library): [Native HTML5 dapp](Run%20Plutus%20V3%20Script_nolib.html)

Dapp code was autogenerated by [Playground IDE in GameChanger Wallet ](https://beta-wallet.gamechanger.finance/playground)

## GCScript code (dapp connection):
```json
{
  "type": "script",
  "title": "Run Plutus V3 Script",
  "description": "Demo that locks and redeem some coin from an Always-Succeed Plutus V3 smart contract. A GameChanger Wallet Dapp Demo. https://gamechanger.finance/",
  "exportAs": "RunPlutustDemo",
  "return": {
    "mode": "last"
  },
  "run": {
    "dependencies": {
      "type": "script",
      "run": {
        "lock": {
          "type": "data",
          "value": {
            "coin": "2600000",
            "datumHex": "1a0027ac40",
            "datumHashHex": "bdfeadeebc2251f45aadab51bd9ff21deb8692da6a75e5559bd5daba8c0aa253"
          }
        },
        "stakeCredential": {
          "type": "data",
          "value": "ad03a4ae45b21f50fde67956365cff94db41bc08a2c2862403d8a234"
        },
        "contract": {
          "type": "plutusScript",
          "script": {
            "scriptHex": "46450101002499",
            "lang": "plutus_v3"
          }
        },
        "address": {
          "type": "buildAddress",
          "name": "ContractAddress",
          "addr": {
            "spendScriptHashHex": "{get('cache.dependencies.contract.scriptHashHex')}",
            "stakePubKeyHashHex": "{get('cache.dependencies.stakeCredential')}"
          }
        }
      }
    },
    "buildLock": {
      "type": "buildTx",
      "name": "built-lock",
      "tx": {
        "outputs": [
          {
            "address": "{get('cache.dependencies.address')}",
            "datum": {
              "datumHashHex": "{get('cache.dependencies.lock.datumHashHex')}"
            },
            "assets": [
              {
                "policyId": "ada",
                "assetName": "ada",
                "quantity": "{get('cache.dependencies.lock.coin')}"
              }
            ]
          }
        ],
        "options": {
          "changeOptimizer": "NO"
        }
      }
    },
    "signLock": {
      "type": "signTxs",
      "namePattern": "signed-lock",
      "detailedPermissions": false,
      "txs": [
        "{get('cache.buildLock.txHex')}"
      ]
    },
    "submitLock": {
      "type": "submitTxs",
      "namePattern": "submitted-lock",
      "txs": "{get('cache.signLock')}"
    },
    "buildUnlock": {
      "type": "buildTx",
      "name": "built-unlock",
      "parentTxHash": "{get('cache.buildLock.txHash')}",
      "tx": {
        "inputs": [
          {
            "txHash": "{get('cache.buildLock.txHash')}",
            "index": 0,
            "idPattern": "locked-input"
          }
        ],
        "witnesses": {
          "plutus": {
            "scripts": [
              {
                "scriptHex": "{get('cache.dependencies.contract.scriptHex')}",
                "lang": "{get('cache.dependencies.contract.lang')}"
              }
            ],
            "consumers": [
              {
                "scriptHashHex": "{get('cache.dependencies.contract.scriptHashHex')}",
                "datum": {
                  "dataHex": "{get('cache.dependencies.lock.datumHex')}"
                },
                "redeemer": {
                  "type": "spend",
                  "itemIdPattern": "locked-input"
                }
              }
            ]
          }
        },
        "options": {
          "collateralCoinSelection": "LASLAD"
        }
      }
    },
    "signUnlock": {
      "type": "signTxs",
      "namePattern": "signed-unlock",
      "detailedPermissions": false,
      "txs": [
        "{get('cache.buildUnlock.txHex')}"
      ]
    },
    "submitUnlock": {
      "type": "submitTxs",
      "namePattern": "submitted-unlock",
      "txs": "{get('cache.signUnlock')}"
    },
    "finally": {
      "type": "script",
      "run": {
        "lock": {
          "type": "macro",
          "run": "{get('cache.dependencies.lock')}"
        },
        "smartContract": {
          "type": "macro",
          "run": "{get('cache.dependencies.contract.scriptHex')}"
        },
        "smartContractHash": {
          "type": "macro",
          "run": "{get('cache.dependencies.contract.scriptHashHex')}"
        },
        "smartContractAddress": {
          "type": "macro",
          "run": "{get('cache.dependencies.address')}"
        },
        "lockTx": {
          "type": "macro",
          "run": "{get('cache.buildLock.txHash')}"
        },
        "unlockTx": {
          "type": "macro",
          "run": "{get('cache.buildUnlock.txHash')}"
        }
      }
    }
  }
}
```

## Run standalone QR dapp connection: 

You can use [Playground IDE in GameChanger Wallet ](https://beta-wallet.gamechanger.finance/playground) in `QR URL Transport` mode to capture results

[![This GCScript/URL is too large! make it shorter uploading parts to GCFS. Unable to generate QR code](Run%20Plutus%20V3%20Script.png)](https://gamechangerfinance.github.io/gamechanger.wallet/examples/Run%20Plutus%20V3%20Script.png)

## Resources
- [How to connect?](https://www.npmjs.com/package/@gamechanger-finance/gc)
- [Docs and examples on Github](https://github.com/GameChangerFinance/gamechanger.wallet/)
- [GCScript documentation](https://beta-wallet.gamechanger.finance/doc/api/v2)
- [Playground IDE in GameChanger Wallet ](https://beta-wallet.gamechanger.finance/playground)
- [Tutorials on Youtube](https://www.youtube.com/@gamechanger.finance)
- [Support on Discord](https://discord.gg/vpbfyRaDKG)
- [News on Twitter](https://twitter.com/GameChangerOk)
- [Website](https://gamechanger.finance)

## License
MIT 
    