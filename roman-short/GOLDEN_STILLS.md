# From Wolf to Golden: 12 stills

Cartoon "2D characters in a 3D world" stills of how the golden retriever came to be.
Code: `src/videos/golden/` (composition `GoldenStills`, one frame per still).
Render: `node scripts/stills.mjs GoldenStills out/golden/final/g_ 0,1,2,3,4,5,6,7,8,9,10,11 1.3333` (1440x2560).

| # | Still | Shot | Era | What it shows |
|---|-------|------|-----|---------------|
| 1 | `g_0` | wolf | Ice Age | A grey wolf howls from a snowy rock at sunset, with a second wolf below |
| 2 | `g_1` | wolfFace | Ice Age | **Face-on:** a wolf stares into the lens while its packmate howls on the rock |
| 3 | `g_2` | camp | Stone Age | A kid shares the fire with a half-tame dog, and a hunter stands behind |
| 4 | `g_3` | campFace | Stone Age | **Face-on:** the early dog sits by the fire, tail wagging, kid cheering |
| 5 | `g_4` | dock | 1700s-1800s Newfoundland | A St. John's water dog trots in with a fish while the fisherman waves |
| 6 | `g_5` | dockFace | 1700s-1800s Newfoundland | **Face-on:** the water dog sits on the dock, tongue out |
| 7 | `g_6` | tweed | 1800s River Tweed | A curly Tweed Water Spaniel on the riverbank with a ghillie |
| 8 | `g_7` | estate | 1868 Guisachan | Sir Dudley Marjoribanks, Nous, Belle and the first four yellow puppies |
| 9 | `g_8` | puppies | 1868 Guisachan | **Face-on:** the puppies lined up in front of Nous and Belle |
| 10 | `g_9` | marsh | Early 1900s | A gamekeeper's golden wades out with a duck at sunset |
| 11 | `g_10` | today | Today | A golden gallops across the lawn with a ball while a kid cheers |
| 12 | `g_11` | goldenFace | Today | **Face-on:** the family golden sits smiling with a ball at its paws |

Facts:
- All dogs come from an ancient wolf population. Dogs and wolves split roughly 15,000-40,000 years ago.
- The Bonn-Oberkassel dog was buried with people about 14,000 years ago.
- The St. John's water dog (Newfoundland), now extinct, is the ancestor of the modern retriever breeds.
- The Tweed Water Spaniel, also extinct, was a curly water dog from the Tweed valley.
- In 1868 at Guisachan, Nous (a yellow wavy-coated retriever) and Belle (a Tweed Water Spaniel) had four yellow puppies: Crocus, Cowslip, Primrose and Ada.
- The Kennel Club recognised the breed in 1911 and named it "Golden Retriever" in 1920.

Character posing options (dog.ts):
- Side view (`drawDog`): stand, sit, walk, run (gallop) or howl; tail wag with motion lines; eyebrows (soft, happy, worried, proud, alert); head tilt; ears fly back when running.
- Face-on view (`drawDogFront`): sit or stand, with the same expressions.

No text is baked into the images, so titles and captions can be added in the editor or the thumbnail tool.
