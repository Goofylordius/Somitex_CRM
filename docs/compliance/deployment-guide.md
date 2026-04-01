# Deployment Guide

## Zielbild

- Frontend/App Hosting in Europa
- Supabase Projekt in einer EU-Region
- AVV/DPA mit allen Auftragsverarbeitenden
- dokumentierte Backup- und Recovery-Pfade

## Empfohlene Schritte

1. Supabase-Projekt in einer EU-Region anlegen.
2. MFA und E-Mail-Verifikation in Supabase Auth erzwingen.
3. Service-Role-Key nur in Server-Umgebungen hinterlegen.
4. Vercel oder alternative Plattform nur mit EU-konformer Datenverarbeitung und eingeschraenkten Teamrechten verwenden.
5. Eigene Domain mit HSTS und TLS 1.3 aktivieren.
6. Error-Tracking so konfigurieren, dass keine unnoetigen personenbezogenen Daten protokolliert werden.
7. Audit-Log-Archive regelmaessig in unveraenderbaren Speicher exportieren.

## Backups und Recovery

- taegliche automatisierte Datenbank-Backups
- dokumentierter Wiederherstellungstest mindestens quartalsweise
- Notfallhandbuch mit RTO/RPO

## Vor Go-Live pruefen

- Redirect-URLs
- CSP und Security Header
- Storage Buckets auf `public = false`
- RLS fuer jede Tabelle aktiv
- Ueberwachung von fehlgeschlagenen Anmeldungen
- Schluesselrotation fuer API-Keys und Integrationssecrets

