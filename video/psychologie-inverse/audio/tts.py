# Voix off « psychologie inverse » (ton pince-sans-rire) + horodatage mot à mot
import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
VOICE = "fr-FR-RemyMultilingualNeural"
LINES = [
 ("v01", "Surtout… ne prenez pas Scalifaï."),
 ("v02", "Gardez votre méthode. Elle marche très bien… pour perdre des clients."),
 ("v03", "Un. Ignorez votre fiche Google."),
 ("v04", "Deux. Ne répondez jamais aux avis."),
 ("v05", "Trois. Gardez votre site de 2009."),
 ("v06", "Quatre. Ne postez rien. Jamais."),
 ("v07", "Cinq. Répondez aux messages… le lendemain."),
 ("v08", "Bravo. Vos clients sont chez le concurrent."),
 ("v09", "Ou alors… Scalifaï s'occupe de tout. 24 heures sur 24."),
 ("v10", "Dès 49 euros par mois. Moins 30 % pour les 15 premiers."),
 ("v11", "Mais rien ne presse. Il ne reste que 15 places."),
 ("v12", "Et surtout… ne cliquez pas sur le lien en bio."),
]
async def one(k, t):
    com = edge_tts.Communicate(t, VOICE, rate="+8%", proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
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
