# Script template: "problem → fix" explainer short

A 45–55 s vertical short that explains how an everyday institution works by "building" it one
problem at a time. These are general techniques. Write your own topics, cast, tagline and jokes;
don't reuse another creator's lines or catchphrases.

## Skeleton (~190–220 words, read at ~4 words/s)

```
HOOK      If you <cynical, literal one-line definition>, you've got <X>.
ROUND ×6–8
          But <problem>.
          So <fix>.
          [This is the <real name of the fix>.]      ← naming beat, gets a "label" sticker
CTA       (55–85% through) a follow request written as a punchline inside a round
BUTTON    Add <real thing>, <real thing> and <absurd thing>, so <punchline>.
TAGLINE   <your own closing line>. <X>.             ← the last word should run back into the hook
```

## Rules of thumb
- **First word at 0.1 s.** No intro or logo. The first shot shows the hook line literally.
- **Every fix is real.** Look up the actual rule, law, number or term (and note the source). The comedy works because the logic is true.
- **One gag every 3–4 s.** If a round has no joke, cut it or give it one.
- **Be specific to a place.** Name local shops, roads and habits your audience will recognise.
- **A recurring cast member is the running gag** (in our cast, `gaz` always wants the wrong thing). Call back to them.
- **Rule of three in the button**, with the absurd item last.
- **Loop it.** End on the same picture you opened on, and make the last spoken word lead back into the first.

## Mapping script to the episode file
| Script beat | Episode field |
|---|---|
| Each "But" / "So" sentence | usually a new shot: `"start": {"word": "But", "nth": 1}` |
| Naming beat "This is the…" | `stickers: [{"kind": "label"}]`, or `"win"` when it's the fix working |
| Bad news (refused, wrong, warm) | `stickers: [{"kind": "bad"}]` |
| A rule or law | `stickers: [{"kind": "rule"}]` plus an `insert` card quoting it |
| Follow request | `stickers: [{"kind": "cta", "text": "TAP FOLLOW"}]` |
| A character's one-liner | `bubbles: [{"text": "OI!"}]` |
| Something that keeps changing (score, price, count, time) | an `insert` card with timed rows, or `counters` |

## Blank to fill in
```
If you ______________________________, you've got ________.
But ______________________. So ______________________. This is the __________.
But ______________________. So ______________________.
But ______________________. So ______________________. This is the __________.
But ______________________. So ______________________. (+ follow joke)
But ______________________. So ______________________. This is the __________.
Add ________, ________ and ________, so ______________________.
<tagline>. ________.
```
