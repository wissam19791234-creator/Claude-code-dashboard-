# Voix off du cartoon + horodatage mot à mot (sous-titres)
import asyncio, ssl, os, json, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = "fr-FR-RemyMultilingualNeural"
LINES = [
 ("l1", "Voici Marc. Il tient sa boulangerie… et tout le reste."),
 ("l2", "Son site. Sa fiche Google. Ses avis. Insta. Les messages…"),
 ("l3", "Résultat : il n'en peut plus !"),
 ("l4", "Alors on a créé Scalifaï."),
 ("l5", "Scalifaï s'occupe de tout ça, à sa place."),
 ("l6", "Et Marc ? Il s'occupe enfin de ses clients."),
 ("l7", "Scalifaï. Lancement dans 23 jours. Les 15 premiers ont moins 30 %."),
]
async def one(k, t):
    com = edge_tts.Communicate(t, VOICE, rate="+6%", pitch="+3Hz", proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
    words = []
    with open(f"vo/{k}.mp3", "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "w": ch["text"]})
    return words
async def main():
    out = {}
    for k, t in LINES: out[k] = {"text": t, "words": await one(k, t)}
    json.dump(out, open("vo/lines.json", "w"), ensure_ascii=False, indent=0)
asyncio.run(main())
