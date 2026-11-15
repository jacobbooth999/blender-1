import { SHOTS, TOTAL } from "../src/videos/rome/story";
console.log("TOTAL", TOTAL);
for (const s of SHOTS) console.log(s.id, s.name, s.a, s.b, Math.round((s.a + s.b) / 2));
