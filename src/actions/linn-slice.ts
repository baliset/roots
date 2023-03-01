import {expandScales, escale, twelveFor } from '../theory/scales-generated'

interface TuningSubstate {
  tuningPref: 'current'|'default'|'explore'; // what should linnstrument show, the defaults, current settings, or explore a new one

 }


export type ScaleInfo = {
  scaleIndex: number;
  scaleName: string;
  scaleType: number;
  scaleSteps: number[];
  scaleNotes: number[];
  scaleNoteNames:escale;
  scaleMappedToKeys: number[];  // given 12 keys starting at C natural, which numbers are they if any in order of the scale?
  keyboardMapped:string[];      // an array of twenty four keys in ui that shows the current scale on white and black keys
  twelve:string[];
}

export type LinnState = ScaleInfo & {
  scaleCount: number;  // total number of scales
  deviceColumns:number;
  baseMidiNote: 30;  // this is a fixed note numbner
  transposeSemis:number;
  tonic: number;
  midiView:Record<number, Record<string, any>>;
  tuningOffsetSemis:number; // 5 = fourths
  tuningSubState:TuningSubstate;
}

type LinnCreator = (s:LinnState,...rest: any)=>unknown;
type LinnCreators = Record<string, LinnCreator>;
type LinnReducer = (s:LinnState,...rest: any)=>LinnState;
type LinnReducers = Record<string, LinnReducer>;

interface SliceConfig {
  name: string;
  reducers: LinnReducers;
  creators: LinnCreators;
  initialState: LinnState;
}

const expanded = expandScales();

function deriveScaleNotes(tonic:number, scaleIndex:number):number[]
{
  const {semis} = expanded[scaleIndex];
  const tt =  [0, ...semis].map((v,i,a)=>a.slice(0,i+1));
  return tt.map(aa=> aa.reduce((a,v) => (a+v)%12, tonic));
}

function mapScaleToKeys(scaleNotes:number[]): number[]
{
  const t = [
    0,0,0,0,
    0,0,0,0,
    0,0,0,0,
  ];
  scaleNotes.slice(0,-1).forEach((n,i)=>t[n]=i+1);
  return t;
}

/*

      scaleNotes: deriveScaleNotes(value, s.scaleSteps),
      scaleMappedToKeys: mapScaleToKeys(deriveScaleNotes(value, s.scaleSteps))
 */
const firstTonic = 0;
const scaleIndex = 0;


function partial(tonic:number, scaleIndex:number) :ScaleInfo
{
  const {count:scaleType, name:scaleName, semis:scaleSteps,perTonicScales} =  expanded[scaleIndex];

  const scaleNotes        =  deriveScaleNotes(firstTonic, scaleIndex);
  const scaleMappedToKeys = mapScaleToKeys(scaleNotes);
  const scaleNoteNames = perTonicScales[tonic];

  const twelve = twelveFor(tonic, expanded[scaleIndex]);
  const keyboardMapped:string[] = new Array(24).fill('');
  for(let i = 0; i < 12; ++i)
    keyboardMapped[tonic+i] = twelve[i];
  keyboardMapped[tonic+12] = twelve[0];

  return {
    scaleNotes,
    scaleNoteNames,
    scaleMappedToKeys,
    scaleIndex,
    scaleName,
    scaleType,
    scaleSteps,
    keyboardMapped,
    twelve,
  };
}

const initialState:LinnState = {
  tonic: firstTonic,
  ...partial(firstTonic,scaleIndex),
  deviceColumns:25,
  scaleCount: expanded.length,
  baseMidiNote: 30,
  transposeSemis:0,
  midiView: {}, // nothing recorded
  tuningOffsetSemis: 5, //
  tuningSubState: {tuningPref: 'explore'},

};




// type value will be added automatically to creators to match the key, or better yet to match the slice/key
const creators:LinnCreators = {
  tonic: (value) => ({value}),
  scale: (value) => ({value}),
  clearMidiView:()=>({}),
  updateMidiView:(record)=>({record}),
  transposeSemis:(transposeSemis)=>({transposeSemis}),
  tuningOffsetSemis:(tuningOffsetSemis)=>({tuningOffsetSemis}),
  tuningPref: (tuningPref)=>({tuningPref}),
};

const reducers:LinnReducers = {
    tonic: (s, {value}) => ({
      ...s,
      tonic: value,
      ...partial(value, s.scaleIndex)
    }),
    scale: (s, {value}) => {
      return {
        ...s,
        ...partial(s.tonic,value),
      }
    },
    clearMidiView: (s) => ({...s, midiView: {}}),
    updateMidiView:(s, {record}) => ({...s, midiView: {...s.midiView, [record.id]:record}}),
    transposeSemis:(s, {transposeSemis})=>({...s, transposeSemis}),
    tuningOffsetSemis:(s, {tuningOffsetSemis})=>({...s, tuningOffsetSemis}),
    tuningPref: (s, {tuningPref})=>({...s, tuningSubState: {...s.tuningSubState, tuningPref}}),

};


export const sliceConfig:SliceConfig = {name: 'linn', creators, initialState, reducers};

