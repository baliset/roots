// these are arrays of associated letters that each one can be interchanged for any of the others
// this will be used to build the mischalfim map

const alef   = '\u05d0';
const bet    = '\u05d1';
const gimmel = '\u05d2';
const daled  = '\u05d3';
const he     = '\u05d4';
const vav    = '\u05d5';
const zayin  = '\u05d6';
const chet   = '\u05d7';
const tet    = '\u05d8';
const yod    = '\u05d9';
const kaf    = '\u05db';
const lamed  = '\u05dc';
const mem    = '\u05de';
const nun    = '\u05e0';
const samech = '\u05e1';
const ayin   = '\u05e2';
const pe     = '\u05e4';
const tzadi  = '\u05e6';
const qof    = '\u05e7';
const resh   = '\u05e8';
const shin   = '\u05e9';
const sin    = '\ufb2b';
const tav    = '\u05ea';

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

export type Mischalef = {kind:string, data:MischalefOtiot}

export type MischalefChoices = string[];

export function allChoices(arr:Mischalef[]):MischalefChoices
{
  return Array.from(new Set(arr.map(v=>v.kind))); // get the unique kind strings from array of Mischalef
}

// return abbreviated array whose kind is included in choices from total set
export function filterChosen(arr:Mischalef[], choices:MischalefChoices)
{
  const set:Set<string> = new Set(choices);

  return arr.filter((o)=>set.has(o.kind));
}

export const arrMischalfim:Mischalef[] = [
  // wholesale phonetic families (found in hirsch)
  {kind: 'gutturals', data: [alef, he]},
  {kind: 'gutturals', data: [alef, ayin]},
  {kind: 'gutturals', data: [he, chet]},


  {kind: 'palatals',  data:  [gimmel, qof, kaf, yod]}, // gimmel qof chaf yod!
  {kind: 'labials',   data:   [bet,pe, mem]},           // labials beis, peh, mem
  {kind: 'dentals',   data:   [daled,tet,tav]},             // dalet tes taf
  {kind: 'sibilants', data: [shin,sin,tzadi,samech,zayin]},  // shin sin tzadi samech zayin


  {kind: 'daletzayin', data:[daled, zayin]}, // dalet to zayin
  {kind: 'zayintzadi', data: [zayin,tzadi]}, // zayin tzadi
  {kind: 'tzadi ayin', data: [tzadi,ayin]}, //  tzadi ayin
  {kind: 'tzadi tes',  data:  [tzadi,tet]}, //  tzadi tes

  {kind: 'vav yod',    data:   [vav, yod]}, // vav to yod
  {kind: 'shin taf', data:  [shin, tav]}, // shin to taf
  {kind: 'shin sin', data:  [shin, sin]},    // shin to sin
  {kind: 'lamed resh', data: [lamed, resh] }
];

function buildMischalfim(arr:Mischalef[])
{
  const result:any = {};

  for (let i = 0; i < arr.length; ++i) {
    const set = arr[i].data;
    for (let j = 0; j < set.length; ++j) {
      const key = set[j];
      for (let k = 0; k < set.length; ++k) {
        const m = set[k];
        if (m !== key) {
          let o = result[key];
          if (o === undefined) {
            o = result[key] = {};
          }
          o[m]=1;
        }
      }  // each item in the set as an entry (excepting the current key itself)
    } // each item in set as the key to create in map
  } // for each set of interchangeable characters

  return result;
}

// check a map of maps mischalfim for letters that substitute for other letters
// and use those to generate a connection. Any mischalef relationship will do
 const mischalfim = buildMischalfim(arrMischalfim);

export function mischalef(a:Ot,b:Ot)
{
  const ao = mischalfim[a];

  return (ao && ao[b]);
}
