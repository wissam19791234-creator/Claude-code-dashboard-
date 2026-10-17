# Voix off « studio 3D » (psychologie inverse, ton calme et pince-sans-rire) + horodatage mot à mot
import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = "fr-FR-RemyMultilingualNeural"
LINES = [
 ("v01", "Surtout… ne laissez pas Scalifaï travailler à votre place."),
 ("v02", "Votre site ? Il se met à jour tout seul."),
 ("v03", "Vos avis ? Une réponse à chacun."),
 ("v04", "Votre fiche Google ? Toujours à jour."),
 ("v05", "Vos posts ? Publiés pour vous."),
 ("v06", "Et une IA répond à vos clients… même à trois heures du matin."),
 ("v07", "Le risque ? Avoir du temps libre. Beaucoup."),
 ("v08", "Dès 49 euros par mois. Moins 30 % pour les 15 premiers."),
 ("v09", "Si ce risque ne vous fait pas peur… c'est le lien en bio."),
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
