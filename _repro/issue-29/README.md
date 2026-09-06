# Issue #29 — minimal reproductions

Two GCScripts that reproduce the submission error

```
All inputs are spent. Transaction has probably already been included
```

in its **two distinct causes**. They are diagnostic artifacts for
[issue #29](https://github.com/GameChangerFinance/gamechanger.wallet/issues/29),
not example dapps — they are deliberately kept out of `examples/`.

## How to run

1. Open the [Playground IDE](https://wallet.gamechanger.finance/playground) on **preprod**.
2. Use a burner wallet funded from the [preprod faucet](https://docs.cardano.org/cardano-testnets/tools/faucet).
   For case B, a wallet with a **single UTXO** makes the collision deterministic.
3. Paste one script, `Run ▸`, and record the exported `report` block.

Both scripts submit with `noFail: true` and `extras: true`, so the node's
per-transaction `status`, `txHash` and `error` are returned instead of halting
the script — the pattern already demonstrated in
`examples/Submit 3 transactions and report errors.gcscript`.

## Case A — `Repro 29A - Resubmit same signed transaction.gcscript`

The **same signed CBOR** is submitted twice. This is what a dapp reload, a
browser back-navigation or a re-run of the same GCScript URL does in practice.

| | Expected today | Expected after a fix |
|---|---|---|
| `first` | success, `txHash` returned | unchanged |
| `again` | error *"All inputs are spent…"* | **success**, resolving with the same `txHash` |

Nothing failed: the intent was already fulfilled. Surfacing this as an error is
what makes generated dapps look broken after a refresh.

## Case B — `Repro 29B - Two transactions built on the same UTXO view.gcscript`

**Two different transactions** are built *before* either is submitted, so both
run coin selection against the same, not-yet-updated UTXO view and both claim
the same input.

| | Expected today | Expected after a fix |
|---|---|---|
| `one` | success, `txHash` returned | unchanged |
| `two` | error *"All inputs are spent…"* | error, but reported as **retryable — rebuild required** |

This one is a real failure. Resubmitting the same CBOR can never succeed; only
rebuilding can.

## The diagnostic that separates them

Take the `txHash` of the failing submission and look it up on an explorer
([preprod cardanoscan](https://preprod.cardanoscan.io/)):

- **on-chain** → case A, the transaction was already included;
- **absent** → case B, the inputs were consumed by a *different* transaction.

## Notes

- Both scripts use `noFail`, which is documented in the live
  [v2 API reference](https://wallet.gamechanger.finance/doc/api/v2/submitTxs.html)
  but is **absent from the schema snapshot bundled in this repository**
  (`release/2.4.18/schema/api/v2/index.json.full` lists only
  `extras`, `mode`, `namePattern`, `txs`, `type`). See the API-drift issue.
- `mode: "sequential"` is used on purpose: it waits for each submission before
  starting the next, which is what makes the ordering of the two outcomes
  deterministic. `mode: "noWait"` produces the same error non-deterministically.
