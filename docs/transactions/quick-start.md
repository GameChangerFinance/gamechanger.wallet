# [Transactions](README.md) / Quick Start

# A cross-wallet, cross-platform and cross-language example 

"I don't see the point, show me a bit what I've been missing"

Fair enough. Let's say you want to make someone send coins to Alice and Bob on a single transaction.
- From any platform
- From any programing language
- From any user wallet type (Nami, Eternl, Flint, Vespr, Ledger, Trezor, multisig, seed phrases, QR wallets, burners, gifts, etc.. )

Let's create a payment request on user's wallets, anyone "connecting" or running this example will be reviewing and signing a P2P (Peer-to-Peer) testnet transaction with a payment to Alice and Bob. 


## The GCScript code (JSON):

```js
{
    "type": "script",
    "run": {
        // building an off-chain transaction..
        "build":{
            "type": "buildTx",
            "tx": {
                "outputs": [
                    //1st output of 1 tADA to Alice
                    {
                        "address":"addr_test1vrv2myc3je5q7fxfnajjgj4qnynhdp82rsylnj2lm8yawtswwgyaw",
                        "assets": [{ "policyId": "ada", "assetName": "ada", "quantity": "1000000"}]
                    },
                    //2nd output of 1.5 tADA to Bob
                    {
                        "address":"addr_test1vrp4jqn97fg7ucmhpsncfm87hcg3h788alzfpapme9yyj9cvlh24z",
                        "assets": [{ "policyId": "ada", "assetName": "ada", "quantity": "1500000"}]
                    },
                ],
                // Add these lines if you also want seamless support for multisig wallets 
                // "options": {
                //     "autoProvision": {
                //         "workspaceNativeScript": true
                //     },
                //     "autoOptionalSigners": {
                //         "nativeScript": true,
                //     },
                // }
            },
        },
        // signing the transaction with user's private keys
        "sign":{
            "type": "signTxs",
            "detailedPermissions": false,
            "txs": [
                "{get('cache.build.txHex')}"
            ]
        },
        // submitting the transaction to a Cardano Node, for going on-chain
        "submit":{
            "type": "submitTxs",
            "txs": "{get('cache.sign')}"
        }
    }
}

```
Now this code can be statically or programmatically packed as a URL like this using [Playground IDE](https://beta-preprod-wallet.gamechanger.finance/playground), our [NPM Library and CLI](https://www.npmjs.com/package/@gamechanger-finance/gc) or the programming language of choice:

```
https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6WRwW7DIAyG34VLN6mq1rRV0j7Bdpl26G2qJkqcBASUxNCGRrz7gHXVdthpXLB_4--3zESsN0B2BNnAjSVzMjhNdhM5Oi7rFNzqOd-P8YEdk3xy1jiLZPc-EVrXA2CMc_RhAe3yPJwL5dlKwKYvm7HRVIhWrHvtdVebqhjQSy0KqSpPLxYvlzbekU4R4YY1J8mZf6kzl37XXqmCu9I7qi23PgrLp3xIOIT5XyOZtej1tmza0jHVGdSsUVXZsXbVlVVF5bUx1CjYei-27Cy7Yn3910ib-0iHEOYEeat_rDSl-xFjTw2Wcgn1GwyKI_KTjnYNlQhp3cmaTC3YhxmjrINF_ouFHZ9hnD0Gckhod1Tc_oRn4QufEb8IyTq1hhA-ARyKZuYCAgAA
```

Then you can 
- embed these URLs on websites, dapps, documents, pdf, 
- redirect from social media, messaging apps, backends, 
- encode as QR codes and place on screens, hardware devices, print on paper on streets, place on documents, 
- etc..

You can generate these URLs in 2 ways:

| Statically  | Programmatically  |
| :---------: | :---------------: |
| **The fastest and easiest way** | **The suggested way** |
| Pre-generate these URLs statically and just place them where your users need it. *Integrate Cardano everywhere.* | Generate them programmatically on your favorite programming language, this way you can produce and customize your GCScript code where you need it as it is pure JSON, a data format supported everywhere. |

Let's explore some integrations and generation techniques:

## URL Statically embedded on HTML websites

```html
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6WRwW7DIAyG34VLN6mq1rRV0j7Bdpl26G2qJkqcBASUxNCGRrz7gHXVdthpXLB_4--3zESsN0B2BNnAjSVzMjhNdhM5Oi7rFNzqOd-P8YEdk3xy1jiLZPc-EVrXA2CMc_RhAe3yPJwL5dlKwKYvm7HRVIhWrHvtdVebqhjQSy0KqSpPLxYvlzbekU4R4YY1J8mZf6kzl37XXqmCu9I7qi23PgrLp3xIOIT5XyOZtej1tmza0jHVGdSsUVXZsXbVlVVF5bUx1CjYei-27Cy7Yn3910ib-0iHEOYEeat_rDSl-xFjTw2Wcgn1GwyKI_KTjnYNlQhp3cmaTC3YhxmjrINF_ouFHZ9hnD0Gckhod1Tc_oRn4QufEb8IyTq1hhA-ARyKZuYCAgAA"> Click here to send a payment to Alice and Bob </a>
```
<details>
  <summary>Try it online:</summary>

<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6WRwW7DIAyG34VLN6mq1rRV0j7Bdpl26G2qJkqcBASUxNCGRrz7gHXVdthpXLB_4--3zESsN0B2BNnAjSVzMjhNdhM5Oi7rFNzqOd-P8YEdk3xy1jiLZPc-EVrXA2CMc_RhAe3yPJwL5dlKwKYvm7HRVIhWrHvtdVebqhjQSy0KqSpPLxYvlzbekU4R4YY1J8mZf6kzl37XXqmCu9I7qi23PgrLp3xIOIT5XyOZtej1tmza0jHVGdSsUVXZsXbVlVVF5bUx1CjYei-27Cy7Yn3910ib-0iHEOYEeat_rDSl-xFjTw2Wcgn1GwyKI_KTjnYNlQhp3cmaTC3YhxmjrINF_ouFHZ9hnD0Gckhod1Tc_oRn4QufEb8IyTq1hhA-ARyKZuYCAgAA"> Click here to send a payment to Alice and Bob </a>

</details>


## URL Statically embedded on markdown

```md
[Click here to sent a payment to Alice and Bob](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6WRwW7DIAyG34VLN6mq1rRV0j7Bdpl26G2qJkqcBASUxNCGRrz7gHXVdthpXLB_4--3zESsN0B2BNnAjSVzMjhNdhM5Oi7rFNzqOd-P8YEdk3xy1jiLZPc-EVrXA2CMc_RhAe3yPJwL5dlKwKYvm7HRVIhWrHvtdVebqhjQSy0KqSpPLxYvlzbekU4R4YY1J8mZf6kzl37XXqmCu9I7qi23PgrLp3xIOIT5XyOZtej1tmza0jHVGdSsUVXZsXbVlVVF5bUx1CjYei-27Cy7Yn3910ib-0iHEOYEeat_rDSl-xFjTw2Wcgn1GwyKI_KTjnYNlQhp3cmaTC3YhxmjrINF_ouFHZ9hnD0Gckhod1Tc_oRn4QufEb8IyTq1hhA-ARyKZuYCAgAA)
```

<details>
  <summary>Try it online:</summary>

[Click here to sent a payment to Alice and Bob](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6WRwW7DIAyG34VLN6mq1rRV0j7Bdpl26G2qJkqcBASUxNCGRrz7gHXVdthpXLB_4--3zESsN0B2BNnAjSVzMjhNdhM5Oi7rFNzqOd-P8YEdk3xy1jiLZPc-EVrXA2CMc_RhAe3yPJwL5dlKwKYvm7HRVIhWrHvtdVebqhjQSy0KqSpPLxYvlzbekU4R4YY1J8mZf6kzl37XXqmCu9I7qi23PgrLp3xIOIT5XyOZtej1tmza0jHVGdSsUVXZsXbVlVVF5bUx1CjYei-27Cy7Yn3910ib-0iHEOYEeat_rDSl-xFjTw2Wcgn1GwyKI_KTjnYNlQhp3cmaTC3YhxmjrINF_ouFHZ9hnD0Gckhod1Tc_oRn4QufEb8IyTq1hhA-ARyKZuYCAgAA)

</details>

## QR Statically embedded on HTML websites

```html
<img src="../img/docs-transactions-overview-example.png"> Scan to send a payment to Alice and Bob </img>
```

<details>
  <summary>Try it online:</summary>

<img src="../img/docs-transactions-overview-example.png"> Scan to send a payment to Alice and Bob </img>

</details>


## QR Statically embedded on markdown

```md
![Scan to send a payment to Alice and Bob](../img/docs-transactions-overview-example.png)
```

<details>
  <summary>Try it online:</summary>

![Scan to send a payment to Alice and Bob](../img/docs-transactions-overview-example.png)

</details>


## Generation and redirection from a Javascript frontend with [NPM Lib](https://www.npmjs.com/package/@gamechanger-finance/gc)

```js
import gc from '@gamechanger-finance/gc'

const gcScript={...GCScript code here...};

const url = await gc.encode.url({
    input: JSON.stringify(gcScript),
    network: 'preprod',
});

window.open(url, "_blank");

```

## Generation and redirection from a Javascript backend with [NPM Lib](https://www.npmjs.com/package/@gamechanger-finance/gc)

```js
import gc from '@gamechanger-finance/gc'
import express from 'express';

const gcScript={...GCScript code here...};

const url = await gc.encode.url({
    input: JSON.stringify(gcScript),
    network: 'preprod',
});
const app = express();

app.get('/url', (req, res) => {
    res.status(301).redirect(url);
});

app.listen(8000, () =>{
    console.info(
        `\n\n🚀 Express NodeJs Backend serving connection URL on http://localhost:8000/\n`
    );
});

```

## Generation as URL from Bash with [CLI](https://www.npmjs.com/package/@gamechanger-finance/gc)
```bash
    # save GCScript code in code.gcscript file
    gamechanger-cli preprod encode url -v 2 -f code.gcscript
    # open URL on a browser, or send it through email, social networks, messaging apps, etc..
```

## Generation as QR code from Bash with [CLI](https://www.npmjs.com/package/@gamechanger-finance/gc)
```bash
    # save GCScript code in code.gcscript file
    gamechanger-cli preprod encode qr -v 2 -f code.gcscript -o scan_me.png
    # use scan_me.png QR code on screens or printed on a public site
```


## Generation and redirection from a Javascript frontend using Vanilla JS (zero-dependencies)

```js

const gcScript={...GCScript code here...};

/**
 *  A pure vanilla js, browser-native,zero dependencies, URL generator using base64url encoder
 * 
 *  Note: base64url encoder is ideal as fallback connection method, the best for extreme scenarios like on hardware devices  
 * 
*/
async function fallbackUrlEncoder({input,network}){
    const gcApiUrls    = {
        "mainnet":"https://beta-wallet.gamechanger.finance/api/2/run/"
        "preprod":"https://beta-preprod-wallet.gamechanger.finance/api/2/run/"
    };

    function base64Encode(str){
        const percentToByte=(p)=>String.fromCharCode(parseInt(p.slice(1), 16));
        return btoa(encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, percentToByte));
    }
    function base64urlEncode(str){
        return base64Encode(str)
            .replace(/\//g, "_")
            .replace(/\+/g, "-")
            .replace(/=+$/, "");
    }
    var header       = '0-';
    var json         = JSON.stringify(input);
    var base64String = base64urlEncode(json);
    var msg          =`${header}${base64String}`;
    var url          =`${gcApiUrls[network]}${msg}`;
    return Promise.resolve(url);
}

const url = await fallbackUrlEncoder({
    input: JSON.stringify(gcScript),
    network: 'preprod',
});

window.open(url, "_blank");

```

For insight on how to integrate on other languages, [here is a full example](https://github.com/GameChangerFinance/gamechanger.wallet/blob/main/examples/%F0%9F%9A%80%20Pay%20me%201%20ADA_nolib.html) with all vanilla js encoders and decoders (no libraries, zero-dependencies).
 



Previous: [Overview](overview.md) | Next: [Payments](payments.md)