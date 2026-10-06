import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "fr-FR-HenriNeural"
LINES = [
 ("l1", "Chaque matin, ils lèvent le rideau."),
 ("l2", "Chaque soir, ils le baissent. Épuisés."),
 ("l3", "Les avis sans réponse. Les posts oubliés. Les clients qui partent ailleurs."),
 ("l4", "Et si quelqu'un s'occupait de tout ?"),
 ("l5", "Votre site. Votre fiche Google. Vos avis. Vos réseaux. Une IA, jour et nuit."),
 ("l6", "Bientôt, votre commerce ne dormira plus jamais."),
 ("l7", "Scalifaï."),
 ("l8", "Lancement imminent. Quinze places fondateurs."),
 ("l9", "Abonnez-vous."),
]
async def one(k, t):
    com = edge_tts.Communicate(t, VOICE, rate="-6%", pitch="-6Hz", proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
    words = []
    with open(f"vo/{k}.mp3", "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append({"t": ch["offset"]/1e7, "d": ch["duration"]/1e7, "w": ch["text"]})
    return words
async def main():
    out = {}
    for k, t in LINES: out[k] = {"text": t, "words": await one(k, t)}
    json.dump(out, open("vo/lines.json", "w"), ensure_ascii=False, indent=0)
asyncio.run(main())
