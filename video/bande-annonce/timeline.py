# Découpe les répliques en segments et construit la timeline de la bande-annonce
import json, subprocess
V = json.load(open("vo/lines.json"))
def segs(k, gap=0.6):
    w = V[k]["words"]; out = [[w[0]]]
    for a, b in zip(w, w[1:]):
        if b["t"] - (a["t"] + a["d"]) > gap: out.append([b])
        else: out[-1].append(b)
    return [dict(clip=k, a=max(0, s[0]["t"] - .06), b=s[-1]["t"] + s[-1]["d"] + .14, words=s) for s in out]
plan = []  # (segment, start time)
t = 1.5
def place(k, start, gap=0.32, split=0.6):
    global t
    t = start
    for s in segs(k, split):
        s["at"] = round(t, 3); plan.append(s); t += (s["b"] - s["a"]) + gap
    return t - gap
E = {}
E["present"] = 0.15
end = place("l1", 1.5)
end = place("l2", end + .45, gap=.45)
E["sadEnd"] = end
end = place("l3", end + .55, gap=.3)
E["braam"] = round(end + .45, 3)
end = place("l4", E["braam"] + 1.35)
E["l4"] = plan[-1]["at"]
end = place("l5", end + .45, gap=.28)
E["montage"] = [s["at"] for s in plan if s["clip"] == "l5"]
end = place("l6", end + .5)
E["hope"] = plan[-1]["at"]
E["logo"] = round(end + .45, 3)
end = place("l7", E["logo"] + .55)
end = place("l8", end + .5, gap=.35)
E["launch"] = [s["at"] for s in plan if s["clip"] == "l8"]
end = place("l9", end + .6)
E["follow"] = plan[-1]["at"]
E["end"] = round(end + 1.4, 2)
subs = []
for s in plan:
    subs.append(dict(t=s["at"], e=round(s["at"] + s["b"] - s["a"], 3),
                     text=" ".join(x["w"] for x in s["words"]),
                     words=[dict(w=x["w"], t=round(s["at"] + x["t"] - s["a"], 3)) for x in s["words"]]))
json.dump(dict(E=E, subs=subs), open("timeline.json", "w"), ensure_ascii=False, indent=1)
# piste voix
inp, flt = [], []
for i, s in enumerate(plan):
    inp += ["-i", f"vo/{s['clip']}.mp3"]
    flt.append(f"[{i}:a]atrim={s['a']:.3f}:{s['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={s['b']-s['a']-0.05:.3f}:d=0.05,adelay={int(s['at']*1000)}|{int(s['at']*1000)}[s{i}]")
flt.append("".join(f"[s{i}]" for i in range(len(plan))) + f"amix=inputs={len(plan)}:normalize=0,apad,atrim=0:{E['end']}[out]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", ";".join(flt), "-map", "[out]", "-ar", "48000", "vo_track.wav"], check=True)
print(json.dumps(E))
for s in subs: print(f"{s['t']:6.2f}-{s['e']:6.2f} {s['text']}")
