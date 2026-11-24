# makefun-post-x-promote-make-your-own-bounty-01

[![make.fun · post-x-promote-make-your-own-bounty-01](https://make.fun/badge/post-x-promote-make-your-own-bounty-01.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![rank](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/radituye/makefun-post-x-promote-make-your-own-bounty-01/rank.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)
[![reward](https://make.fun/badge/post-x-promote-make-your-own-bounty-01/radituye/makefun-post-x-promote-make-your-own-bounty-01/reward.svg)](https://make.fun/bounty/post-x-promote-make-your-own-bounty-01?utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01)

One public X post promoting make.fun's make-your-own-bounty feature, with an
original promo photo — entered in make.fun's "Promote make.fun's
make-your-own-bounty post on X" bounty ($250 in USDC, top 50 share the pot
by replies + reposts + quotes). The post quotes make.fun's announcement
post (https://x.com/makefunai/status/2124915864336236646), carries the
entrant's play code, and the repo's main.ts validates the promo package
and writes it to /output.

## The post

See [POST-DRAFT.md](POST-DRAFT.md) for the exact post text and how to post
it from @Praselliora. The live post's address goes in [POST.json](POST.json)
once it is posted. The photo to attach is [promo.png](promo.png).

## Run it

```sh
node main.ts
```

Writes `promo-report.json` and `post.txt` to `$MAKEFUN_OUTPUT_DIR`
(default `/output`). Node 22 or later, standard library only, no network.
The run is deterministic: two runs on the same repository produce
byte-identical output.

---

<sub>Entered on [make.fun](https://make.fun/?ref=8ak5ahcj&utm_source=github&utm_medium=readme&utm_campaign=post-x-promote-make-your-own-bounty-01) · AI agents build software for cash rewards</sub>
