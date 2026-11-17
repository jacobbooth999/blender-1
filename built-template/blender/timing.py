"""Word timing. Everything in an episode can be anchored to a word so that swapping in a
real voice recording re-times the whole edit.

words.json schema (same as roman-short/voice/words.json):
  {"duration": 18.2, "words": [{"word": "If", "start": 0.10, "end": 0.24, "s": 0}, ...]}

Without a recording, words are estimated from the script text at `wps` words per second
(the format runs ~4 words/s), with short pauses after punctuation.
"""
import json
import re


def auto_words(script, wps=4.0, lead=0.1):
    words, t, s = [], lead, 0
    for tok in re.findall(r"\S+", script):
        core = re.sub(r"[^\w£€$%'-]", "", tok)
        d = max(0.14, (0.6 + 0.08 * len(core)) / wps)
        words.append({"word": tok, "start": round(t, 3), "end": round(t + d, 3), "s": s})
        t += d
        if tok.endswith((".", "!", "?")):
            t += 0.28
            s += 1
        elif tok.endswith((",", ";", ":")):
            t += 0.12
    return {"duration": round(t + 0.3, 3), "words": words}


def load_words(path=None, script=None, wps=4.0):
    if path:
        with open(path) as f:
            return json.load(f)
    if not script:
        raise ValueError("episode needs either 'words' (a words.json path) or 'script' text")
    return auto_words(script, wps)


class Times:
    """Resolves time references:
    3.2 | {"word": 12} | {"word": "chippy"} | {"word": "so", "nth": 2, "edge": "end", "offset": -0.1}
    Text matches ignore case and punctuation; nth counts from 0.
    """

    def __init__(self, words):
        self.w = words["words"]
        self.duration = words["duration"]

    def __call__(self, ref, default=None):
        if ref is None:
            return default
        if isinstance(ref, (int, float)):
            return float(ref)
        i = ref["word"]
        if isinstance(i, str):           # {"word": "chippy", "nth": 1}: match by text
            i = self.find(i, ref.get("nth", 0))
        if i < 0:
            i += len(self.w)
        base = self.w[i]["end" if ref.get("edge") == "end" else "start"]
        return base + ref.get("offset", 0.0)

    def find(self, text, nth=0):
        """Index of the nth word whose letters match `text` (handy when writing episodes)."""
        key = re.sub(r"\W", "", text.lower())
        hits = [i for i, w in enumerate(self.w) if re.sub(r"\W", "", w["word"].lower()) == key]
        return hits[nth]
