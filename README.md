# Ambient Shelf

Versioned ambient recordings for EnviSelf and other projects. [catalog.json](catalog.json) lists the audio files, original source, author, licence and SHA-256 of each recording. Third-party recordings follow the licence in their entry.

This repository holds the source recordings and catalogue. EnviSelf keeps a verified local mirror of the JSON and MP3s in `assets/audio/ambient_shelf/` and bundles them with its installer for offline listening.

## Adding or updating a sound

1. Put the distributable stereo MP3 in `audio/`. Confirm that the original licence permits redistribution.
2. Add or update its entry in `catalog.json`. Keep the same ID when updating a sound so saved references keep working. Use `nature`, `music` or `noise` for its category and include Spanish and English titles.
3. Record the file size, SHA-256, duration in milliseconds and EBU R128 integrated loudness in LUFS. Run `node tool/check-catalog.mjs` and commit the JSON with the recording.
4. From EnviSelf, run `node tool/sync-ambient-shelf.mjs <path-to-ambient-shelf>` with the source checkout. Review and commit the updated mirror in EnviSelf, then rebuild the installer.
