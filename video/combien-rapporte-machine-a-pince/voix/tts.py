# Synthèse edge-tts d'une phrase : python3 tts.py voix rate "texte" sortie.mp3
import asyncio, ssl, os, sys, edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")
async def say(voice, rate, txt, out):
    for k in range(4):
        try:
            await edge_tts.Communicate(txt, voice, rate=rate, proxy=os.environ.get("HTTPS_PROXY")).save(out); return
        except Exception as e:
            print('retry', e, file=sys.stderr); await asyncio.sleep(2 ** k)
    raise SystemExit('tts failed')
if __name__ == '__main__':
    asyncio.run(say(*sys.argv[1:5]))
