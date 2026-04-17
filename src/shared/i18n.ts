export const it = {
  app: {
    name: 'Expendio',
    tagline: 'Le spese di casa, semplici'
  },
  nav: {
    home: 'Casa',
    expenses: 'Spese',
    scheduled: 'Scadenze',
    recap: 'Riepilogo',
    settings: 'Impostazioni'
  },
  home: {
    greeting: 'Ciao!',
    monthTotal: 'Totale di questo mese',
    previousMonth: 'Il mese scorso',
    addExpense: 'Aggiungi spesa',
    recent: 'Ultime spese',
    noRecent: 'Nessuna spesa ancora questo mese.',
    viewAll: 'Vedi tutte',
    topCategories: 'Dove spendi di più',
    budgets: 'Budget del mese',
    noBudgets: 'Non hai ancora impostato un budget.',
    setBudget: 'Imposta budget',
    vsPrev: {
      less: 'Hai speso meno del mese scorso',
      more: 'Hai speso più del mese scorso',
      same: 'Stessa cifra del mese scorso'
    }
  },
  add: {
    title: 'Aggiungi spesa',
    amountLabel: 'Quanto hai speso?',
    amountPlaceholder: '0,00',
    categoryLabel: 'Categoria',
    dateLabel: 'Quando?',
    dateToday: 'Oggi',
    dateYesterday: 'Ieri',
    dateOther: 'Altra data',
    noteLabel: 'Nota (facoltativa)',
    notePlaceholder: 'Es. spesa al supermercato',
    save: 'Salva spesa',
    saved: 'Spesa salvata!',
    cancel: 'Annulla',
    amountError: 'Inserisci un importo valido',
    categoryError: 'Scegli una categoria'
  },
  list: {
    title: 'Le tue spese',
    empty: 'Nessuna spesa in questo mese.',
    emptyCta: 'Aggiungi la prima spesa',
    today: 'Oggi',
    yesterday: 'Ieri',
    search: 'Cerca',
    allCategories: 'Tutte le categorie',
    dailyTotal: 'Totale del giorno',
    deleted: 'Spesa cancellata',
    undo: 'Annulla'
  },
  detail: {
    title: 'Dettaglio spesa',
    edit: 'Modifica',
    delete: 'Cancella',
    confirmDelete: 'Vuoi cancellare questa spesa?',
    confirmDeleteBody: 'Non si può recuperare dopo 8 secondi.',
    confirm: 'Sì, cancella',
    cancel: 'No, annulla'
  },
  recap: {
    title: 'Riepilogo del mese',
    total: 'Totale',
    average: 'Media al giorno',
    count: 'Numero di spese',
    byCategory: 'Per categoria',
    byDay: 'Giorno per giorno',
    compare: 'Confronto con il mese scorso',
    export: 'Stampa o salva PDF',
    noData: 'Non ci sono spese in questo mese.'
  },
  categories: {
    title: 'Categorie',
    add: 'Aggiungi categoria',
    edit: 'Modifica',
    archive: 'Archivia',
    archived: 'Archiviate',
    restore: 'Ripristina',
    name: 'Nome',
    color: 'Colore',
    icon: 'Icona',
    save: 'Salva',
    cantDelete: 'Non puoi cancellare una categoria con spese collegate.'
  },
  budgets: {
    title: 'Budget',
    description: 'Imposta un tetto di spesa per ogni categoria.',
    amount: 'Importo massimo',
    save: 'Salva budget',
    remove: 'Togli budget',
    progress: 'Speso',
    remaining: 'Rimangono',
    over: 'Hai superato il budget di',
    close: 'Stai per superare il budget'
  },
  recurring: {
    title: 'Spese ricorrenti',
    add: 'Aggiungi spesa ricorrente',
    name: 'Nome (es. Bolletta Luce)',
    amount: 'Importo (lascia vuoto se cambia)',
    frequency: 'Ogni quanto',
    freqMonthly: 'Ogni mese',
    freqBimonthly: 'Ogni due mesi',
    freqQuarterly: 'Ogni tre mesi',
    freqYearly: 'Una volta all\'anno',
    nextDue: 'Prossima scadenza',
    active: 'Attiva',
    askOnLaunch: 'Al prossimo avvio chiederò se vuoi segnarla come pagata.',
    dueTitle: 'Hai una spesa ricorrente in scadenza',
    markPaid: 'Segna come pagata',
    skip: 'Non ora',
    addAndPay: 'Aggiungi e registra'
  },
  scheduled: {
    title: 'Scadenze',
    subtitle: 'Le spese previste, segnate quando le paghi',
    add: 'Aggiungi scadenza',
    edit: 'Modifica scadenza',
    name: 'Nome (es. Bolletta Luce)',
    amount: 'Importo',
    category: 'Categoria',
    dueDate: 'Scadenza',
    note: 'Nota (facoltativa)',
    save: 'Salva',
    markPaid: 'Segna come pagata',
    markUnpaid: 'Non ancora pagata',
    paidOn: 'Pagata il {date}',
    confirmDelete: 'Vuoi cancellare questa scadenza?',
    confirmDeleteBody: 'La spesa collegata verrà rimossa.',
    empty: 'Non ci sono scadenze.',
    emptyCta: 'Aggiungi la prima scadenza',
    upcoming: 'Prossime scadenze',
    thisWeek: 'Questa settimana',
    nextWeek: 'La prossima settimana',
    later: 'Più avanti',
    overdue: 'In ritardo',
    paid: 'Pagata',
    unpaid: 'Da pagare',
    today: 'Oggi',
    tomorrow: 'Domani',
    filterAll: 'Tutte',
    filterUnpaid: 'Da pagare',
    filterPaid: 'Pagate',
    filterOverdue: 'In ritardo',
    summaryTotal: 'Totale previsto',
    summaryPaid: 'Già pagate',
    summaryUnpaid: 'Ancora da pagare',
    summaryOverdue: 'In ritardo',
    viewMonth: 'Mese',
    viewList: 'Lista',
    nextMonth: 'Mese successivo',
    prevMonth: 'Mese precedente',
    dueIn: 'Fra {days} giorni',
    dueInOne: 'Fra un giorno',
    overdueBy: 'In ritardo di {days} giorni',
    overdueByOne: 'In ritardo di un giorno',
    fromRecurring: 'Da spesa ricorrente',
    amountError: 'Inserisci un importo valido',
    nameError: 'Inserisci un nome',
    categoryError: 'Scegli una categoria',
    dateError: 'Scegli una data',
    quickDateLabel: 'Quando scade?',
    quickToday: 'Oggi',
    quickTomorrow: 'Domani',
    quickWeek: 'Fra 7 giorni',
    quickEndMonth: 'Fine mese',
    quickOther: 'Altra data',
    paidUndo: 'Segnata come pagata',
    unpaidUndo: 'Non è più pagata',
    deletedUndo: 'Scadenza cancellata',
    undo: 'Annulla',
    emptyBody: 'Aggiungi bollette, affitto e rate: qui ti ricordo quando scadono.',
    batchPayWeek: 'Paga tutte questa settimana',
    batchPayWeekConfirm: 'Segnare come pagate tutte le scadenze di questa settimana?',
    batchPayWeekDone: '{count} scadenze pagate',
    noUnpaidThisWeek: 'Niente da pagare questa settimana'
  },
  shopping: {
    title: 'Lista della spesa',
    placeholder: 'Aggiungi un articolo',
    add: 'Aggiungi',
    empty: 'La tua lista è vuota.',
    clearDone: 'Togli gli articoli già presi'
  },
  settings: {
    title: 'Impostazioni',
    appearance: 'Aspetto',
    largeText: 'Testo più grande',
    data: 'Dati',
    backup: 'Backup e ripristino',
    autoBackup: 'Backup automatico settimanale',
    backupFolder: 'Cartella di backup',
    choose: 'Scegli cartella',
    exportNow: 'Esporta adesso',
    restore: 'Ripristina da backup',
    restoreWarn: 'Il ripristino sostituirà tutti i dati attuali.',
    lastBackup: 'Ultimo backup',
    never: 'Mai fatto',
    about: 'Informazioni',
    version: 'Versione',
    help: 'Aiuto'
  },
  backup: {
    title: 'Backup e ripristino',
    description: 'Salva una copia dei tuoi dati su una chiavetta USB o in una cartella sicura.',
    exportSuccess: 'Backup salvato!',
    exportError: 'Non riesco a salvare il backup. Riprova.',
    restoreSuccess: 'Dati ripristinati!',
    restoreError: 'Questo backup non è valido.',
    restoreConfirm: 'Sei sicura? I dati di adesso saranno sostituiti.',
    restoreGo: 'Sì, ripristina',
    exportBtn: 'Esporta backup',
    restoreBtn: 'Ripristina da file',
    autoBackupDone: 'Backup automatico eseguito'
  },
  welcome: {
    title: 'Benvenuta in Expendio',
    sub: 'Un piccolo aiutante per le spese di casa, con un cagnolino che ti tiene compagnia.',
    step1: 'Tutto rimane sul tuo computer — niente internet, niente account.',
    step2: 'Aggiungi le spese in pochi tocchi e guarda dove va il tuo denaro.',
    step3: 'Facciamo un backup ogni settimana — tu scegli dove.',
    start: 'Iniziamo',
    skip: 'Salta'
  },
  common: {
    save: 'Salva',
    cancel: 'Annulla',
    back: 'Indietro',
    ok: 'Va bene',
    yes: 'Sì',
    no: 'No',
    loading: 'Un attimo...',
    error: 'Qualcosa non ha funzionato',
    retry: 'Riprova',
    edit: 'Modifica',
    delete: 'Cancella',
    confirm: 'Conferma',
    close: 'Chiudi',
    optional: 'facoltativo',
    today: 'Oggi',
    yesterday: 'Ieri'
  },
  updater: {
    checking: 'Cerco aggiornamenti…',
    available: 'Nuova versione disponibile',
    availableBody: 'Versione {version} pronta da scaricare.',
    download: 'Scarica ora',
    downloading: 'Sto scaricando l\'aggiornamento',
    downloadingPercent: 'Scaricato {percent}%',
    ready: 'Aggiornamento pronto',
    readyBody: 'Riavvia Expendio per usare la versione {version}.',
    installNow: 'Riavvia e aggiorna',
    later: 'Più tardi',
    upToDate: 'Sei già aggiornata',
    upToDateBody: 'Stai usando l\'ultima versione ({version}).',
    errorTitle: 'Non riesco ad aggiornare',
    errorBody: '{message}',
    check: 'Cerca aggiornamenti',
    current: 'Versione attuale'
  },
  mascot: {
    ariaLabel: 'Biscotto, trascina per lanciare l\'ossicino',
    holdHint: 'Tieni premuto e trascina per lanciare',
    throw: 'Lancia!',
    caught: 'Bravo Biscotto!',
    missed: 'Ops, riprova!',
    again: 'Ancora?',
    cucciolate: 'Cucciolate',
    cucciolateOne: 'cucciolata',
    cucciolateMany: 'cucciolate',
    chasing: 'Biscotto sta rincorrendo l\'ossicino',
    returning: 'Biscotto torna al suo posto',
    keyHint: 'Premi spazio per lanciare'
  },
  tips: {
    helpLabel: 'Aiuto',
    helpAria: 'Apri la guida di questa schermata',
    dismiss: 'Ho capito',
    dismissAria: 'Chiudi suggerimento',
    skipTour: 'Salta la guida',
    next: 'Avanti',
    done: 'Fine',
    gotIt: 'Perfetto!',
    replayTour: 'Rivedi la guida di questa pagina',
    homeAdd: {
      title: 'Aggiungi la tua prima spesa',
      body: 'Tocca questo pulsante grande ogni volta che paghi qualcosa. Bastano 10 secondi.'
    },
    homeNav: {
      title: 'Qui sotto ci sono le pagine',
      body: 'Casa, Spese, Scadenze, Riepilogo e Impostazioni. Tocca un\'icona per spostarti.'
    },
    addAmount: {
      title: 'Scrivi l\'importo',
      body: 'Digita quanto hai speso, ad esempio 12,50. Il virgola sta per i centesimi.'
    },
    addCategory: {
      title: 'Scegli la categoria',
      body: 'Tocca una delle icone colorate. Se non sai quale, c\'è sempre "Altro".'
    },
    addDate: {
      title: 'Quando hai speso?',
      body: '"Oggi" è già selezionato. Tocca "Ieri" o "Altra data" solo se serve.'
    },
    scheduledAdd: {
      title: 'Segna una scadenza',
      body: 'Qui puoi scrivere le spese che arriveranno: bollette, affitto, rate. Così non te ne dimentichi.'
    },
    scheduledPay: {
      title: 'Segna come pagata',
      body: 'Quando hai pagato, tocca il pallino verde. La spesa entra automaticamente nel riepilogo.'
    },
    scheduledView: {
      title: 'Vista calendario o lista',
      body: 'Tocca "Mese" per vedere il calendario, "Lista" per vedere tutte le scadenze in ordine.'
    },
    budgetIntro: {
      title: 'Metti un tetto di spesa',
      body: 'Se vuoi non superare una cifra per la spesa o le bollette, impostalo qui. Expendio ti avvisa.'
    },
    recurringIntro: {
      title: 'Spese che tornano ogni mese',
      body: 'Affitto, bollette, abbonamenti. Scrivile una volta e Expendio le ricorda al momento giusto.'
    },
    shoppingIntro: {
      title: 'Lista della spesa',
      body: 'Scrivi quello che ti serve prima di uscire. Spunta man mano che metti nel carrello.'
    },
    recapIntro: {
      title: 'Guarda dove va il denaro',
      body: 'Qui vedi totali, medie e confronti con il mese scorso. Utile a fine mese.'
    },
    settingsBackup: {
      title: 'Fai il backup',
      body: 'Scegli una cartella (anche una chiavetta USB) e salva i dati. Ogni settimana si aggiorna da solo.'
    },
    scheduledQuickDate: {
      title: 'Scegli la data veloce',
      body: 'Tocca "Oggi", "Domani" o "Fine mese". Se non trovi la data giusta, usa "Altra data".'
    },
    scheduledBatchPay: {
      title: 'Paga tutte insieme',
      body: 'Se hai pagato tutte le scadenze della settimana, segnale con un solo tocco.'
    },
    scheduledUndo: {
      title: 'Hai 8 secondi per tornare indietro',
      body: 'Se sbagli a segnare o cancellare, tocca "Annulla" prima che il messaggio sparisca.'
    }
  },
  months: [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ],
  daysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
}

export type Dictionary = typeof it
