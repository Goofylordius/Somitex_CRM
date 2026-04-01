# Vorlage fuer Datenschutz-Folgenabschaetzung (DSFA)

## 1. Verarbeitungsvorgang

- Name: Somitex CRM
- Beschreibung: Verarbeitung von Kunden-, Kontakt-, Aktivitaets- und Sicherheitsdaten in einem webbasierten CRM

## 2. Zweck

- Vertriebssteuerung
- Kundenbetreuung
- vertragliche Kommunikation
- Nachweis- und Sicherheitszwecke

## 3. Beteiligte Systeme

- Next.js Webanwendung
- Supabase Auth, Postgres, Storage, Edge Functions
- Monitoring/Alerting

## 4. Datenkategorien

- Identifikationsdaten
- Kommunikationsdaten
- CRM-Interaktionsdaten
- technische Sicherheitsdaten

## 5. Betroffene Personengruppen

- Kund:innen
- Leads
- Ansprechpartner:innen bei Unternehmen
- interne Nutzer:innen

## 6. Notwendigkeit und Verhaeltnismaessigkeit

- Zweckbindung dokumentiert
- Datenminimierung pro Formular und Prozess
- Rollen- und Need-to-know-Prinzip
- definierte Loesch- und Retentionskonzepte

## 7. Risiken

- unberechtigter Datenzugriff
- Fehlkonfiguration von RLS
- unzureichende Einwilligungsdokumentation
- unvollstaendige Loeschung
- Offenlegung sensibler PII

## 8. Schutzmassnahmen

- MFA fuer alle internen Nutzer:innen
- verschluesselte PII-Felder
- Audit-Logs und Alarmierung
- sichere Header, CSP, TLS-only
- getestete DSAR- und Loeschprozesse

## 9. Restrisiko und Freigabe

- durch DSB und Informationssicherheit zu dokumentieren
- Freigabe nur nach technischer und organisatorischer Restpruefung

