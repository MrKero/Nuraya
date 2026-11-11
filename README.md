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

## Koran-Audio offline nutzen (einmalig)
Der Koran-Text ist komplett in der App. Für den Vortrag von Mishary Rashid al-Afasy importierst du die Audiodateien einmal aufs iPhone – sie liegen danach nur auf deinem Gerät und nicht im Repository (zu groß für GitHub).

1. **Herunterladen:** [000_versebyverse.zip](https://everyayah.com/data/Alafasy_128kbps/000_versebyverse.zip) von everyayah.com (ca. 1,7 GB, 128 kbps, nur Audio). Am besten direkt auf dem iPhone im WLAN – Safari speichert die Datei unter *Dateien → Downloads*. `000_images.zip` und `000_allfiles.zip` werden **nicht** benötigt.
2. **Vom PC aufs iPhone (falls am PC geladen):** in iCloud Drive kopieren (iCloud für Windows oder icloud.com) oder per Kabel mit der App „Apple Geräte“ in die Dateien-App übertragen.
3. **Importieren:** Nuraya öffnen → Reiter *Koran* (die Anleitung erscheint beim ersten Öffnen) oder *Einstellungen → Koran & Audio → Anleitung: Koran-Audio importieren* → „ZIP-Datei wählen“. App geöffnet und Display an lassen, bis „… importiert“ erscheint (einige Minuten).
4. **Aufräumen:** Die ZIP-Datei danach in der Dateien-App löschen – Nuraya hat eine eigene Kopie.

Hinweise: Für den Import werden kurzzeitig ca. 3,5 GB freier Speicher gebraucht. Bricht der Import ab, einfach neu starten – bereits importierte Verse werden übersprungen.

## Optional: Audio direkt mitliefern
MP3s im everyayah-Format (z. B. `001001.mp3`) in `audio/alafasy/` legen – die App spielt sie dann ohne externen Server ab.

## Quellen
Tanzil (arabischer Text), Bubenheim & Elyas (Deutsch), Latin-Umschrift (Türkisch) über fawazahmed0/quran-api, Audio: everyayah.com.
