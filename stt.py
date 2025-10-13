import whisper

model = whisper.load_model("base")

result = model.transcribe(audio = "audios/12_CSS Selectors MasterClass _ Sigma Web Development Course.mp3",language = "hi", task = "translate")

print(result['text'])
