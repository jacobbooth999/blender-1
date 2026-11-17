# Dustbury EP.1 — script. Each line: (id, text, speed, kinetic emphasis {word: style}). '|' splits caption chunks (<=5 words).
L = [
 ("L1", "I just became mayor | of the worst town | on the internet.", 1.0, {"mayor": "yellow", "worst": "red", "internet.": "caps"}),
 ("L2", "And you | decide | what happens to it.", 0.98, {"you": "yellow", "decide": "caps"}),
 ("L3", "This is Dustbury. | Population: | three.", 0.95, {"Dustbury.": "yellow", "three.": "red"}),
 ("L4", "The fountain | hasn't worked in years. | Now it's just a puddle | with ambitions.", 1.0, {"fountain": "yellow", "puddle": "caps", "ambitions.": "serif"}),
 ("L5", "The streetlights? | Every single one | is dead.", 1.0, {"streetlights?": "yellow", "dead.": "red"}),
 ("L6", "And the town hall... | Honestly, | I work in a tent.", 1.0, {"hall...": "yellow", "tent.": "caps"}),
 ("L7", "But Dustbury | still has people. | Three of them.", 1.0, {"people.": "yellow", "Three": "caps"}),
 ("L8", "Old Rose | has lived here | for eighty years.", 1.0, {"Rose": "yellow", "eighty": "caps"}),
 ("L9", "Gary sleeps | at the bus stop. | The bus stopped coming | years ago.", 1.02, {"Gary": "yellow", "stopped": "red"}),
 ("L10", "And Dot. | Nobody knows | where Dot came from.", 0.98, {"Dot.": "yellow", "Nobody": "caps", "from.": "serif"}),
 ("L11", "Oh, and that building | on the hill? | Nobody goes in there.", 0.94, {"building": "yellow", "hill?": "caps", "Nobody": "red"}),
 ("L12", "We'll get to that.", 0.94, {"that.": "serif"}),
 ("L13", "Here's the problem. | Rose says | if nothing changes, | she's leaving.", 1.0, {"problem.": "caps", "leaving.": "red"}),
 ("L14", "And if Dustbury | hits zero, | it's gone. | Forever.", 0.96, {"zero,": "red", "gone.": "caps", "Forever.": "serif"}),
 ("L15", "We have | one hundred coins. | Enough to fix | one thing.", 1.0, {"hundred": "yellow", "one": "caps"}),
 ("L16", "Option A: | fix the fountain. | Clean water, | and maybe, | a new neighbor.", 1.0, {"A:": "yellow", "fountain.": "caps", "neighbor.": "serif"}),
 ("L17", "Option B: | fix the streetlights, | so Gary | isn't sleeping | in the dark.", 1.0, {"B:": "yellow", "streetlights,": "caps", "dark.": "red"}),
 ("L18", "Comment A or B, | and tell me why. | The best reason | gets a shout-out | next episode.", 1.0, {"A": "yellow", "B,": "yellow", "why.": "caps", "shout-out": "yellow"}),
 ("L19", "Follow, | to see what you built. | Or what you broke.", 0.98, {"Follow,": "caps", "built.": "yellow", "broke.": "red"}),
 ("L20", "Welcome to Dustbury.", 0.95, {"Dustbury.": "yellow"}),
]
import json
json.dump([{"id": i, "text": t.replace(" | ", " "), "voice": "am_adam", "speed": s} for i, t, s, e in L], open("lines.json", "w"), indent=1)
json.dump([{"id": i, "chunks": [c.strip() for c in t.split("|")], "emph": e} for i, t, s, e in L], open("script.json", "w"), indent=1)
print(sum(len(t.replace("|", "").split()) for i, t, s, e in L), "words")
