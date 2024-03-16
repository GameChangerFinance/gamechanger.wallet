# [GCScript DSL](README.md) / Overview

## Introduction

An innovative Blockchain such as Cardano needs it's own wallet API specification.

Usually when a dapp communicates with a web3 wallet, it calls a set of functions known as the wallet's API.

Since 2021 GameChanger Wallet API specification has taken a different approach from Nami derivatives:
- it encourages dapp designs where they don't mess with user's UTXOs
- it encourages dapp designs where they don't require to ask wallets for addresses, balances and UTXOs 
- it encourages dapp designs where transactions are built by the wallet, not the dapps
- it lets users audit everything a dapp wants to do, EVERYTHING. We do not force users to trust blindly on dapp brands
- it lets users bypass dapps frontend completely, for disaster recovery 
- it works without injecting Javascript code into users websites
- it lets anyone or anything to connect to Cardano, ANYTHING

For these and other reasons the wallet has a Universal Dapp Connector, and such versatile connector needs a versatile API, so in 2022 our dapp connector API turned slightly into a fully featured, flexible and universal programming language called GCScript.

## The GCScript DSL

Communication to GameChanger Wallet is done through scripts coded in a JSON based programming language, a language full of native Cardano-related functions. 

This domain specific language is called GCScript DSL. 

Dapps and other entities (agents) send GCScript (JSON) to the user wallet and receives a JSON response. 

The wallet has a GCScript language interpreter that validates, executes, and returns JSON results to dapps or other calling agents.  

The way GCScripts and their JSON results are packed and shared between agents and wallets is called transport.

## Benefits
 
- supported on all platforms: pure JSON, no binary executable code nor any platform-specific language
    - frontend
    - backend
    - hardware
    - direct user control without a frontend, backend nor hardware as intermediary 
- transport-agnostic: designed to work even non-live, like on bi-directional URL redirection or even QR code based transports
- domain specific: cannot execute logic outside Cardano scope for security reasons 
- non-turing complete: deterministic as possible, minimizes unknown behaviors for security reasons 
- permission-based: our users have total control over the code and wallet response for security reasons 
- open by default: our users can audit and fork any agent <-> wallet communication for security and collaborative reasons 
- privacy-preserving: dapps don't require to know user addresses, balances and UTXOs to function, for privacy and security reasons
- schema-based: the language itself is defined by a JSON schema, for transparency, self-documenting, and collaborative reasons  
- extensible: fully featured, Cardano library out of the box, schema can be extended with new native functions and features
- modular: define reusable code blocks and let anyone import them later
- interoperable: reusable, modular and open third party code allow creating open protocols interfaces
- GCScript ❤️ open-source: open and reusable third party code that can even require a fee upon execution as nowhere seen before in Cardano 

## Basic Properties
- functions calls are JSON objects with at least a type property with function's name as value `"type":"<FUNCTION_NAME>"` 
- functions of `"type":"script"` are code blocks, and can contain other functions inside, recursively.
- function arguments are JSON object properties
- function results are JSON types
- isomorphic: by default a code structure produce a result with the same structure
- result of each block of code is stored on a local cache memory with same isomorphic structure as the former block of code
- arrays and key-value maps are equally valid as "lists" and gets normalized as key-value maps underneath
- each code block can export it results under a custom name defined by the `"exportAs":"<EXPORT_NAME>"`
- variable names can be of any `a..z`,`A..Z`, `0..9` and `_` character, no white-spaces and no other special characters 
- Inline Scripting (ISL): embed lines of a simple Javascript-like language
    - for debugging to dapp connector's console
    - to pass the results of a function as argument of another function
    - to perform encoding, cryptographic, arithmetic, string, system, and other tasks
- Interpreter executes GCScript on 3 stages: 
    - preprocessor
    - runtime
    - postprocessor
- Some functions are available for some stages only, for example external code import functions are preprocessor-only 

## Hello World

*A simple "Hello World" example in GCScript:*
```json
{
    "type": "script",
    "title": "Example",
    "description": "This dapp connection once executed on a wallet will return 'Hello World!' ",
    "exportAs": "myResults",
    "run": {
        "myVariable":{
            "type":"data",
            "value":"Hello World!"
        }
    }
}
```

*and the isomorphic results:*
```json
{
  "exports": {
    "myResults": {
      "myVariable": "Hello World!"
    }
  }
}
```
<details>
  <summary>Do you know Javascript?</summary>

  Here is a free interpretation on how the code would look like in Javascript:

```js
let exports={}

function data(value){
    return value;
}
function script(title,description,exportAs){
    let cache={};
    cache["myVariable"]=data("Hello World!");
    exports[exportAs]=cache;
    return cache;
}

script(
    "Example",
    "This dapp connection once executed on a wallet will return 'Hello World!'",
    "myResults");

```


</details>



Previous: [GCScript DSL](README.md) | Next: [Quick Start](quick-start.md)