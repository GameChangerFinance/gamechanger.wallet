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

In the next section you will understand this code syntax better, but basically you asked your own wallet some information, such as your own Cardano address, by establishing a bidirectional communication with the wallet. 

You sent GCScript code (JSON) to the wallet core and the wallet core responded with JSON.

## Deploying your first Dapp

You have been using a special transport called `local transport`, which is meant for launching in-wallet dapp connections or also for developing your own dapps, exactly what you are doing right now. 

"Wait, what? this is not a dapp yet!"

Well, you have coded just a "dapp connection", a communication towards a user wallet that will return useful data back to you.

Do you want now to create a full dapp to actually launch this communication from it but using the `url transport`?, in other words, to exit this "developer mode" and jump into real action?

"Let's do it!"

- Ok, you are now sitting on the `GCScript` tab on Playground IDE. Now click on the `Deploy` tab.

- Once there, click on the green `Deploy Dapp on IPFS` button, then `Deploy and Go` button.

- Now wait a bit until the green button label turns into `Preview Dapp`. Now click on it, it will open the deployed dapp on a new tab. ([example](https://ipfs.io/ipfs/bafkreiedad3jl56jf5objj4k5vxc7emqucjgdctidagvjassmcxumik6ry))

"Wait, that's it?"

Yes! 

- Now click on `Connect` button on the dapp to run the same code, but now launched from a real deployed dapp.

- Click `Continue` and to run the dapp connection you coded and this time the `Return with data` button at the end of the wizard will deliver the JSON results back to the dapp, where you will see them. Same results as the one you obtained testing locally.

## Coding your own frontend, backend or hardware to connect to the wallet

Playground IDE automated the process of building and deploying a simple HTML + Javascript dapp for you, after you master more your GCScript skills you can start coding your own dapps using our [Official NPM Library](https://www.npmjs.com/package/@gamechanger-finance/gc) for Javascript/Typescript. 

If you are working on a different language/platform such as on embedded hardware, you can still create your own URLs or QR codes to stablish communications by using standard building blocks available on all platforms and programming languages. 

In addition to the in-wallet IDE, you can create full projects using [Inception IDE (Beta)](https://inception.m2tec.nl/), a powerful GCScript and Helios code editor and development environment by M2Tec.

Now it's time for you to learn some GCScript syntax!

Previous: [Overview](overview.md) | Next: [Syntax](syntax.md)