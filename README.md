# Ambient Shelf

Versioned ambient recordings for EnviSelf and other projects. [catalog.json](catalog.json) lists the audio files, original source, author, licence and SHA-256 of each recording. Third-party recordings follow the licence in their entry.

EnviSelf pins a Git revision of the Flutter asset package in this repository. Flutter fetches the catalogue and the audio together and bundles them with the app for offline listening from the first play. The JSON and the audio files can also be used on their own.

## Adding or updating a sound

1. Put the distributable stereo MP3 in `audio/`. Confirm that the original licence permits redistribution.
2. Add or update its entry in `catalog.json`. Keep the same ID when updating a sound so saved references keep working. Use `nature`, `music` or `noise` for its category and include Spanish and English titles.
3. Record the file size, SHA-256, duration in milliseconds and EBU R128 integrated loudness in LUFS. Run `node tool/check-catalog.mjs --write` and commit the generated Dart catalogue with the JSON and the recording.
4. Publish the commit to Ambient Shelf. In EnviSelf, update the pinned Ambient Shelf Git revision and rebuild. The new catalogue will appear in Escucha → Ambiente.
