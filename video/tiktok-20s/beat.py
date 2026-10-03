import numpy as np, wave
sr=44100; T=20.0; n=int(sr*T); out=np.zeros(n)
bpm=120; beat=60/bpm
def add(sig,t):
    i=int(t*sr); j=min(n,i+len(sig)); out[i:j]+=sig[:j-i]
tt=np.arange(int(.35*sr))/sr
kick=np.sin(2*np.pi*(50+90*np.exp(-tt*30))*tt)*np.exp(-tt*9)
th=np.arange(int(.05*sr))/sr
rng=np.random.default_rng(1)
hat=rng.standard_normal(len(th))*np.exp(-th*90)*.25
hat=np.diff(np.concatenate([[0],hat]))
tp=np.arange(int(.12*sr))/sr
pop=np.sin(2*np.pi*(900+600*np.exp(-tp*40))*tp)*np.exp(-tp*35)*.35
notes=[55,55,65.4,49]  # basse A,A,C,G
b=0
while b*beat<T-.6:
    t=b*beat
    add(kick*.9,t)
    add(hat,t+beat/2)
    f=notes[(b//4)%4]; bt=np.arange(int(beat*sr))/sr
    add(np.sin(2*np.pi*f*bt)*np.exp(-bt*4)*.35,t)
    b+=1
for t in [.15,.75,1.35,2.9,4.49,5.49,6.66,7.42,8.5,9.45,10.18,11.94,13.42,15.58,17.31,18.45]:
    add(pop,t)
out[-int(.6*sr):]*=np.linspace(1,0,int(.6*sr))
out=out/np.max(np.abs(out))*.9
w=wave.open("beat.wav","wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
