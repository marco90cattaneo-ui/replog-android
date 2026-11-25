
import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, ScrollView, TextInput,
  StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const C = {
  bg:'#090E18', panel:'#121B2A', panel2:'#192538', line:'#26364D',
  text:'#F3F6FC', muted:'#9BAAC0', accent:'#65D6A6', blue:'#75A9FF',
  orange:'#FFB86B', red:'#FF7777'
};

const marcoPlan = [
  {
    id:'marco001-d1', name:'Giorno 1 – Gambe', focus:'Gambe',
    exercises:[
      {name:'Leg extension',sets:2,reps:'12',rest:60,method:'Piramidale crescente: aumenta il carico a ogni serie'},
      {name:'Leg press',sets:3,reps:'10 + 10 + 10',rest:150,method:'Rest pause: dopo ogni blocco da 10 riposa 15 secondi, senza variare il carico, poi riparti',technique:'Rest pause 15″',methodId:'restpause',pauseSeconds:15},
      {name:'Affondi in camminata con manubri',sets:3,reps:'12 per lato',rest:150},
      {name:'Leg extension + sedia invisibile / wall sit',sets:3,reps:'10 + MAX',rest:150,method:'10 ripetizioni; alla decima mantieni la contrazione di picco per 10 secondi, poi wall sit fino a cedimento',methodId:'isometric'},
      {name:'Leg curl',sets:3,reps:'12 / 10 / 8+8+MAX',rest:90,method:'Prime 2 serie: 12 e 10 ripetizioni. Ultima serie rest pause: 8 reps, pausa 15″, altre 8 reps, pausa 15″, poi massimo numero di ripetizioni',technique:'Rest pause ultima serie',methodId:'restpause',pauseSeconds:15}
    ]
  },
  {
    id:'marco001-d2', name:'Giorno 2 – Schiena e petto', focus:'Schiena · Petto',
    exercises:[
      {name:'Trazioni presa stretta inversa',sets:4,reps:'MAX',rest:90},
      {name:'Rematore con bilanciere',sets:4,reps:'10',rest:120},
      {name:'Reverse fly ai cavi alti (deltoidi posteriori)',sets:3,reps:'15',rest:60},
      {name:'Pectoral machine',sets:4,reps:'6 + 8/10',rest:90,method:'Prime 6 ripetizioni con contrazione di 2 secondi; scala il peso di 2 piastre e fai altre 8/10 ripetizioni',technique:'Drop set'},
      {name:'Chest press',sets:4,reps:'12',rest:90,method:'Fase negativa in 3 secondi, fermo 1 secondo e spinta esplosiva',methodId:'tempo'}
    ]
  },
  {
    id:'marco001-d3', name:'Giorno 3 – Braccia, spalle e addome', focus:'Braccia · Spalle · Addome',
    exercises:[
      {name:'French press con bilanciere EZ (panca piana)',sets:4,reps:'10',rest:90,group:'SS1',method:'Superset: eseguire in successione senza pause intermedie',methodId:'superset'},
      {name:'Estensioni al cavo alto',sets:4,reps:'15',rest:90,group:'SS1',methodId:'superset'},
      {name:'Croci ai cavi bassi',sets:3,reps:'10',rest:90,group:'SS2',methodId:'superset'},
      {name:'Push-up a terra',sets:3,reps:'MAX',rest:90,group:'SS2',methodId:'superset'},
      {name:'Arnold press con manubri',sets:3,reps:'10',rest:90,group:'TS1',methodId:'triset'},
      {name:'Alzate laterali con manubri',sets:3,reps:'10',rest:90,group:'TS1',methodId:'triset'},
      {name:'Alzate frontali con disco',sets:3,reps:'10',rest:90,group:'TS1',methodId:'triset'},
      {name:'Addome alle parallele',sets:4,reps:'MAX',rest:90,method:'Se possibile, utilizzare le cavigliere come sovraccarico'}
    ]
  }
];

const exerciseLibrary = [
  // Petto
  ['Petto','Panca piana bilanciere'],['Petto','Panca piana manubri'],['Petto','Panca inclinata bilanciere'],['Petto','Panca inclinata manubri'],['Petto','Panca declinata'],['Petto','Chest press convergente'],['Petto','Chest press'],['Petto','Pectoral machine'],['Petto','Croci ai cavi alti'],['Petto','Croci ai cavi bassi'],['Petto','Croci manubri panca piana'],['Petto','Croci manubri panca inclinata'],['Petto','Push-up'],['Petto','Push-up inclinati'],['Petto','Dip alle parallele'],['Petto','Pullover manubrio'],
  // Schiena
  ['Schiena','Trazioni presa prona'],['Schiena','Trazioni presa supina'],['Schiena','Trazioni presa neutra'],['Schiena','Lat machine avanti'],['Schiena','Lat machine presa stretta'],['Schiena','Lat machine presa inversa'],['Schiena','Rematore bilanciere'],['Schiena','Rematore manubrio'],['Schiena','Rematore chest-supported'],['Schiena','Pulley basso'],['Schiena','Pulley presa larga'],['Schiena','Pulldown braccia tese'],['Schiena','Pullover ai cavi'],['Schiena','T-bar row'],['Schiena','Seal row'],['Schiena','Reverse fly ai cavi'],['Schiena','Back extension'],
  // Spalle
  ['Spalle','Military press bilanciere'],['Spalle','Shoulder press manubri'],['Spalle','Arnold press'],['Spalle','Alzate laterali manubri'],['Spalle','Alzate laterali ai cavi'],['Spalle','Alzate laterali macchina'],['Spalle','Alzate frontali manubri'],['Spalle','Alzate frontali disco'],['Spalle','Face pull'],['Spalle','Reverse pec deck'],['Spalle','Scrollate manubri'],['Spalle','Scrollate bilanciere'],
  // Bicipiti
  ['Bicipiti','Curl bilanciere dritto'],['Bicipiti','Curl bilanciere EZ'],['Bicipiti','Curl manubri alternato'],['Bicipiti','Curl manubri su panca inclinata'],['Bicipiti','Curl panca Scott'],['Bicipiti','Curl martello'],['Bicipiti','Curl ai cavi bassi'],['Bicipiti','Curl ai cavi alti'],['Bicipiti','Curl concentrato'],['Bicipiti','Bayesian curl'],
  // Tricipiti
  ['Tricipiti','French press EZ'],['Tricipiti','French press manubri'],['Tricipiti','Pushdown corda'],['Tricipiti','Pushdown barra'],['Tricipiti','Estensioni sopra la testa al cavo'],['Tricipiti','Estensioni singolo braccio al cavo'],['Tricipiti','Estensioni manubrio dietro nuca'],['Tricipiti','Dip panca'],['Tricipiti','Panca presa stretta'],
  // Quadricipiti e posterior chain
  ['Gambe','Squat bilanciere'],['Gambe','Front squat'],['Gambe','Goblet squat'],['Gambe','Hack squat'],['Gambe','Leg press'],['Gambe','Leg extension'],['Gambe','Affondi camminati'],['Gambe','Affondi indietro'],['Gambe','Bulgarian split squat'],['Gambe','Step-up'],['Gambe','Sissy squat'],['Gambe','Stacco rumeno'],['Gambe','Stacco gambe tese'],['Gambe','Leg curl sdraiato'],['Gambe','Leg curl seduto'],['Gambe','Nordic curl'],['Gambe','Good morning'],['Gambe','Glute ham raise'],
  // Glutei / polpacci
  ['Glutei','Hip thrust bilanciere'],['Glutei','Glute bridge'],['Glutei','Abductor machine'],['Glutei','Adductor machine'],['Glutei','Kickback al cavo'],['Glutei','Pull-through ai cavi'],['Glutei','Back extension focus glutei'],['Polpacci','Calf raise in piedi'],['Polpacci','Calf raise seduto'],['Polpacci','Calf press alla leg press'],
  // Core / conditioning / funzionale
  ['Addome','Crunch a terra'],['Addome','Crunch ai cavi'],['Addome','Cable crunch'],['Addome','Plank'],['Addome','Side plank'],['Addome','Sollevamento gambe alla sbarra'],['Addome','Sollevamento ginocchia alle parallele'],['Addome','Ab wheel'],['Addome','Dead bug'],['Addome','Pallof press'],['Addome','Russian twist'],['Funzionale','Farmer walk'],['Funzionale','Sled push'],['Funzionale','Battle rope'],['Funzionale','Kettlebell swing'],['Funzionale','Burpee'],['Funzionale','Box jump'],['Funzionale','Mountain climber'],['Funzionale','Rematore TRX'],['Funzionale','Push-up TRX']
].map((x,i)=>({id:'ex'+i, muscle:x[0], name:x[1]}));

const trainingMethods = [
  {id:'normal',label:'Serie normali',short:'NORMALE',help:'Serie tradizionali con recupero completo tra una serie e la successiva.'},
  {id:'restpause',label:'Rest-pause',short:'REST-PAUSE',help:'Serie principale, breve pausa (es. 10–20 secondi) e mini-serie aggiuntive.'},
  {id:'dropset',label:'Drop set',short:'DROP SET',help:'Riduci il carico senza recupero significativo e continua le ripetizioni.'},
  {id:'superset',label:'Superset',short:'SUPERSET',help:'Alterna due esercizi consecutivi; recupera solo dopo aver completato entrambi.'},
  {id:'triset',label:'Triset',short:'TRISET',help:'Esegui tre esercizi in sequenza prima del recupero.'},
  {id:'giantset',label:'Giant set',short:'GIANT SET',help:'Sequenza di almeno quattro esercizi prima del recupero.'},
  {id:'myoreps',label:'Myo-reps',short:'MYO-REPS',help:'Serie di attivazione, breve pausa e mini-serie ravvicinate.'},
  {id:'cluster',label:'Cluster set',short:'CLUSTER',help:'Suddividi le ripetizioni in piccoli blocchi con micro-pause programmate.'},
  {id:'pyramid',label:'Piramidale',short:'PIRAMIDALE',help:'Modifica progressivamente carico e ripetizioni tra le serie.'},
  {id:'tempo',label:'Tempo controllato',short:'TEMPO',help:'Imposta la durata della fase eccentrica, pausa e fase concentrica.'},
  {id:'amrap',label:'AMRAP',short:'AMRAP',help:'Completa il massimo numero di ripetizioni mantenendo la tecnica.'},
  {id:'isometric',label:'Isometria',short:'ISOMETRIA',help:'Mantieni una posizione o contrazione per un tempo definito.'}
];

const initial = {
  routines: [{id:'marco001',name:'Scheda Marco (001)',days:marcoPlan,source:'PDF personale'}],
  sessions: [], measurements: [], bodyWeight: [], customExercises:[]
};

function Btn({title,onPress,kind='primary',small=false}) {
  return <TouchableOpacity onPress={onPress} style={[s.btn,kind==='ghost'&&s.btnGhost,kind==='soft'&&s.btnSoft,small&&s.btnSmall]}>
    <Text style={[s.btnText,kind==='ghost'&&{color:C.text},kind==='soft'&&{color:C.accent}]}>{title}</Text>
  </TouchableOpacity>;
}
function Card({children,style}) { return <View style={[s.card,style]}>{children}</View>; }
function Heading({children,sub}) { return <View style={{marginBottom:14}}><Text style={s.h1}>{children}</Text>{sub?<Text style={s.sub}>{sub}</Text>:null}</View>; }
function Field({label,value,onChange,placeholder,keyboardType='default'}) {
  return <View style={{marginBottom:10}}><Text style={s.label}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#65758D" keyboardType={keyboardType} style={s.input}/></View>;
}
function MiniStat({label,value}) { return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>; }

export default function App() {
  const [data,setData] = useState(initial);
  const [ready,setReady] = useState(false);
  const [tab,setTab] = useState('Home');
  const [selectedRoutine,setSelectedRoutine] = useState('marco001');
  const [selectedDay,setSelectedDay] = useState(0);
  const [active,setActive] = useState(null);
  const [setInputs,setSetInputs] = useState({});
  const [timer,setTimer] = useState(0);
  const [timerRunning,setTimerRunning] = useState(false);
  const [weight,setWeight] = useState('');
  const [reps,setReps] = useState('');
  const [note,setNote] = useState('');
  const [measureWeight,setMeasureWeight] = useState('');
  const [measureWaist,setMeasureWaist] = useState('');
  const [measureChest,setMeasureChest] = useState('');
  const [measureArm,setMeasureArm] = useState('');
  const [measureLeg,setMeasureLeg] = useState('');
  const [exerciseSearch,setExerciseSearch] = useState('');
  const [newRoutineName,setNewRoutineName] = useState('');
  const [newExerciseName,setNewExerciseName] = useState('');
  const [exerciseSearchAdd,setExerciseSearchAdd] = useState('');
  const [methodToAdd,setMethodToAdd] = useState('normal');
  const [groupToAdd,setGroupToAdd] = useState('A');
  const [restToAdd,setRestToAdd] = useState('90');
  const [repsToAdd,setRepsToAdd] = useState('8-12');
  const [setsToAdd,setSetsToAdd] = useState('3');

  useEffect(()=>{ (async()=>{
    try {
      const raw=await AsyncStorage.getItem('replog-v1');
      if(raw) {
        const saved=JSON.parse(raw);
        setData({...initial,...saved});
      }
    } catch(e) { console.warn('Lettura archivio locale non riuscita',e); }
    setReady(true);
  })(); },[]);
  useEffect(()=>{ if(ready) AsyncStorage.setItem('replog-v1',JSON.stringify(data)).catch(e=>console.warn(e)); },[data,ready]);
  useEffect(()=>{
    if(!timerRunning || timer<=0) return;
    const id=setTimeout(()=>setTimer(t=>Math.max(0,t-1)),1000);
    return ()=>clearTimeout(id);
  },[timer,timerRunning]);
  useEffect(()=>{ if(timer===0 && timerRunning) setTimerRunning(false); },[timer,timerRunning]);

  const routine=data.routines.find(r=>r.id===selectedRoutine) || data.routines[0];
  const day=routine?.days?.[selectedDay];
  const allExercises=[...exerciseLibrary,...data.customExercises];
  const filtered=allExercises.filter(e=>(e.name+' '+e.muscle).toLowerCase().includes(exerciseSearch.toLowerCase()));

  function update(patch){setData(d=>({...d,...patch}));}
  function startWorkout(dayIndex) {
    const d=routine.days[dayIndex];
    setActive({routineId:routine.id,dayIndex,dayName:d.name,startedAt:new Date().toISOString(),items:[]});
    setSetInputs({}); setTab('Allenamento'); setTimer(0); setTimerRunning(false);
  }
  function logSet(exercise,index) {
    const key=exercise.name+'-'+index;
    const w=setInputs[key]?.weight ?? '';
    const r=setInputs[key]?.reps ?? exercise.reps;
    const entry={exercise:exercise.name,set:index+1,weight:w===''?null:Number(w),reps:r,at:new Date().toISOString(),group:exercise.group||null,methodId:exercise.methodId||'normal'};
    const sessionRoutine=data.routines.find(r=>r.id===active?.routineId)||routine;
    const sessionExercises=(sessionRoutine?.days?.[active?.dayIndex]?.exercises)||[];
    const groupMembers=exercise.group?sessionExercises.filter(x=>x.group===exercise.group):[];
    const counts=groupMembers.map(x=>active.items.filter(it=>it.exercise===x.name).length);
    const round=counts.length?Math.min(...counts):0;
    const nextInRound=groupMembers.find(x=>x.name!==exercise.name && active.items.filter(it=>it.exercise===x.name).length===round && active.items.filter(it=>it.exercise===x.name).length<x.sets);
    const completesRound=!!exercise.group && !nextInRound;
    setActive(a=>({...a,items:[...a.items,entry]}));
    if(exercise.group && !completesRound) { setTimer(0); setTimerRunning(false); }
    else if(['restpause','myoreps','cluster'].includes(exercise.methodId)) { setTimer(exercise.pauseSeconds||15); setTimerRunning(true); }
    else if(exercise.methodId==='dropset') { setTimer(0); setTimerRunning(false); }
    else { setTimer(exercise.rest||90); setTimerRunning(true); }
  }
  function startMethodTimer(seconds,label) {
    setTimer(seconds); setTimerRunning(true);
    if(label) Alert.alert(label,`Timer avviato: ${seconds} secondi.`);
  }
  function nextExerciseForWorkout(exercises) {
    if(!active || !exercises?.length) return null;
    for(let i=0;i<exercises.length;i++) {
      const e=exercises[i];
      const done=active.items.filter(x=>x.exercise===e.name).length;
      if(done>=e.sets) continue;
      if(e.group) {
        const members=exercises.filter(x=>x.group===e.group);
        const round=Math.min(...members.map(x=>active.items.filter(it=>it.exercise===x.name).length));
        if(done===round) return {exercise:e,index:i,round:round+1};
      } else return {exercise:e,index:i,round:done+1};
    }
    return null;
  }
  function finishWorkout() {
    if(!active) return;
    const session={...active,finishedAt:new Date().toISOString(),durationMinutes:Math.max(1,Math.round((Date.now()-new Date(active.startedAt).getTime())/60000))};
    update({sessions:[session,...data.sessions]});
    setActive(null);setTimerRunning(false);setTimer(0);setTab('Progressi');
    Alert.alert('Allenamento salvato','La sessione è stata archiviata sul dispositivo.');
  }
  function addMeasurement() {
    if(!measureWeight&&!measureWaist&&!measureChest&&!measureArm&&!measureLeg){Alert.alert('Dati mancanti','Inserisci almeno una misura.');return;}
    const m={date:new Date().toISOString(),weight:n(measureWeight),waist:n(measureWaist),chest:n(measureChest),arm:n(measureArm),leg:n(measureLeg)};
    update({measurements:[m,...data.measurements],bodyWeight:measureWeight?[{date:m.date,value:Number(measureWeight)},...data.bodyWeight]:data.bodyWeight});
    setMeasureWeight('');setMeasureWaist('');setMeasureChest('');setMeasureArm('');setMeasureLeg('');
    Alert.alert('Misure salvate','I dati sono stati salvati localmente.');
  }
  function addRoutine() {
    const name=newRoutineName.trim(); if(!name)return;
    const r={id:'custom-'+Date.now(),name,days:[{id:'d-'+Date.now(),name:'Giorno A',focus:'Personalizzato',exercises:[]}],source:'Creata da te'};
    update({routines:[...data.routines,r]});setSelectedRoutine(r.id);setSelectedDay(0);setNewRoutineName('');
  }
  function addCustomExercise() {
    const name=newExerciseName.trim(); if(!name)return;
    update({customExercises:[...data.customExercises,{id:'custom-ex-'+Date.now(),name,muscle:'Personalizzato'}]});
    setNewExerciseName('');
  }
  function addDayToRoutine() {
    const updated=data.routines.map(r=>r.id!==selectedRoutine?r:{...r,days:[...r.days,{id:'day-'+Date.now(),name:`Giorno ${String.fromCharCode(65+r.days.length)}`,focus:'Personalizzato',exercises:[]}]});
    update({routines:updated}); setSelectedDay((routine?.days?.length)||0);
  }
  function addExerciseToRoutine(ex) {
    if(!routine || !day) return;
    const method=trainingMethods.find(m=>m.id===methodToAdd)||trainingMethods[0];
    const group=(['superset','triset','giantset'].includes(methodToAdd))?`${methodToAdd.toUpperCase()}-${groupToAdd.trim()||'A'}`:null;
    const entry={name:ex.name,sets:Math.max(1,Number(setsToAdd)||3),reps:repsToAdd||'8-12',rest:Math.max(0,Number(restToAdd)||90),method:methodToAdd==='normal'?'':method.help,technique:methodToAdd==='normal'?'':method.short,methodId:methodToAdd,group};
    const updated=data.routines.map(r=>r.id!==selectedRoutine?r:{...r,days:r.days.map((d,i)=>i!==selectedDay?d:{...d,exercises:[...d.exercises,entry]})});
    update({routines:updated}); setExerciseSearchAdd('');
  }
  function removeExerciseFromDay(exIndex) {
    const updated=data.routines.map(r=>r.id!==selectedRoutine?r:{...r,days:r.days.map((d,i)=>i!==selectedDay?d:{...d,exercises:d.exercises.filter((_,j)=>j!==exIndex)})});
    update({routines:updated});
  }
  function n(v){return v.trim()===''?null:Number(v.replace(',','.'));}

  const totalVolume=useMemo(()=>data.sessions.reduce((sum,ss)=>sum+ss.items.reduce((a,x)=>a+(Number(x.weight)||0)*(parseFloat(x.reps)||0),0),0),[data.sessions]);
  const lastSession=data.sessions[0];
  const nav=['Home','Schede','Allenamento','Progressi','Misure','Esercizi'];
  const timerText=`${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`;

  if(!ready) return <SafeAreaView style={s.safe}><Text style={s.loading}>REPLOG · caricamento archivio locale…</Text></SafeAreaView>;

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
    <View style={s.topbar}>
      <View><Text style={s.brand}>REP<Text style={{color:C.accent}}>LOG</Text></Text><Text style={s.brandSub}>IL TUO DIARIO DI ALLENAMENTO</Text></View>
      <View style={s.localBadge}><View style={s.dot}/><Text style={s.localText}>LOCALE</Text></View>
    </View>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      {tab==='Home'&&<>
        <Heading sub="Tutto quello che ti serve per allenarti con metodo.">Bentornato, Marco</Heading>
        <View style={s.hero}><Text style={s.heroEyebrow}>LA TUA SCHEDA ATTIVA</Text><Text style={s.heroTitle}>Scheda Marco (001)</Text><Text style={s.heroSub}>3 giorni · Gambe · Schiena/Petto · Braccia/Spalle</Text><Btn title="Apri le schede  →" onPress={()=>setTab('Schede')}/></View>
        <View style={s.statRow}><MiniStat label="Allenamenti" value={String(data.sessions.length)}/><MiniStat label="Volume registrato" value={`${Math.round(totalVolume).toLocaleString('it-IT')} kg`}/><MiniStat label="Schede" value={String(data.routines.length)}/></View>
        <Heading sub="Scegli il giorno da cui partire.">Inizia ad allenarti</Heading>
        {routine?.days?.map((d,i)=><Card key={d.id}><Text style={s.cardTitle}>{d.name}</Text><Text style={s.muted}>{d.exercises.length} esercizi · {d.focus}</Text><Btn title="Inizia questo allenamento" onPress={()=>startWorkout(i)}/></Card>)}
        <Card><Text style={s.cardTitle}>Ultima sessione</Text><Text style={s.muted}>{lastSession?`${lastSession.dayName} · ${new Date(lastSession.finishedAt).toLocaleDateString('it-IT')}`:'Non hai ancora registrato allenamenti.'}</Text></Card>
      </>}
      {tab==='Schede'&&<>
        <Heading sub="Schede base e programmi creati da te.">Le tue schede</Heading>
        {data.routines.map(r=><Card key={r.id}>
          <Text style={s.cardTitle}>{r.name}</Text><Text style={s.muted}>{r.days.length} giorni · {r.source}</Text>
          <View style={s.row}><Btn title="Seleziona" kind="soft" small onPress={()=>{setSelectedRoutine(r.id);setSelectedDay(0)}}/><Btn title="Visualizza" kind="ghost" small onPress={()=>{setSelectedRoutine(r.id);setSelectedDay(0)}}/></View>
          {selectedRoutine===r.id&&<View style={{marginTop:12}}>
            {r.days.map((d,i)=><TouchableOpacity key={d.id} onPress={()=>setSelectedDay(i)} style={[s.dayPill,selectedDay===i&&s.dayPillActive]}><Text style={s.dayPillText}>{d.name}</Text><Text style={s.muted}>{d.exercises.length} esercizi</Text></TouchableOpacity>)}
            {r.days[selectedDay]?.exercises.map((e,i)=><View key={i} style={s.exerciseLine}><Text style={s.exerciseName}>{i+1}. {e.name}</Text><Text style={s.muted}>{e.sets} serie · {e.reps} · recupero {e.rest||90}s</Text>{e.technique||e.group?<Text style={s.tag}>{e.technique|| (e.group?.startsWith('SS')?'SUPERSET':'TRISET')}</Text>:null}{e.method?<Text style={s.noteText}>{e.method}</Text>:null}</View>)}
            <View style={{marginTop:10}}>
              <Text style={s.cardTitle}>Modifica il giorno</Text>
              <Btn title="＋ Aggiungi un giorno" kind="soft" onPress={addDayToRoutine}/>
              <Text style={[s.label,{marginTop:14}]}>Cerca esercizio da aggiungere</Text>
              <TextInput value={exerciseSearchAdd} onChangeText={setExerciseSearchAdd} placeholder="Cerca nella libreria…" placeholderTextColor="#65758D" style={s.input}/>
              <View style={s.row}>
                <View style={{flex:1}}><Field label="Serie" value={setsToAdd} onChange={setSetsToAdd} keyboardType="number-pad"/></View>
                <View style={{flex:1}}><Field label="Ripetizioni" value={repsToAdd} onChange={setRepsToAdd} placeholder="8-12"/></View>
                <View style={{flex:1}}><Field label="Recupero (s)" value={restToAdd} onChange={setRestToAdd} keyboardType="number-pad"/></View>
              </View>
              <Text style={s.label}>Metodo di allenamento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginVertical:7}}>{trainingMethods.map(m=><TouchableOpacity key={m.id} onPress={()=>setMethodToAdd(m.id)} style={[s.methodChip,methodToAdd===m.id&&s.methodChipActive]}><Text style={[s.methodChipText,methodToAdd===m.id&&{color:C.accent}]}>{m.label}</Text></TouchableOpacity>)}</ScrollView>
              {['superset','triset','giantset'].includes(methodToAdd)&&<Field label="Codice gruppo (uguale per gli esercizi collegati)" value={groupToAdd} onChange={setGroupToAdd} placeholder="A"/>}
              <Text style={s.noteText}>{trainingMethods.find(m=>m.id===methodToAdd)?.help}</Text>
              {allExercises.filter(e=>(e.name+' '+e.muscle).toLowerCase().includes(exerciseSearchAdd.toLowerCase())).slice(0,8).map(e=><View key={e.id} style={[s.rowBetween,{paddingVertical:8,borderBottomWidth:1,borderBottomColor:C.line}]}><View style={{flex:1}}><Text style={s.exerciseName}>{e.name}</Text><Text style={s.muted}>{e.muscle}</Text></View><Btn title="Aggiungi" small onPress={()=>addExerciseToRoutine(e)}/></View>)}
            </View>
            {r.days[selectedDay]?.exercises.length>0&&<Btn title="Avvia questo giorno" onPress={()=>startWorkout(selectedDay)}/>}
          </View>}
        </Card>)}
        <Card><Text style={s.cardTitle}>Crea una scheda personalizzata</Text><Field label="Nome scheda" value={newRoutineName} onChange={setNewRoutineName} placeholder="Es. Ipertrofia 4 giorni"/><Btn title="Crea scheda" onPress={addRoutine}/><Text style={s.muted}>La prima versione crea una scheda con Giorno A; potrai ampliare giorni ed esercizi nelle prossime iterazioni.</Text></Card>
      </>}
      {tab==='Allenamento'&&<>
        <Heading sub="Registra ogni serie. I dati restano sul telefono.">Allenamento</Heading>
        {!active?<Card><Text style={s.cardTitle}>Nessun allenamento attivo</Text><Text style={s.muted}>Apri Schede o Home e avvia uno dei tuoi giorni.</Text><Btn title="Vai alle schede" onPress={()=>setTab('Schede')}/></Card>:
        <>
          <Card><Text style={s.heroEyebrow}>SESSIONE IN CORSO</Text><Text style={s.cardTitle}>{active.dayName}</Text><Text style={s.muted}>Serie registrate: {active.items.length} · guida automatica attiva</Text><View style={s.timerBox}><Text style={s.timerLabel}>RECUPERO</Text><Text style={s.timerValue}>{timerText}</Text><View style={s.row}><Btn title={timerRunning?'Pausa':'Riprendi'} kind="soft" small onPress={()=>setTimerRunning(v=>!v)}/><Btn title="+30 sec" kind="ghost" small onPress={()=>setTimer(t=>t+30)}/><Btn title="Azzera" kind="ghost" small onPress={()=>{setTimer(0);setTimerRunning(false)}}/></View></View></Card>
          {(()=>{
            const activeRoutine=data.routines.find(r=>r.id===active.routineId)||routine;
            const workoutExercises=activeRoutine.days[active.dayIndex].exercises;
            const nextTask=nextExerciseForWorkout(workoutExercises);
            return <>
              {nextTask&&<Card style={{borderColor:C.accent,borderWidth:1.5}}>
                <Text style={s.heroEyebrow}>PROSSIMO PASSAGGIO</Text>
                <Text style={s.cardTitle}>{nextTask.exercise.name}</Text>
                <Text style={s.muted}>{nextTask.exercise.group?`Round ${nextTask.round} · ${nextTask.exercise.group}`:`Serie ${nextTask.round} di ${nextTask.exercise.sets}`} · obiettivo {nextTask.exercise.reps}</Text>
                {nextTask.exercise.group&&<Text style={s.noteText}>Sequenza automatica: passa all’esercizio successivo del gruppo senza recupero. Il recupero partirà al termine del round.</Text>}
              </Card>}
              {workoutExercises.map((e,i)=>{
                const done=active.items.filter(x=>x.exercise===e.name).length;
                const isNext=nextTask?.index===i;
                const groupMembers=e.group?workoutExercises.filter(x=>x.group===e.group):[];
                const groupRound=e.group?Math.min(...groupMembers.map(x=>active.items.filter(it=>it.exercise===x.name).length)):0;
                const groupLabel=e.group?(e.group.toLowerCase().startsWith('superset')||e.group.startsWith('SS')?'SUPERSET':e.group.toLowerCase().startsWith('triset')||e.group.startsWith('TS')?'TRISET':'GIANT SET'):null;
                return <Card key={i} style={isNext?{borderColor:C.accent,borderWidth:1.5}:null}>
                  <View style={s.rowBetween}><Text style={s.cardTitle}>{i+1}. {e.name}</Text><Text style={s.tag}>{done}/{e.sets}</Text></View>
                  <Text style={s.muted}>{e.reps} · recupero {e.rest||90}s</Text>
                  {e.method?<Text style={s.noteText}>{e.method}</Text>:null}
                  {e.methodId&&e.methodId!=='normal'?<Text style={s.tag}>METODO: {trainingMethods.find(m=>m.id===e.methodId)?.short||e.technique}</Text>:null}
                  {e.group?<Text style={s.tag}>{groupLabel} {e.group} · round {Math.min(groupRound+1,Math.max(...groupMembers.map(x=>x.sets)))}</Text>:null}
                  {e.methodId==='restpause'&&<View><Text style={s.noteText}>Dopo ogni blocco registrato parte automaticamente la micro-pausa; poi esegui la mini-serie successiva.</Text><Btn title={`Avvia micro-pausa manuale · ${e.pauseSeconds||15}s`} kind="soft" small onPress={()=>startMethodTimer(e.pauseSeconds||15,'Rest-pause')}/></View>}
                  {e.methodId==='dropset'&&<Btn title="Riduci il carico e avvia la serie successiva" kind="soft" small onPress={()=>{setTimer(0);setTimerRunning(false);Alert.alert('Drop set',"Riduci subito il carico, senza recupero, e registra le ripetizioni aggiuntive come nuova serie.")}}/>}
                  {(e.methodId==='cluster'||e.methodId==='myoreps')&&<View><Text style={s.noteText}>Dopo ogni blocco registrato parte automaticamente una micro-pausa di {e.pauseSeconds||15} secondi.</Text><Btn title="Avvia micro-pausa manuale" kind="soft" small onPress={()=>startMethodTimer(e.pauseSeconds||15,e.methodId==='cluster'?'Cluster set':'Myo-reps')}/></View>}
                  {e.methodId==='isometric'&&<Btn title="Avvia tenuta isometrica · 10s" kind="soft" small onPress={()=>startMethodTimer(10,'Tenuta isometrica')}/>}
                  {e.methodId==='tempo'&&<Btn title="Avvia fase controllata · 4s" kind="soft" small onPress={()=>startMethodTimer(4,'Tempo controllato')}/>}
                  {isNext?<>
                    <View style={s.row}>
                      <View style={{flex:1}}><Field label="Peso (kg)" value={setInputs[e.name+'-'+done]?.weight||''} onChange={v=>setSetInputs(p=>({...p,[e.name+'-'+done]:{...p[e.name+'-'+done],weight:v}}))} placeholder="Es. 40" keyboardType="decimal-pad"/></View>
                      <View style={{flex:1}}><Field label="Ripetizioni" value={setInputs[e.name+'-'+done]?.reps||''} onChange={v=>setSetInputs(p=>({...p,[e.name+'-'+done]:{...p[e.name+'-'+done],reps:v}}))} placeholder={e.reps}/></View>
                    </View>
                    <Btn title={e.group?'Registra e passa al prossimo esercizio':'Registra serie'} onPress={()=>logSet(e,done)}/>
                  </>:<Text style={s.muted}>{done>=e.sets?'Completato':e.group?'In attesa del proprio turno nel round':"In attesa · completa prima l’esercizio precedente"}</Text>}
                </Card>;
              })}
            </>;
          })()}
          <Btn title="Termina e salva allenamento" onPress={finishWorkout}/>
        </>}
      </>}
      {tab==='Progressi'&&<>
        <Heading sub="Carichi, volume e costanza nel tempo.">I tuoi progressi</Heading>
        <View style={s.statRow}><MiniStat label="Sessioni" value={String(data.sessions.length)}/><MiniStat label="Volume totale" value={`${Math.round(totalVolume)} kg`}/><MiniStat label="Misurazioni" value={String(data.measurements.length)}/></View>
        <Card><Text style={s.cardTitle}>Storico allenamenti</Text>{data.sessions.length===0?<Text style={s.muted}>Completa il primo allenamento per iniziare a vedere lo storico.</Text>:data.sessions.map((ss,i)=><View key={i} style={s.exerciseLine}><Text style={s.exerciseName}>{ss.dayName}</Text><Text style={s.muted}>{new Date(ss.finishedAt).toLocaleString('it-IT')} · {ss.items.length} serie · {ss.durationMinutes} min</Text></View>)}</Card>
        <Card><Text style={s.cardTitle}>Peso corporeo</Text>{data.bodyWeight.length<2?<Text style={s.muted}>Registra almeno due pesate per visualizzare il grafico.</Text>:<WeightChart values={data.bodyWeight.slice(0,12).reverse().map(x=>x.value)}/>}</Card>
        <Card><Text style={s.cardTitle}>Volume per esercizio</Text><Text style={s.muted}>Il volume è calcolato come carico × ripetizioni delle serie registrate con peso numerico e ripetizioni numeriche.</Text></Card>
      </>}
      {tab==='Misure'&&<>
        <Heading sub="Peso e circonferenze, con data e storico.">Misure corporee</Heading>
        <Card><Text style={s.cardTitle}>Nuova rilevazione</Text><Field label="Peso (kg)" value={measureWeight} onChange={setMeasureWeight} placeholder="Es. 70,5" keyboardType="decimal-pad"/><Field label="Vita (cm)" value={measureWaist} onChange={setMeasureWaist} placeholder="Es. 82" keyboardType="decimal-pad"/><Field label="Torace (cm)" value={measureChest} onChange={setMeasureChest} placeholder="Es. 98" keyboardType="decimal-pad"/><Field label="Braccio (cm)" value={measureArm} onChange={setMeasureArm} placeholder="Es. 35" keyboardType="decimal-pad"/><Field label="Coscia (cm)" value={measureLeg} onChange={setMeasureLeg} placeholder="Es. 56" keyboardType="decimal-pad"/><Btn title="Salva misurazione" onPress={addMeasurement}/></Card>
        <Card><Text style={s.cardTitle}>Storico misurazioni</Text>{data.measurements.length===0?<Text style={s.muted}>Nessuna misurazione registrata.</Text>:data.measurements.map((m,i)=><View key={i} style={s.exerciseLine}><Text style={s.exerciseName}>{new Date(m.date).toLocaleDateString('it-IT')}</Text><Text style={s.muted}>{[['Peso',m.weight,'kg'],['Vita',m.waist,'cm'],['Torace',m.chest,'cm'],['Braccio',m.arm,'cm'],['Coscia',m.leg,'cm']].filter(x=>x[1]!=null).map(x=>`${x[0]} ${x[1]} ${x[2]}`).join(' · ')}</Text></View>)}</Card>
      </>}
      {tab==='Esercizi'&&<>
        <Heading sub={`${allExercises.length} esercizi disponibili · cerca per nome o gruppo muscolare.`}>Libreria esercizi</Heading>
        <Field label="Cerca esercizio" value={exerciseSearch} onChange={setExerciseSearch} placeholder="Es. panca, schiena, tricipiti…"/>
        <Card><Text style={s.muted}>{filtered.length} risultati</Text>{filtered.map(e=><View key={e.id} style={s.exerciseLine}><Text style={s.exerciseName}>{e.name}</Text><Text style={s.muted}>{e.muscle}</Text></View>)}</Card>
        <Card><Text style={s.cardTitle}>Aggiungi esercizio personalizzato</Text><Field label="Nome esercizio" value={newExerciseName} onChange={setNewExerciseName} placeholder="Es. Pullover ai cavi"/><Btn title="Aggiungi alla libreria" onPress={addCustomExercise}/></Card>
      </>}
    </ScrollView>
    <View style={s.nav}>{nav.map(n=><TouchableOpacity key={n} onPress={()=>setTab(n)} style={[s.navItem,tab===n&&s.navActive]}><Text style={[s.navText,tab===n&&s.navTextActive]}>{n==='Home'?'⌂':n==='Schede'?'▤':n==='Allenamento'?'▶':n==='Progressi'?'↗':n==='Misure'?'◉':'＋'}</Text><Text style={[s.navCaption,tab===n&&s.navTextActive]}>{n==='Home'?'Inizio':n}</Text></TouchableOpacity>)}</View>
  </SafeAreaView>;
}

function WeightChart({values}) {
  const max=Math.max(...values), min=Math.min(...values), range=Math.max(1,max-min);
  const points=values.map((v,i)=>`${12+i*(276/(values.length-1))},${88-((v-min)/range)*65}`).join(' ');
  return <View><Svg width="100%" height="110" viewBox="0 0 300 105"><Line x1="10" y1="90" x2="290" y2="90" stroke={C.line}/><Polyline points={points} fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{values.map((v,i)=><Circle key={i} cx={12+i*(276/(values.length-1))} cy={88-((v-min)/range)*65} r="4" fill={C.accent}/>)}</Svg><Text style={s.muted}>Da {min} kg a {max} kg · ultimi {values.length} rilevamenti</Text></View>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},loading:{color:C.text,margin:30},topbar:{paddingHorizontal:20,paddingTop:10,paddingBottom:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:C.line},
  brand:{fontSize:25,fontWeight:'900',letterSpacing:2,color:C.text},brandSub:{fontSize:8,color:C.muted,letterSpacing:1.6,marginTop:1},localBadge:{flexDirection:'row',alignItems:'center',backgroundColor:'#18352F',paddingHorizontal:10,paddingVertical:7,borderRadius:20},dot:{width:7,height:7,borderRadius:5,backgroundColor:C.accent,marginRight:6},localText:{color:C.accent,fontSize:10,fontWeight:'800',letterSpacing:1},
  content:{padding:16,paddingBottom:30},h1:{fontSize:27,fontWeight:'800',color:C.text,marginBottom:4},sub:{color:C.muted,fontSize:13,lineHeight:19},hero:{backgroundColor:'#18352F',borderRadius:18,padding:18,marginBottom:14,borderWidth:1,borderColor:'#28614D'},heroEyebrow:{color:C.accent,fontWeight:'800',fontSize:10,letterSpacing:1.5},heroTitle:{fontSize:23,color:C.text,fontWeight:'800',marginTop:8},heroSub:{color:'#B8D7CC',marginTop:5,marginBottom:14,fontSize:12},
  card:{backgroundColor:C.panel,borderRadius:16,borderWidth:1,borderColor:C.line,padding:15,marginBottom:12},cardTitle:{fontSize:16,fontWeight:'800',color:C.text,marginBottom:5},muted:{color:C.muted,fontSize:12,lineHeight:18},noteText:{color:'#C5D0DF',fontSize:12,lineHeight:18,marginTop:8},tag:{color:C.orange,fontSize:10,fontWeight:'800',marginTop:5,letterSpacing:.5},
  btn:{backgroundColor:C.accent,borderRadius:11,paddingVertical:12,paddingHorizontal:14,alignItems:'center',marginTop:12},btnGhost:{backgroundColor:C.panel2,borderWidth:1,borderColor:C.line},btnSoft:{backgroundColor:'#18352F',borderWidth:1,borderColor:'#28614D'},btnSmall:{paddingVertical:8,paddingHorizontal:12,marginTop:8},btnText:{color:'#07140F',fontWeight:'800',fontSize:12},
  statRow:{flexDirection:'row',gap:8,marginBottom:18},stat:{flex:1,backgroundColor:C.panel,borderRadius:13,padding:12,borderWidth:1,borderColor:C.line},statValue:{fontSize:17,fontWeight:'900',color:C.text},statLabel:{fontSize:10,color:C.muted,marginTop:4},
  row:{flexDirection:'row',gap:8,alignItems:'center'},rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},dayPill:{padding:11,backgroundColor:C.panel2,borderRadius:10,marginTop:7,borderWidth:1,borderColor:C.line},dayPillActive:{borderColor:C.accent,backgroundColor:'#18352F'},dayPillText:{color:C.text,fontWeight:'700',marginBottom:2},exerciseLine:{borderTopWidth:1,borderTopColor:C.line,paddingVertical:11,marginTop:7},exerciseName:{color:C.text,fontWeight:'700',fontSize:13},timerBox:{marginTop:14,backgroundColor:C.bg,borderRadius:14,padding:14,alignItems:'center'},timerLabel:{color:C.muted,fontSize:10,letterSpacing:2,fontWeight:'800'},timerValue:{fontSize:42,color:C.accent,fontWeight:'900',fontVariant:['tabular-nums'],marginVertical:6},
  methodChip:{paddingHorizontal:11,paddingVertical:8,backgroundColor:C.panel2,borderRadius:18,borderWidth:1,borderColor:C.line,marginRight:7},methodChipActive:{backgroundColor:'#18352F',borderColor:C.accent},methodChipText:{color:C.muted,fontSize:11,fontWeight:'700'},label:{fontSize:11,color:C.muted,fontWeight:'700',marginBottom:5},input:{backgroundColor:C.bg,borderWidth:1,borderColor:C.line,borderRadius:10,color:C.text,paddingHorizontal:12,paddingVertical:10,fontSize:14},nav:{flexDirection:'row',backgroundColor:C.panel,borderTopWidth:1,borderTopColor:C.line,paddingTop:7,paddingBottom:Platform.OS==='ios'?20:8},navItem:{flex:1,alignItems:'center',paddingVertical:3,borderRadius:9},navActive:{backgroundColor:'#18352F'},navText:{color:C.muted,fontSize:18,fontWeight:'800'},navCaption:{color:C.muted,fontSize:8,marginTop:2},navTextActive:{color:C.accent}
});
