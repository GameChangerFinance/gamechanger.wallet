# Issue #29 — minimal reproductions

Issue: [#29 — *Submission error: "All inputs are spent. Transaction has probably already been included"*](https://github.com/GameChangerFinance/gamechanger.wallet/issues/29)

The same error message covers two situations that need opposite handling. These two
scripts separate them, so the report is about a behaviour and not about one bad run.

| | Repro 29A | Repro 29B |
|---|---|---|
| What happens | the **same signed transaction** is submitted twice | **two different transactions** are built on the same UTXO view, then both submitted |
| Real-world cause | a dapp reload, a browser back button, a re-run of the same GCScript URL, a retry after a timeout | two flows racing, or a user acting twice before the first transaction settles |
| Was the user's intent fulfilled? | **yes**, by the first submission | **no**, the second intent is lost |
| Failing `txHash` on an explorer | **present** — it is on chain | **absent** — it was never accepted |
| Right handling | report a success carrying the tx hash; the error is misleading | report the error; only a rebuild can fix it |

**That last row is the diagnostic.** Take the `txHash` of the failing submission and look it
up on a preprod explorer. On chain means case A. Absent means case B.

## Running them

Playground IDE, **preprod**, a funded test wallet. Both scripts only pay ~1 ADA to the
wallet's own current address, so nothing leaves the wallet apart from fees.

Both use `submitTxs` with `noFail: true` and `extras: true`, so each submission reports its
own `status`, `txHash` and `error` in `txsExtended` instead of halting the script — the
pattern already shipped in `examples/Submit 3 transactions and report errors.gcscript`.

### Repro 29A — Resubmit same signed transaction

One transaction, signed once, submitted twice.

- `firstStatus` should be a success and `firstTxHash` should equal `builtTxHash`.
- `secondStatus` fails with *All inputs are spent…* while `secondTxHash` is the very same
  hash that just succeeded.

Both submissions carry the same hash: the second call cannot create a second transaction,
it can only re-announce one that already exists. This is the case where the error is
misleading — the intent behind the request was already fulfilled.

### Repro 29B — Two transactions built on the same UTXO view

Two transactions, built before either is submitted, differing only by one lovelace so their
hashes differ while their coin selection does not.

- `firstBuiltTxHash` and `secondBuiltTxHash` differ.
- `firstStatus` succeeds; `secondStatus` fails with the same message.
- The second hash is nowhere on chain.

Here the error is accurate. Resubmitting the same CBOR will never work; the second
transaction has to be rebuilt against a fresh UTXO view.

## Why this folder and not `examples/`

These are diagnostics attached to an issue, not example dapps. They are deliberately kept
out of `examples/` so that no generated documentation or dapp is produced from them.
