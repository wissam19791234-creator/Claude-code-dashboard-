# Voix off (edge-tts) + horodatage mot à mot pour les sous-titres
import asyncio, ssl, os, json, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = "fr-FR-HenriNeural"
LINES = [
 ("l1", "Vous fermez à 19 heures ?"),
 ("l2", "Vos clients, eux, cherchent encore."),
 ("l3", "Et ils finissent chez votre concurrent."),
 ("l4", "Avec Scalifaï, votre commerce répond tout seul. Jour et nuit."),
 ("l5", "Site, fiche Google, avis, réservations."),
 ("l6", "Lancement dans 26 jours."),
]
async def one(k, t):
    com = edge_tts.Communicate(t, VOICE, rate="+4%", pitch="-4Hz", proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
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
