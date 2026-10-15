"""Render the prototype's original chord palette and cues for Ren'Py. No external samples."""
from pathlib import Path
import array
import math
import wave
import subprocess

ROOT = Path(__file__).resolve().parents[1]
RATE = 22050

def write(name, duration, notes, shore=False):
    count = int(duration * RATE)
    samples = array.array('h')
    seed, brown = 2701, 0.0
    for i in range(count):
        t = i / RATE
        v = 0.0
        for start, length, frequencies, level in notes:
            local = t - start
            if 0 <= local < length:
                envelope = min(1, local / min(4, length * .2), (length-local) / min(4, length * .3))
                v += sum(math.sin(2*math.pi*f*local) for f in frequencies) * level * envelope
        if shore:
            seed = (seed*1664525+1013904223) & 0xffffffff
            brown = (brown + ((seed/4294967296)*2-1)*.025)/1.025
            v += brown*.16*(.8+.2*math.sin(t*2*math.pi*.055))
        fade = min(1, t/.1, (duration-t)/.1)
        samples.append(int(max(-1,min(1,v*fade))*32767))
    out = ROOT/'game/audio'/f'{name}.wav'
    with wave.open(str(out), 'wb') as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(RATE); f.writeframes(samples.tobytes())
    return out

chords = [[130.81,196,246.94,293.66],[174.61,220,261.63,329.63],[146.83,220,261.63,329.63],[130.81,196,261.63,329.63]]
commons = write('commons', 96, [(i*24,24,c,.025) for i,c in enumerate(chords)] + [(4+i*12,4,[f],.025) for i,f in enumerate([587.33,659.25,880,783.99,587.33,440,659.25,523.25])],True)
opening = write('opening',31,[(0,31,[146.83,220],.025),(3.4,1,[587.33,880],.035),(13.4,2.2,[293.66,440,587.33],.035),(27.3,2,[440,659.25],.035)],True)
for name, notes in [('discovery',[(i*.11,.75,[f],.08) for i,f in enumerate([392,523.25,783.99])]),('inspect',[(0,.5,[640],.09)])]:
    write(name,1.2,notes)
for source in (commons,opening):
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-c:a','libvorbis','-q:a','5',str(source.with_suffix('.ogg'))],check=True)
    source.unlink()
