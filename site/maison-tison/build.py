import base64, json, os, sys
d=os.path.dirname(os.path.abspath(__file__))
s=open(f"{d}/src.html").read()
imgs={}
for f in sorted(os.listdir(f"{d}/img")):
    if f.endswith(".jpg"):
        imgs[f[:-4]]="data:image/jpeg;base64,"+base64.b64encode(open(f"{d}/img/{f}","rb").read()).decode()
s=s.replace("<script>/*IMAGES*/</script>","<script>window.TISON_IMG="+json.dumps(imgs)+"</script>")
os.makedirs(f"{d}/dist",exist_ok=True)
open(f"{d}/dist/maison-tison.html","w").write(s)
wrap='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);color-scheme:light}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+s+'</body></html>'
open(f"{d}/dist/index.html","w").write(wrap)
print(len(s)//1024,"KB")
