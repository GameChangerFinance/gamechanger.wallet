# [GCScript DSL](README.md) / Quick Start

## Running your first GCScript

<details>
  <summary>First time using GameChanger Wallet?</summary>

- Go to [GameChanger Wallet for Cardano Mainnet](https://beta-wallet.gamechanger.finance/) 
- Follow the automatic welcome wizard for creating your `Default` Burner Wallet
- You now have a non-custodial but password-less Cardano wallet for quick developing and testing, no funds needed for now!
- Instead, if you prefer to import or connect to a Browser Extension, Hardware, Mnemonic (seed phrase), or Express (QR code) wallet it's time to do so.
</details>

No more theory until next section, let's run some GCScript right now!

- Go to [Playground IDE for Cardano Mainnet](https://beta-wallet.gamechanger.finance/playground), the in-wallet development environment for building and deploying dapps on Cardano. Also available on `Dapp builder` on wallet side panel.

- Copy and paste the next script into the code editor, replacing the default welcome code sitting there already.

*Your first GCScript!:*
```json
{
    "type": "script",
    "title": "My first Cardano dapp!",
    "description":"This dapp is going to ask your wallet name and address. Click Continue to proceed.",
    "exportAs":"myWalletData",
    "run":{
        "name":{"type":"getName"},
        "address":{"type":"getCurrentAddress"},
        "message":{
            "type":"data",
            "value":"Hello Cardano!"
        }
    }
}
```
<a href="https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA1VPMY4CMQz8ikmNeAAd2itooEKitja-JSIbR44Dt0L793NgkaAaeWY8Yz-cTpnc1pVeQla3dho0NuIwwW-QotCheEwMHnNemcHTyxs4me10CeUpgeHAIQ2gDFiuMHEVuGOMpJBwJMDkAb0XKmUDXQz9FTpOGlKltpOFeyK_sQr6yyy6K5Y_TudnxA8qmiLVSh-u5TVcjh9Ij42Z124p-Ba7KkJJd4tmttEQh88M_yq4Yaxt3FOM_P595eZ5_gd8gqb_KwEAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-mainnet.png" alt="Run on Cardano Mainnet" style="border:none;">
</a>
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA1VPMY4CMQz8ikmNeAAd2itooEKitja-JSIbR44Dt0L793NgkaAaeWY8Yz-cTpnc1pVeQla3dho0NuIwwW-QotCheEwMHnNemcHTyxs4me10CeUpgeHAIQ2gDFiuMHEVuGOMpJBwJMDkAb0XKmUDXQz9FTpOGlKltpOFeyK_sQr6yyy6K5Y_TudnxA8qmiLVSh-u5TVcjh9Ij42Z124p-Ba7KkJJd4tmttEQh88M_yq4Yaxt3FOM_P595eZ5_gd8gqb_KwEAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html),
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html)

- Now execute the code by clicking on the green `Run ▸` button. 

- Click `Continue`.

- Then click on `Return with data`.

You will capture back your first execution results, and they will look something like this:

*example results:*
```json
{
  "exports": {
    "myWalletData": {
      "name": "Default",
      "address": "addr1q8aw6dzpw3cld828cqywp0sql4sxfw6syhzyh2kfcfccakddqwj2u3djrag0mene2cm9elu5mdqmcz9zc2rzgq7c5g6qshxn7l",
      "message": "Hello Cardano!"
    }
  }
}
```

In the next section you will understand this code syntax better, but basically you asked your own wallet some information, such as your own Cardano address, by establishing a compressed communication towards the wallet core and decompressing the response. 

You **sent compressed GCScript code (JSON)** to the wallet core, it processed the code and it responded with **compressed JSON results**.

## Deploying your first Dapp

You have been using a special transport called `local transport`, which is meant for launching in-wallet dapp connections or also for developing your own dapps, exactly what you are doing right now. 

"Wait, what? this is not a dapp yet!"

Well, you have coded just a **"dapp connection", a communication towards a user wallet that will return useful data back to you**.

Do you want now to create a full dapp to actually launch this communication from it but using the `url transport`?, in other words, to exit this "developer mode" and jump into real action?

"Let's do it!"

- Ok, you are now sitting on the `GCScript` tab on Playground IDE. Now click on the `Deploy` tab.

- Once there, click on the green `Deploy Dapp on IPFS` button, then `Deploy and Go` button. (you can use your own pinning service or host the exported HTML code on an HTTP server)

- Now wait a bit until the green button label turns into `Preview Dapp`. Now click on it, it will open the deployed dapp on a new tab. ([example](https://ipfs.io/ipfs/bafkreiedad3jl56jf5objj4k5vxc7emqucjgdctidagvjassmcxumik6ry))

"Wait, that's it?"

Yes! 

- Now click on `Connect` button on the dapp to run the same code, but now launched from a real deployed dapp.

- Click `Continue` and to run the dapp connection you coded and this time the `Return with data` button at the end of the wizard will deliver the JSON results back to the dapp, where you will see them. Same results as the one you obtained testing locally.


<details>
  <summary>"How to do this on a Cardano Testnet?"</summary>

GameChanger Wallet have a Cardano Pre-Production Testnet version. It even have a built-in tAda + tokens + nfts airdrop!

- Go to [GameChanger Wallet for Cardano Pre-Production Testnet](https://beta-preprod-wallet.gamechanger.finance/) 
- Follow the same instructions you followed above, even use the same GCScript code

To adapt a code in GCScript to work for a specific network you just need to use data or expect results specific for that network, for example for testnets you use addresses starting with `addr_test1`. Also when using the `url` and `qr` transports just take care of pointing to the right wallet URLs.

</details>


## Coding your own frontend, backend or hardware integration to connect to the wallet

> If you already know GCScript syntax, jump to [Transactions / Quick Start](../transactions/quick-start.md) for code snippets you can use to integrate GameChanger Wallet on stores, social and messaging platforms, and your frontend, backend or hardware applications.

Playground IDE automated the process of building and deploying a simple HTML + Javascript dapp for you, after you master more your GCScript skills you can start coding your own dapps using our [Official NPM Library](https://www.npmjs.com/package/@gamechanger-finance/gc) for Javascript/Typescript. 

If you are working on a different language/platform such as on embedded hardware, you can still create your own URLs or QR codes to stablish communications by using standard building blocks available on all platforms and programming languages. Same building blocks will allow you to decode or decompress returning JSON data from the wallet to capture script results and use them on your applications.

## Code editors and available tools

In addition to the in-wallet [Playground IDE](https://beta-wallet.gamechanger.finance/playground), you can create full projects using [Inception IDE (Beta)](https://inception.m2tec.nl/), a powerful GCScript and Helios code editor and development environment by [M2Tec](https://www.m2tec.nl/cardano).

The Official NPM Library [is also a CLI](https://www.npmjs.com/package/@gamechanger-finance/gc) you can install. In both usage modes you can encode and decode these URLS and response URLs, and it even generates ready to use QR codes, HTML, React and NodeJS applications boilerplates to get you started or automate code generation.

Now it's time for you to learn some GCScript syntax!

Previous: [Overview](overview.md) | Next: [Syntax](syntax.md)