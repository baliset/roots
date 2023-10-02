
const defCol = {
    sortable:true,
    filter:true,
    enableCellChangeFlash:true,

};

const numberSort = (num1, num2) => {
    return num1 - num2;
};




const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // flats are BEA sharps FC


function vfShoresh(p)
{
  const n = p?.data;
  if(n === undefined)
    return '';

  const pc = n % 12;
  const oct = Math.trunc(n / 12) - 1;
  const {P,E,L} = p.data;

  return `${L}${E}${P}`;


}
function vfMidiNote(p)
{
    const n = p?.value;
    if(n === undefined)
        return '';

    const pc = n % 12;
    const oct = Math.trunc(n / 12) - 1;
    return `${pitchClass[pc]}${oct}`;
}

function vfTime(p)
{
    const n = p?.value;
    if(n === undefined)
        return '';

    const d = new Date(p.value +performance.timeOrigin);

    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds()}`;

}

function toAgColDef(v) {

    if(typeof v === 'string')
       return {...defCol, headerName:v.toUpperCase(), field:v};

    const o = {...v};

   o.cellStyle = {fontSize: '18px'};

    o.headerName = (o.h||o.f).toUpperCase();
    o.field = o.f;
    delete o.f;
    delete o.h;

    return {...defCol, ...o};

}

 const rootsColumns = [
   {f:'id',maxWidth:65, comparator:numberSort},
   {f: 'r', h:'שרש', maxWidth:75},
   {f:'P', h:'פ', maxWidth:50},
   {f:'E', h:'ע', maxWidth:50},
   {f:'L', h:'ל', maxWidth:50},
   {f:'d', h: 'definition', width:500, maxWidth:2000}, //valueFormatter:vfMidiNote

 ].map(o=>({...o, suppressMenu: true, floatingFilter: true, floatingFilterComponentParams: { suppressFilterButton: true }}));



export const rootsColumnDefs = rootsColumns.map(o=>toAgColDef(o)); // xform abbrievated column definitions to AgGrid spec columnDefinitions
