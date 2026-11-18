# Channel art: "In This Town"

Two 1080×1080 profile pictures, built with the same 3D Dummy rig as the videos. Everything important sits inside the centre circle, so a round crop works.
- `profile_picture_text.png`: the hero with a shocked face and an "IN THIS TOWN" banner.
- `profile_picture_plain.png`: the same hero, closer, with no text. Use this one if the platform shows the name next to the picture anyway.

To re-render (needs `ln -s ../lie-town/node_modules node_modules`):
`PAGE=src/pfp.html node render.mjs stills out/pfp_ 0,1,2,3 1080 1080`
The variants are defined in `V` in `src/pfp.js`.
