# Sicherheits-Checkliste

## Anwendung

- [ ] Keine Secrets im Repository
- [ ] Input-Validierung mit Zod auf Server und Client
- [ ] Fehlertexte ohne unnoetige Personen- oder Systemdetails
- [ ] CSP, HSTS, X-Frame-Options, Referrer-Policy gesetzt
- [ ] Alle mutierenden Endpunkte auditierbar

## Authentifizierung

- [ ] MFA fuer alle Produktivkonten aktiviert
- [ ] Passwoerter mindestens 12 Zeichen
- [ ] Passwort-Reset mit zeitlich begrenzten Tokens
- [ ] Login-Rate-Limit und Lockout aktiv
- [ ] Sessions inaktivitaets- und ablaufgesteuert

## Datenbank und Supabase

- [ ] RLS fuer jede Tabelle aktiviert
- [ ] Service Role nur serverseitig
- [ ] Storage-Policies fuer private Buckets gesetzt
- [ ] Retention-Jobs dokumentiert und getestet
- [ ] Audit-Log unveraenderbar und mit Mindestretention

## Datenschutz

- [ ] Rechtsgrundlagen je Verarbeitungszweck dokumentiert
- [ ] Consent-Protokollierung vorhanden
- [ ] DSAR-Export und Loeschprozess getestet
- [ ] Privacy by Default in Formularen umgesetzt
- [ ] DSFA vorbereitet und abgestimmt
