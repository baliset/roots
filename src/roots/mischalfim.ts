import {oReduce} from '../utils/oreduce';
// these are arrays of associated letters that each one can be interchanged for any of the others
// this will be used to build the mischalfim map

export const alef   = '\u05d0';
export const bet    = '\u05d1';
export const gimmel = '\u05d2';
export const daled  = '\u05d3';
export const he     = '\u05d4';
export const vav    = '\u05d5';
export const zayin  = '\u05d6';
export const chet   = '\u05d7';
export const tet    = '\u05d8';
export const yod    = '\u05d9';
export const kaf    = '\u05db';
export const lamed  = '\u05dc';
export const mem    = '\u05de';
export const nun    = '\u05e0';
export const samech = '\u05e1';
export const ayin   = '\u05e2';
export const pe     = '\u05e4';
export const tzadi  = '\u05e6';
export const qof    = '\u05e7';
export const resh   = '\u05e8';
export const shin   = '\u05e9';
export const sin    = '\ufb2b';
export const tav    = '\u05ea';

type Alef   = '\u05d0';
type Bet    = '\u05d1';
type Gimmel = '\u05d2';
type Daled  = '\u05d3';
type He     = '\u05d4';
type Vav    = '\u05d5';
type Zayin  = '\u05d6';
type Chet   = '\u05d7';
type Tet    = '\u05d8';
type Yod    = '\u05d9';
type Kaf    = '\u05db';
type Lamed  = '\u05dc';
type Mem    = '\u05de';
type Nun    = '\u05e0';
type Samech = '\u05e1';
type Ayin   = '\u05e2';
type Pe     = '\u05e4';
type Tzadi  = '\u05e6';
type Qof    = '\u05e7';
type Resh   = '\u05e8';
type Shin   = '\u05e9';
type Sin    = '\ufb2b';
type Tav    = '\u05ea';


export type Ot = Alef|Bet|Gimmel|Daled|He|Vav|Zayin|Chet|Tet|Yod|Kaf|Lamed|Mem|Nun|Samech|Ayin|Pe|Tzadi|Qof|Resh|Shin|Sin|Tav;

export type MischalefOtiot = Ot[];

// export type MischalefGroup = {kind: string, group:MischalefOtiot[]};

export type Mischalef = {kind:string, data:string[]} // typescript complains about using MischalefOtiot

export type MischalefChoices = Record<string, boolean>;


export function allChoices(arr:Mischalef[]):MischalefChoices
{
  return oReduce(arr, (o:Mischalef)=>[o.kind, true], {});  // get the unique kind strings from array of Mischalef all enabled
}



// return abbreviated array whose kind is included in choices from total set
export function filterChosen(arr:Mischalef[], choices:MischalefChoices)
{
  return arr.filter((o)=>choices[o.kind]);
}

// see Etymological Dictionary of Biblical Hebrew, Appendix A page 293 for listing of mischalfim
// also there is appendix b, we should encode all the known cognates there to ensure that they come up
// or are at least emphasized as known cognates

// gradational variants need more work
// aramaisms need to be put named seperately
export const arrMischalfim:Mischalef[] = [
  // wholesale phonetic families (found in hirsch)
  {kind: `gutturals`, data: [alef, he, ayin, chet]},


  {kind: 'palatals',  data:   [gimmel, qof, kaf, yod]}, // gimmel qof chaf yod!
  {kind: 'labials',   data:   [bet,pe, mem]},           // labials beis, peh, mem
  {kind: 'dentals',   data:   [daled,tet,tav]},             // dalet tes taf
  {kind: `sibilants`, data: [shin,sin,tzadi,samech,zayin]},  // shin sin tzadi samech zayin


  {kind: 'daletzayin', data:[daled, zayin]}, // dalet to zayin
  {kind: 'zayintzadi', data: [zayin,tzadi]}, // zayin tzadi
  {kind: 'tzadi ayin', data: [tzadi,ayin]}, //  tzadi ayin
  {kind: 'tzadi tes',  data:  [tzadi,tet]}, //  tzadi tes

  {kind: 'vav yod',    data:   [vav, yod]}, // vav to yod
  {kind: 'shin taf', data:  [shin, tav]}, // shin to taf
  {kind: 'shin sin', data:  [shin, sin]},    // shin to sin
  {kind: 'lamed resh', data: [lamed, resh] }
].map(o=>({...o, kind:`${o.kind}:(${o.data.join('/')})`}));

