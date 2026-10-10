# Voix off de la pub isométrique + horodatage mot à mot
import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "fr-FR-VivienneMultilingualNeural"
LINES = [
 ("v1", "Vos clients vous cherchent en ligne… mais le chemin jusqu'à vous est coupé."),
 ("v2", "Scalifaï relie vos clients à votre commerce."),
 ("v3", "On gère votre site. Votre fiche Google. Vos avis. Vos posts."),
 ("v4", "Et une IA répond à vos clients, jour et nuit."),
 ("v5", "Le tout, dès 49 euros par mois."),
 ("v6", "Lancement le 2 novembre : moins 30 % sur l'annuel pour les 15 premiers."),
 ("v7", "Scalifaï. Réservez votre place."),
]
async def one(k, t):
    com = edge_tts.Communicate(t, VOICE, rate="+4%", proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
    words = []
    with open(f"vo/{k}.mp3", "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append({"t": round(ch["offset"] / 1e7, 3), "d": round(ch["duration"] / 1e7, 3), "w": ch["text"]})
    return words
async def main():
    out = {}
    for k, t in LINES: out[k] = {"text": t, "words": await one(k, t)}
    json.dump(out, open("vo/lines.json", "w"), ensure_ascii=False, indent=0)
asyncio.run(main())
