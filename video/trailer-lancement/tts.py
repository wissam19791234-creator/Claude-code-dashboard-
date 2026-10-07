# Voix off française, calme et grave (edge-tts)
import asyncio, ssl, os, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
L = {"v1": "Vos données vous parlent déjà.", "v2": "Il est temps de les écouter."}
async def main():
    for k, t in L.items():
        await edge_tts.Communicate(t, "fr-FR-HenriNeural", rate="-14%", pitch="-9Hz", proxy=os.environ.get("HTTPS_PROXY")).save(f"vo/{k}.mp3")
asyncio.run(main())
