import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
TEXT = ("Commerçant ? Pas le temps pour Internet ? "
        "Scalify s'occupe de tout. "
        "Votre site, votre fiche Google, vos avis, vos posts. "
        "Et une IA qui répond à vos clients, 24 heures sur 24. "
        "Dès 49 euros par mois, sans rendez-vous. "
        "Les 15 premiers : moins 30 % sur l'annuel. "
        "Scalify. Lien en bio !")
async def main(voice, rate):
    com = edge_tts.Communicate(TEXT, voice, rate=rate, proxy=os.environ.get("HTTPS_PROXY"), boundary="WordBoundary")
    words=[]
    with open("vo.mp3","wb") as f:
        async for ch in com.stream():
            if ch["type"]=="audio": f.write(ch["data"])
            elif ch["type"]=="WordBoundary":
                words.append({"t":ch["offset"]/1e7,"d":ch["duration"]/1e7,"w":ch["text"]})
    json.dump(words,open("words.json","w"),ensure_ascii=False,indent=0)
asyncio.run(main(sys.argv[1], sys.argv[2]))
