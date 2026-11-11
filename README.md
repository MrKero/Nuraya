# Nuraya – Islam-App

Persönliche, datenschutzfreundliche Islam-App (Web-App fürs iPhone).

🌐 **App öffnen:** [mrkero.github.io/Nuraya](https://mrkero.github.io/Nuraya/)

Auf dem iPhone in Safari öffnen → Teilen → „Zum Home-Bildschirm“.

**Mit ❤️ gemacht von Kerem**

## Funktionen
- **Start:** Heute gesagte Dhikr, aktuelles Gebet mit Countdown, Koran fortsetzen, Tasbih, nächster besonderer Tag
- **Gebet:** Gebetszeiten weltweit (offline berechnet, optional Diyanet-Download), Reisen im Voraus planen, Abhaken mit Kaza und Nachtragen, Erinnerung an nicht Eingetragenes, Woche/Monat, Statistik, Qibla-Kompass
- **Koran:** Arabisch (Uthmani), türkische Aussprache, deutsche Übersetzung (Bubenheim & Elyas), Lesezeichen, Audio (Alafasy, 128 kbps) mit Live-Mitlesen, Wiederholen, Auto-Blättern, Restzeit bis Sure- und Koran-Ende, Lesedesigns Weiß/Schwarz/Papier
- **Kalender:** Hidschri-Monat, Kandil-Nächte, Feiertage
- Bearbeitungsmodus (Stift), 7 Hintergründe, Perlen- und Kompass-Designs, Deutsch/Türkisch/Arabisch

## Ordner
- `index.html`, `css/`, `js/` – die App
- `data/` – Koran-Texte (114 Suren) und Metadaten
- `lib/` – adhan (Gebetszeiten), fflate (ZIP-Import)
- `fonts/` – Amiri Quran, Aref Ruqaa, Reem Kufi
- `sw.js` – Offline-Speicher; bei jeder neuen Version `VERSION` hochzählen

## Optional: Audio direkt mitliefern
MP3s im everyayah-Format (z. B. `001001.mp3`) in `audio/alafasy/` legen – die App spielt sie dann ohne externen Server ab.

## Quellen
Tanzil (arabischer Text), Bubenheim & Elyas (Deutsch), Latin-Umschrift (Türkisch) über fawazahmed0/quran-api, Audio: everyayah.com.
