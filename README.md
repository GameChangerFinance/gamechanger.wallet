# GameChanger Wallet v2 Beta Documentation

[![GameChanger Wallet v2 Beta](gcw-logo-300x85.png)](https://beta-wallet.gamechanger.finance)

## The Cardano Meta Wallet

GameChanger is a very powerful, customizable, yet friendly, non custodial web light wallet. 

Since 2021 unleashes Cardano and eUTXO potential while democratizing users, developers and students access.

The smart design principles of the wallet allows you to import or connect these wallet types:
 - seed phrase
 - burner wallets
 - QR encrypted (personal and gift wallets) 
 - Ledger and Trezor hardware wallets 
 - Nami, Eternl, Flint, Vespr, any CIP-30 or browser extension wallet
 - Shared Treasuries (script addresses)
 
 And dapps, devices, users and other agents can use links and QR codes to seamlessly communicate with the wallet.

 **One wallet to have them all, on Desktop and Mobile, with the same dapp connector.**

## Links

- [Mainnet wallet](https://beta-wallet.gamechanger.finance/)
- [Pre-Production Testnet wallet](https://beta-preprod-wallet.gamechanger.finance/)

## Documentation

- [Transactions / Quick Start](docs/transactions/quick-start.md): A single page covering from making a Cardano transaction to code snippets to help integrate the wallet
- [General Documentation](docs/README.md): Universal Dapp Connector, GCScript DSL, ISL, Transactions, Workspaces and more.
- [GCScript Language Reference (API docs)](https://beta-wallet.gamechanger.finance/doc/api/v2): GCScript and ISL reference documentation. Functions, types, and other definitions.
- [JSON Schema](/release/README.md)

## Examples and special use cases:

### Dapps:
- Examples using **Official Library [@gamechanger-finance/gc](https://www.npmjs.com/package/@gamechanger-finance/gc)**:
    - [URL](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/URL.txt)
    - [QR (png)](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/QR.png)
    - [QR (svg)](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/QR.svg)
    - [Button](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/button.html)
    - [HTML5 Dapp](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/htmlDapp.html)
    - [ReactJs Dapp](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/reactDapp.html)
    - [ExpressJs Backend](https://github.com/GameChangerFinance/gamechanger/blob/master/examples/expressBackend.js)
- **[70+ full open source example dapps](examples/README.md)**
    - The famous examples included on [Playground, the built-in IDE of GameChanger Wallet](https://beta-wallet.gamechanger.finance/playground)
    - GCScript code
    - HTML5 frontend code using new **Official Library [@gamechanger-finance/gc](https://www.npmjs.com/package/@gamechanger-finance/gc)**, and zero backends!
    - HTML5 frontend code with zero external dependencies, and zero backends!
    - QR code dapp connectors included    
- [gc-contract-app](https://github.com/M2tec/gc-contract-app)
    - educational dapp by **Maarten Menheere** for **Gimbalabs** that shows how **GameChanger Wallet** is like a *PAB for the web*
    - It builds a smart contract on-the-fly using *Helios Language*, 
    - like many GC dapps it does not use backends
- [Inception IDE Beta](https://inception.m2tec.nl/)
    - First stand-alone IDE for building **Cardano** dapps fully online (client side PAB)
    - in browser, no cardano-node deployment required. 
    - on-chain and off-chain code, **Helios Language**, **GCScript** and externaly-built **Plutus Scripts**
    - dapp <--> wallet connections you code here can be used on your own backends and frontends
    - By **Maarten Menheere**. [Github](https://github.com/M2tec/inception)
- [Helios Timelock](https://github.com/GameChangerFinance/cardano-gc-helios-dapp)
    - First dapp on Cardano working from hosted source code stored on-chain. 
    - **The PAB for the web:** Helios smart contract code compiled on-the-fly on GameChanger dapp connections
    - **The big picture behind GameChanger Dapps** explained on-dapp for the Cardano Community
- M2Tec - Hardware and Software Dapps (first hardware dapps on Cardano powered by GameChanger universal dapp connector)
    - [M2Tec Payments](https://payments.m2tec.nl/): POS payment request generator dapp leveraging on an GCFS on-chain open protocol ( [Code on Github](https://github.com/M2tec/gcfs-payments.m2tec.nl) )
    - [M2Tec Gift Wallet Printing Tool](https://gift.m2tec.nl)
    - M2Tec Paypads: Payment devices for stores, with Odoo integration for ADA and native asset payments, loyalty tokens and more.
    - M2Tec Cardano Totem: The first Cardano ATM-like public terminals with built-in stake pool
- GCFS examples (GameChanger On-Chain File System): 
    - [Voting Dapp for Catalyst Proposals](https://gcvoting.netlify.app/catalyst/fund10/102594)
- DJack - Decentralized Email Inbox on Cardano
    - powered by SSI
    - no minting required
- [DCorps - Digital Companies Registry on Cardano](https://www.lidonation.com/zh/proposals/dcorps-digital-companies-registry-registering-your-catalyst-project-on-chain-f10) (GameChanger V1)
- [Dandelion Contributor Portal](https://contrib.dandelion.link) (GameChanger V1)

### Some videos and articles:

- [Do you build Web2.9 or Web3?](https://www.youtube.com/watch?v=cJjI8YBzEs4) - Workshop at UTN Buenos Aires - 30/07/2024 (spanish)
- [NFTPass RareEvo - onboarding on Cardano at scale ](https://www.youtube.com/watch?v=C96IK0qztbo)
- [GCFS - Permapinning files on Cardano forever](https://www.youtube.com/watch?v=tq3Sxuh_XGE)
- [GCFS - Fiat Payroll using Oracles](https://www.youtube.com/watch?v=AMKhjJQH6cI&t=773s) (not focused on solving scheduling!)
- [QR code payment requests - The magic behind M2Tec hardware dapps](https://www.youtube.com/watch?v=cq2YDDuao2o)
- [Is Cardano ecosystem decentralized?](https://forum.cardano.org/t/is-cardano-ecosystem-decentralized/121882)
 

## Resources
- [General Documentation](docs/README.md)
- [How to connect?](https://www.npmjs.com/package/@gamechanger-finance/gc)
- [Beta Release Notes](RELEASE.md)
- [70+ open source example dapps](examples/README.md)
- [Universal Dapp Connector documentation](DAPP_CONNECTOR.md)
- [GCScript documentation](https://beta-wallet.gamechanger.finance/doc/api/v2)
- [Playground IDE in GameChanger Wallet ](https://beta-wallet.gamechanger.finance/playground)
- [Catalyst](catalyst/CATALYST.md)
- [Youtube Tutorials](https://www.youtube.com/@gamechanger.finance)
- [Discord Support](https://discord.gg/vpbfyRaDKG)
- [Twitter News](https://twitter.com/GameChangerOk)
- [Website](https://gamechanger.finance)


## Screenshots

[![GameChanger Wallet v2 Beta](img/mobile1.jpg)](img/mobile1.jpg)
[![GameChanger Wallet v2 Beta](img/mobile2.jpg)](img/mobile2.jpg)
[![GameChanger Wallet v2 Beta](img/desktop1.jpg)](img/desktop1.jpg)
[![GameChanger Wallet v2 Beta](img/desktop2.jpg)](img/desktop2.jpg)


## License

MIT

## Thanks

*Roberto, Maarten, Quasar, Javi and Mati* for all your support


And to voters and **Project Catalyst** for supporting this development and contribute to let us produce and maintain more open source tooling and resources for **Cardano Blockchain**

    
*--- Founder and Dev Adriano Fiorenza*
