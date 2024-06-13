# [GCScript DSL](README.md) / Syntax

## Syntax

Everything on GCScript are function calls. A main function call, and it's nested function calls. Recursively.

## Functions

In GCScript a function call is a JSON object with a `type` property. It's value is the name of the function. All the other properties are argument names defined function declarations, and their values are the argument values passed to each function.

*Example of a function call without arguments:*
```json
{
    "type": "getCurrentAddress",
}
```
*The [getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html) function returns current wallet address and has no arguments.*


*Example of a function call with an argument named `value`:*
```json
{
    "type":"data",
    "value":[
        "foo",
        "bar",
        "baz",
        true,
        null,
        {"nested":{"object":{"inside":"here"}}}
    ]
}
```
*The [data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html) function returns the JSON type passed as `value` argument, and allows you to define a constant.*


## Blocks of Code

In GCScript a container structure with nested function calls, a block of code, is defined by calling the `script` function.
The body, the nested code, is a key-value map (or list) of function calls passed on the `run` argument.

*Example of a block of code:*
```json
{
    "type": "script",
    "run":{
        "result01":{"type":"data", "value":"A"},
        "result02":{"type":"data", "value":"B"},
        "result03":{"type":"data", "value":"C"}
    }
}
```
[![Run on Cardano Mainnet](../img/btn/run-mainnet.png)](https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUSoqzVOyqlYqSi0uzSkxMASxoUpSEksSgQrKEnNKQVxHpVodmDIj3MqckJQZ41bmrFRbWwsADPc3hI4AAAA) 
[![Run on Cardano Pre-Production Testnet](../img/btn/run-preprod.png)](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUSoqzVOyqlYqSi0uzSkxMASxoUpSEksSgQrKEnNKQVxHpVodmDIj3MqckJQZ41bmrFRbWwsADPc3hI4AAAA) 


<a href="https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUSoqzVOyqlYqSi0uzSkxMASxoUpSEksSgQrKEnNKQVxHpVodmDIj3MqckJQZ41bmrFRbWwsADPc3hI4AAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-mainnet.png" alt="Run on Cardano Mainnet" style="border:none;">
</a>
<a href="https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUSoqzVOyqlYqSi0uzSkxMASxoUpSEksSgQrKEnNKQVxHpVodmDIj3MqckJQZ41bmrFRbWwsADPc3hI4AAAA" target="_blank" onclick="window.open(this.href, 'dapp connection', 'width=400,height=600'); return false;" style="text-decoration:none; outline:none;">
 <img src="../img/btn/run-preprod.png" alt="Run on Cardano Pre-Production Testnet" style="border:none;">
</a>

🔍 *See also:*
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html),
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html)

*But this is the result of that code:*
```json
{
  "exports": {}
}
```
Why `exports` is empty? Have I done something wrong?

Locally, a block of code, (and descendants) has a cache, a local scope memory space where child function calls store their results.

This `cache` object is isomorphic (unless instructed otherwise) with the code structure itself, it means it keeps the same structure as the block of code that populates it with results during runtime execution.

Globally, the entire script has a unique `exports` object, and only what gets stored there is going to be returned back to dapp or caller agent.

Each block of code can export it's `cache` contents into this `exports` object.

So in other terms, in order to return data from script execution back to a dapp for example, data needs to be exported from the local `cache`s into the unique global `exports` object. This can be done by passing an `exportAs` property with a name for those exports, like this:

*Example of a block of code with exports:*
```json
{
    "type": "script",
    "exportAs":"myFirstExport",
    "run":{
        "result01":{"type":"data", "value":"A"},
        "result02":{"type":"data", "value":"B"},
        "result03":{"type":"data", "value":"C"}
    }
}
```
[![Run on Cardano Mainnet](../img/btn/run-mainnet.png)](https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUUqtKMgvKnEsBorlVrplFhWXuIJFgFJFpXlKVtVKRanFpTklBoYgNlR3SmJJIlBBWWJOKYjrqFSrA1NmhFuZE5IyY9zKnJVqa2sBUKAziakAAAA) 
[![Run on Cardano Pre-Production Testnet](../img/btn/run-preprod.png)](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUUqtKMgvKnEsBorlVrplFhWXuIJFgFJFpXlKVtVKRanFpTklBoYgNlR3SmJJIlBBWWJOKYjrqFSrA1NmhFuZE5IyY9zKnJVqa2sBUKAziakAAAA) 

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

*and now these are the expected results:*
```json
{
  "exports": {
    "myFirstExport":{
        "result01":"A",
        "result02":"B",
        "result03":"C"
    }
  }
}
```

Finally, at root level there is always a `script` function call containing all the others functions nested inside, like the usual `main()` function in C language. 

This root `script` function call has some unique superpowers, for example it can instruct the wallet where to send the results back, this can be done by setting the `returnURLPattern` property:

*Example of a block of code exporting data back to a URL:*
```json
{
    "type": "script",
    "exportAs":"myFirstExport",
    "returnURLPattern":"https://google.com/dappCallExecutionResults/{result}/view",  
    "run":{
        "result01":{"type":"data", "value":"A"},
        "result02":{"type":"data", "value":"B"},
        "result03":{"type":"data", "value":"C"}
    }
}
```
[![Run on Cardano Mainnet](../img/btn/run-mainnet.png)](https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA3WOywqDMBBF_2XW0vSxc2fFrroQoR8QdLCBaMJkYhXJvzexLXTj7s65h8uswItFyMG1pCxDBjhbQ1y4yIblpshxtZFYEbKn8dHca8mMNEblyWxdLkRvTK_x0JpBdNLaUmpdzdh6VmZs0HnNTqy0hSAmha805-PCCh96PKX8faaTLKMwSe3TWUDIftp5X7v-aZd9rYQQwhtx5c2P-AAAAA) 
[![Run on Cardano Pre-Production Testnet](../img/btn/run-preprod.png)](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA3WOywqDMBBF_2XW0vSxc2fFrroQoR8QdLCBaMJkYhXJvzexLXTj7s65h8uswItFyMG1pCxDBjhbQ1y4yIblpshxtZFYEbKn8dHca8mMNEblyWxdLkRvTK_x0JpBdNLaUmpdzdh6VmZs0HnNTqy0hSAmha805-PCCh96PKX8faaTLKMwSe3TWUDIftp5X7v-aZd9rYQQwhtx5c2P-AAAAA) 

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

*and then results will be packed and shared back to that dapp by redirecting the user to the produced URL*
```json
"https://google.com/dappCallExecutionResults/1-H4sIAAAAAAAAA6tWSq0oyC8qKVayqlbKrXTLLCoucQWLgASKUotLc0oMDJWslByVdGBcIyDXCcE1BnKdlWprawHx4ftoTAAAAA/view"
```

*Important:* this redirection only gets enabled if initial dapp->wallet communication was established from an `https` origin.

## Isomorphism

We can understand isomorphism better by nesting some code blocks and check results.

*Example of isomorphism with nested blocks of code:*
```json
{
    "type": "script",
    "exportAs":"myNestedExport",
    "run":{
        "groupA":{
            "type": "script",
            "run":{
                "result01":{"type":"data", "value":"A"},
                "result02":{"type":"data", "value":"B"},
                "result03":{"type":"data", "value":"C"}
            }
        },
        "groupB":{
            "type": "script",
            "run":{
                "result01":{"type":"data", "value":"A"},
                "result02":{"type":"data", "value":"B"},
                "result03":{"type":"data", "value":"C"}
            }
        },
        "groupC":{
            "type": "script",
            "run":{
                "result01":{"type":"data", "value":"A"},
                "result02":{"type":"data", "value":"B"},
                "result03":{"type":"data", "value":"C"}
            }
        }             
    }
}
```
[![Run on Cardano Mainnet](../img/btn/run-mainnet.png)](https://beta-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUUqtKMgvKnEsBorlVvqlFpekpriChYByRaV5SlbVSulF-aUFjiAWumaogqLU4tKcEgNDJCUpiSWJQAVliTmlIK6jUq0OTJkRbmVOSMqMcStzVqqtBSoEu8tpkLrLebC5q7YWAIJYiqH9AQAA) 
[![Run on Cardano Pre-Production Testnet](../img/btn/run-preprod.png)](https://beta-preprod-wallet.gamechanger.finance/api/2/run/1-H4sIAAAAAAAAA6tWKqksSFWyUipOLsosKFHSUUqtKMgvKnEsBorlVvqlFpekpriChYByRaV5SlbVSulF-aUFjiAWumaogqLU4tKcEgNDJCUpiSWJQAVliTmlIK6jUq0OTJkRbmVOSMqMcStzVqqtBSoEu8tpkLrLebC5q7YWAIJYiqH9AQAA) 

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)

*and the isomorphic results:*
```json
{
  "exports": {
    "myNestedExport": {
      "groupA": {
        "result01": "A",
        "result02": "B",
        "result03": "C"
      },
      "groupB": {
        "result01": "A",
        "result02": "B",
        "result03": "C"
      },
      "groupC": {
        "result01": "A",
        "result02": "B",
        "result03": "C"
      }
    }
  }
}
```
## Lists normalization

Usually GCScript turns lists into key-value maps to make lists and maps equally valid.

*Example of a block of code as a list:*
```json
{
    "type": "script",
    "exportAs":"myWalletData",
    "run":[
        {"type":"getName"},
        {"type":"getCurrentAddress"},
        {"type":"getCurrentSlot"}
    ]
}
```
🔍 *See also:*
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


*The [getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html) function returns current wallet name and has no arguments.*

*The [getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html) function returns current wallet address and has no arguments.*

*The [getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html) function returns current blockchain slot number and has no arguments.*

Now because underneath lists are normalized into key-value maps with item indexes as map keys, we can do this:

*Example of a block of code as a key-value map:*
```json
{
    "type": "script",
    "exportAs":"myWalletData",
    "run":{
        "0":{"type":"getName"},
        "1":{"type":"getCurrentAddress"},
        "2":{"type":"getCurrentSlot"}
    }
}
```

🔍 *See also:*
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


*And in both cases, results will be exactly the same:*
```json
{
  "exports": {
    "myWalletData": {
      "0": "Default",
      "1": "addr_test1qqptd68g4yzkrtn38srqvkk78c3stkvw4wvvsqsmaanny7adqwj2u3djrag0mene2cm9elu5mdqmcz9zc2rzgq7c5g6q5rgrg5",
      "2": "54762728"
    }
  }
}
```

GCScript normalize lists as key-value map, because among other reasons, key-value maps are the preferred structure on this language. Why you may ask?

Well because of the great self-documenting properties a block of code expressed as key-value map has to offer.

Let's self document this code better:

*Example of a self-documented block of code as key-value map:*
```json
{
    "type": "script",
    "exportAs":"myWalletData",
    "run":{
        "name":     {"type":"getName"},
        "address":  {"type":"getCurrentAddress"},
        "slot":     {"type":"getCurrentSlot"}
    }
}
```

🔍 *See also:*
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


*and this time results are, well, self-documented and isomorphic:*
```json
{
  "exports": {
    "myWalletData": {
      "name":       "Default",
      "address":    "addr_test1qqptd68g4yzkrtn38srqvkk78c3stkvw4wvvsqsmaanny7adqwj2u3djrag0mene2cm9elu5mdqmcz9zc2rzgq7c5g6q5rgrg5",
      "slot":       "54762728"
    }
  }
}
```

## Anatomy of the interpreter

From last example, we can say that the object properties `name`,`address` and `slot` are variables, and each one will store the result of each of it's functions being called.

To be more specific GCScript is actually doing underneath something like this javascript code:
```js

let exports={}

function script(exportAs){
    let cache={}
    cache["name"    ]= getName();
    cache["address" ]= getCurrentAddress();
    cache["slot"    ]= getCurrentSlot();

    if(exportAs!==undefined)
        exports[exportAs]=cache;
    
    return cache
}
```

Results of each function call within a block (or descendants blocks ) will be stored on an internal `cache` object, or local memory space.

Remember that only when you use the `exportAs` property you are telling the interpreter to export this local state to the outer world.

Understanding this internal logic is important because this will be the key for you to access these variables/results for later reuse and to break the default isomorphism in order to customize your results.

## Breaking the default isomorphism

"Today I woke up and decided that I hate your isomorphism and I want to cherry-pick my exports carefully, leaving behind some data.
Can i break the default isomorphism?"

Well yes, you can!

The solution is to set the mode in which each `script` function returns it's results from it's own `cache` memory. This can be done by setting the `return` property.

The `return` property can take these options and each one alters the code block results in different ways:


| Option  | Description  |
| :------ | :----------- |
| `{"mode":"all"}` | Will return all it children code block results. This is the default isomorphic behavior |
| `{"mode":"none"}` | Will return `undefined`, and because is not a valid JSON value it will be purged. Like a `function():void;` in typescript |
| `{"mode":"first"}` | Will return the result of it's first child code block. |
| `{"mode":"last"}` | Will return the result of it's last child code block. |
| `{"mode":"one", "key":"<CHILD_KEY>"}` | Will return the result of one child code block, the one in the `key` name or position argument. |
| `{"mode":"some","keys":[<CHILD_KEY1>,<CHILD_KEY2>,...,<CHILD_KEY_N>]}` | Will return the result of some children code blocks, the ones in the `keys` name or position list argument. |
| `{"mode":"macro","exec":"<ISL>"}` | Will return the result of the execution of an inline scripting language macro. Useful for formatting, debugging results |


Lets explore all these on an example, but we will leave explanations for the `macro` mode for later.

```json
{
    "type": "script",    
    "title": "Return modes example",
    "description": "Learning all the return modes",    
    "return": {
        "mode": "all"
    },
    "exportAs":"starfleetMuseum",
    "run": {
        "none": {
            "type": "script",
            "return": {
                "mode": "none"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "all": {
            "type": "script",
            "return": {
                "mode": "all"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "first": {
            "type": "script",
            "return": {
                "mode": "first"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "last": {
            "type": "script",
            "return": {
                "mode": "last"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "one": {
            "type": "script",
            "return": {
                "mode": "one",
                "key": "C"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "some": {
            "type": "script",
            "return": {
                "mode": "some",
                "keys": [
                    "B",
                    "D"
                ]
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        },
        "isl": {
            "type": "script",
            "return": {
                "mode": "macro",
                "exec": "{get('cache.isl.C')}"
            },
            "run": {
                "A": {
                    "type": "data",
                    "value": "USS Enterprise A"
                },
                "B": {
                    "type": "data",
                    "value": "USS Enterprise B"
                },
                "C": {
                    "type": "data",
                    "value": "USS Enterprise C"
                },
                "D": {
                    "type": "data",
                    "value": "USS Enterprise D"
                },
                "E": {
                    "type": "data",
                    "value": "USS Enterprise E"
                }
            }
        }
    }
}
```

🔍 *See also:*
[data](https://beta-wallet.gamechanger.finance/doc/api/v2/data.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


*and the results:*
```json
{
  "exports": {
    "starfleetMuseum": {
      "all": {
        "A": "USS Enterprise A",
        "B": "USS Enterprise B",
        "C": "USS Enterprise C",
        "D": "USS Enterprise D",
        "E": "USS Enterprise E"
      },
      "first": "USS Enterprise A",
      "last": "USS Enterprise E",
      "one": "USS Enterprise C",
      "some": {
        "B": "USS Enterprise B",
        "D": "USS Enterprise D"
      },
      "isl": "USS Enterprise C"
    }
  }
}
```

## Blocks of Code with user defined arguments

Same like on other languages, you can pass arguments to a user-defined function or block of code and they will exist on that local scope context for the contained code to consume them.

*Example of passing a single user-defined argument on a block of code:*
```json
{
    "type": "script",
    "args": "Hey, I'm an argument!",
    "exportAs":"myWalletData",
    "run":{
        "name":     {"type":"getName"},
        "address":  {"type":"getCurrentAddress"},
        "slot":     {"type":"getCurrentSlot"}
    }
}
```

🔍 *See also:*
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


also you can pass arguments differently by passing one argument to each children function call individually

*Example of passing a user-defined argument per child function call on a block of code:*
```json
{
    "type": "script",
    "argsByKey": {
        "name":     "Hey, I'm name's argument!",
        "address":  "Hey, I'm address's argument!",
        "slot":     "Hey, I'm slot's argument!"
    },
    "exportAs":"myWalletData",
    "run":{
        "name":     {"type":"getName"},
        "address":  {"type":"getCurrentAddress"},
        "slot":     {"type":"getCurrentSlot"}
    }
}
```

🔍 *See also:*
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


also both techniques work together if combined in such a way that if a child argument has not been provided to `argsByKey`, `args` value will be passed by default as a fallback

*Example of passing a user-defined argument per child function call and a fallback on a block of code:*
```json
{
    "type": "script",
    "args": "Hey, I'm slot's argument!",
    "argsByKey": {
        "name":     "Hey, I'm name's argument!",
        "address":  "Hey, I'm address's argument!",
    },
    "exportAs":"myWalletData",
    "run":{
        "name":     {"type":"getName"},
        "address":  {"type":"getCurrentAddress"},
        "slot":     {"type":"getCurrentSlot"}
    }
}
```

🔍 *See also:*
[getName](https://beta-wallet.gamechanger.finance/doc/api/v2/getName.html),
[getCurrentAddress](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentAddress.html),
[getCurrentSlot](https://beta-wallet.gamechanger.finance/doc/api/v2/getCurrentSlot.html),
[script](https://beta-wallet.gamechanger.finance/doc/api/v2/api.html)


How to access and use these arguments, the cache memory, and other topics will be addressed once you get to know how to code on GCScript's Inline Scripting Language (ISL).

## Full API documentation

"I can't wait to build something on Cardano, give me all the available functions, now!"

Ok, here you have them:

| Network  | API Documentation  |
| :------ | :----------- |
| Cardano Mainnet | [HTML Docs](https://beta-wallet.gamechanger.finance/doc/api/v2) |
| Cardano Pre Production Testnet | [HTML Docs](https://beta-preprod-wallet.gamechanger.finance/doc/api/v2) |

Remember that GCScript DSL is a language defined by a JSON schema, so here are the latest auto-generated docs, self-hosted on the wallet itself. Schema between networks are the same but maybe some examples will change based on each one in the future.


Previous: [Quick Start](quick-start.md)  | Next: [GCScript on Steroids: with Inline Scripting Language (ISL)](ISL.md)