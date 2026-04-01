# Datenschutzerklaerung fuer Somitex CRM

Hinweis: Diese Vorlage ist auf DSGVO/BDSG-konforme Struktur ausgerichtet, ersetzt aber keine juristische Pruefung.

## 1. Verantwortliche Stelle

- Unternehmen: `[Name des Verantwortlichen]`
- Anschrift: `[Strasse, PLZ, Ort, Land]`
- E-Mail: `[datenschutz@example.de]`
- Telefon: `[Telefonnummer]`
- Vertretungsberechtigte Person: `[Name]`

## 2. Datenschutzbeauftragte:r

- Name: `[Name oder externer DSB]`
- E-Mail: `[dsb@example.de]`

## 3. Zwecke und Rechtsgrundlagen

Die Verarbeitung im CRM erfolgt ausschliesslich zu dokumentierten Zwecken:

- Vertragsanbahnung und Vertragserfuellung nach Art. 6 Abs. 1 lit. b DSGVO
- berechtigte Interessen an sicherer Kundenbetreuung und Nachweisbarkeit nach Art. 6 Abs. 1 lit. f DSGVO
- dokumentierte Einwilligungen fuer Marketing- und Tracking-Zwecke nach Art. 6 Abs. 1 lit. a DSGVO
- Erfuellung gesetzlicher Aufbewahrungs- und Nachweispflichten nach Art. 6 Abs. 1 lit. c DSGVO

## 4. Kategorien verarbeiteter Daten

- Stammdaten: Name, Unternehmen, Funktion, Kommunikationsdaten
- CRM-Vorgangsdaten: Leads, Angebote, Aufgaben, Aktivitaeten, Termine
- Einwilligungsdaten: Zeitpunkt, Version, Quelle, Nachweis
- Sicherheitsdaten: Login-Ereignisse, Rollen, Session-Metadaten, Audit-Logs

## 5. Empfaenger und Hosting

- Hosting und Datenbank: Supabase in einer EU-Region
- Anwendungs-Hosting: Vercel EU-geeignet oder alternative EU-konforme Plattform
- Auftragsverarbeitende: nur mit abgeschlossenem AVV/DPA und dokumentierter Pruefung

## 6. Internationale Datentransfers

Internationale Datenuebermittlungen erfolgen nur, wenn:

- sie unvermeidbar sind,
- eine geeignete Rechtsgrundlage besteht,
- und geeignete Garantien nach Kapitel V DSGVO dokumentiert wurden.

Vor Produktivstart ist die Transfer-Folgenabschaetzung und die aktuelle DPA/TIA des Providers zu dokumentieren.

## 7. Speicherdauer

- Kontakte und CRM-Vorgaenge: nach dokumentierter Retention Policy
- Audit-Logs: mindestens 6 Monate, im Regelfall 12 Monate
- Session-Daten: nur solange sicherheitsbezogen erforderlich
- DSAR-Nachweise: bis zum Ablauf der Nachweis- und Verjaehrungsfristen

## 8. Rechte betroffener Personen

Betroffene Personen koennen insbesondere folgende Rechte geltend machen:

- Auskunft nach Art. 15 DSGVO
- Berichtigung nach Art. 16 DSGVO
- Loeschung nach Art. 17 DSGVO
- Einschraenkung nach Art. 18 DSGVO
- Datenuebertragbarkeit nach Art. 20 DSGVO
- Widerspruch nach Art. 21 DSGVO
- Widerruf erteilter Einwilligungen mit Wirkung fuer die Zukunft

Anfragen werden ueber den DSAR-Workflow dokumentiert und fristgebunden bearbeitet.

## 9. Automatisierte Entscheidungen

Es findet keine ausschliesslich automatisierte Entscheidungsfindung im Sinne von Art. 22 DSGVO statt, sofern nicht gesondert beschrieben und freigegeben.

## 10. Technische und organisatorische Massnahmen

- MFA-geschuetzte Konten
- rollenbasierte Zugriffe mit Row Level Security
- Verschluesselung der Uebertragung per TLS
- Feldverschluesselung fuer besonders schutzbeduerftige PII
- revisionsfaehige Audit-Logs
- dokumentierte Loesch- und Retentionsprozesse
- sichere Standardkonfigurationen und HSTS/CSP

## 11. Beschwerderecht

Betroffene Personen haben das Recht, sich bei einer Datenschutzaufsichtsbehoerde zu beschweren.

