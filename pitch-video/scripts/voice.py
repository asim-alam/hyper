"""Generate the editable English narration + word boundary timings.

pip install edge-tts
python scripts/voice.py
FFmpeg/FFprobe must be on PATH. Sends only scenes.json narration to Microsoft's
Edge speech service, using the same stock synthetic voice as the reference film.
No voice sample or voice cloning is involved.
"""
import asyncio
import json
import pathlib
import subprocess
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parents[1]

def duration(path):
    return float(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
        '-of', 'csv=p=0', str(path)
    ]))

async def generate(scene, semaphore):
    async with semaphore:
        folder = ROOT / 'assets/audio'
        target = folder / (scene['id'] + '.mp3')
        word_file = folder / (scene['id'] + '.words.json')
        rate = -5
        available = scene['end'] - scene['start'] - 1.0
        for attempt in range(3):
            words = []
            communicate = edge_tts.Communicate(
                scene['voice'], 'en-US-AvaNeural', rate=f'{rate:+d}%',
                boundary='WordBoundary'
            )
            with target.open('wb') as output:
                async for chunk in communicate.stream():
                    if chunk['type'] == 'audio':
                        output.write(chunk['data'])
                    elif chunk['type'] == 'WordBoundary':
                        words.append({'text': chunk['text'],
                                      'start': chunk['offset'] / 10_000_000,
                                      'end': (chunk['offset'] + chunk['duration']) / 10_000_000})
            length = duration(target)
            if length <= available:
                break
            rate = round((1 + rate / 100) * length / available * 100 - 100) + 2
            if rate > 25:
                raise ValueError(f"Shorten {scene['id']} narration; needs {rate}% speed")
        if length > available:
            raise ValueError(f"Narration exceeds scene: {scene['id']}")
        start = scene['start'] + 0.45
        word_file.write_text(json.dumps(words, indent=2))
        print(f"{scene['id']}: {length:.2f}s / {available:.2f}s, rate {rate:+d}%", flush=True)
        return {'id': scene['id'], 'start': start, 'duration': length,
                'file': f'assets/audio/{scene["id"]}.mp3', 'rate': rate,
                'words': [{**w, 'start': start + w['start'], 'end': start + w['end']} for w in words]}

async def main():
    scenes = json.loads((ROOT / 'scenes.json').read_text())
    semaphore = asyncio.Semaphore(3)
    results = await asyncio.gather(*(generate(s, semaphore) for s in scenes))
    (ROOT / 'narration.json').write_text(json.dumps(results, indent=2))

if __name__ == '__main__':
    asyncio.run(main())
