import asyncio, ssl, os, json, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
TEXT = ("Trois heures du matin. Vous dormez, "
        "et votre commerce, lui, bosse. "
        "Voici tout ce que Scalify fait pour vous : "
        "site internet, fiche Google, avis, réseaux sociaux, "
        "IA vingt-quatre heures sur vingt-quatre, relances automatiques, pub Google et Instagram, "
        "standard téléphonique, devis, commande en ligne, réservations, carte de fidélité, vidéos TikTok, boutique en ligne. "
        "Vous ? Deux minutes par semaine, sur WhatsApp. "
        "Dès 49 euros par mois. "
        "Lancement dans 30 jours : les 15 premiers ont moins 30 %. "
        "Abonnez-vous !")
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
