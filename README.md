# REPLOG – app Android nativa (versione 0.3)

REPLOG è un progetto **React Native + Expo per Android**: non è una pagina web e non è una PWA. L'obiettivo di distribuzione personale è un APK installabile direttamente sullo Xiaomi, senza pubblicazione sul Play Store. I dati sono salvati sul dispositivo tramite AsyncStorage; non è richiesto un account nell'app e non c'è un server remoto.

## Funzioni presenti
- Scheda personale **Scheda Marco (001)**, con tre giorni, importata dal PDF fornito.
- Libreria esercizi, ricerca, aggiunta di esercizi personalizzati e creazione di schede/giorni.
- Registrazione di serie, peso, ripetizioni, recuperi e note di sessione.
- Storico allenamenti, volume stimato, peso corporeo e misure (vita, torace, braccio, coscia).
- Timer recupero con pausa/ripresa, +30 secondi e azzeramento.
- 12 metodi: serie normali, rest-pause, drop set, superset, triset, giant set, myo-reps, cluster, piramidale, tempo controllato, AMRAP e isometria.

## Guida automatica dei metodi
- **Superset, triset e giant set:** gli esercizi con lo stesso codice gruppo vengono alternati automaticamente. Dopo aver registrato una serie si passa al successivo esercizio del gruppo senza recupero; il recupero parte al completamento del round. Il prossimo passaggio è evidenziato.
- **Rest-pause, myo-reps e cluster:** dopo la registrazione di un blocco parte automaticamente la micro-pausa configurata (15 secondi se non specificata). Il timer può essere avviato anche manualmente.
- **Drop set:** è presente un comando guidato per ridurre il carico e proseguire senza recupero; la riduzione del peso resta manuale e va registrata come serie aggiuntiva.
- **Isometria e tempo controllato:** timer dedicati per la tenuta di 10 secondi e la fase controllata di 4 secondi.

## Limiti ancora presenti
È una versione in sviluppo, non ancora collaudata su uno Xiaomi reale. La guida dei gruppi è automatica; alcune tecniche (drop set, piramidale, AMRAP, isometria e tempo) richiedono ancora l'intervento dell'utente per decidere carico, ripetizioni o passaggio successivo. Restano da completare: editor avanzato con riordino/modifica/cancellazione, grafici per esercizio e volume, backup/ripristino, test approfonditi del timer in background e controlli anti-perdita dati.

## Ottenere l'APK da installare sullo Xiaomi
Il progetto contiene già `eas.json` configurato per generare un APK di anteprima. La compilazione si fa con EAS Build, sui server Expo; serve un account Expo gratuito e un ambiente con Node.js/terminale per lanciare i comandi.

1. Estrai lo ZIP su un computer oppure carica il progetto in un ambiente di sviluppo cloud che permetta di usare un terminale.
2. Nella cartella del progetto esegui `npm install`.
3. Installa EAS CLI con `npm install -g eas-cli`.
4. Accedi con `eas login`.
5. Esegui `eas build -p android --profile preview`.
6. Al termine scarica l'APK dal link fornito da Expo, trasferiscilo sullo Xiaomi e aprilo per installarlo. Se Android lo richiede, autorizza temporaneamente l'installazione di app da quella fonte.

Non serve Google Play Store. La prima compilazione APK non è ancora stata eseguita: questo archivio contiene il codice sorgente, non un APK già pronto.

## Protezione dei dati
Gli allenamenti e le misure restano nella memoria locale dell'app. Disinstallazione o cancellazione dei dati dell'app può eliminare l'archivio. Prima dell'uso continuativo è importante completare e provare backup/esportazione e ripristino.
