
const defCol = {
    sortable:true,
    filter:true,
    enableCellChangeFlash:true,

};

const numberSort = (num1, num2) => {
    return num1 - num2;
};




const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']; // flats are BEA sharps FC


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


    o.headerName = (o.h||o.f).toUpperCase();
    o.field = o.f;
    delete o.f;
    delete o.h;

    return {...defCol, ...o};

}


 const midiColumns = [
    {f:'id', maxWidth:65, comparator:numberSort,},
    {f:'time', maxWidth:130, comparator:numberSort, valueFormatter:vfTime },
    {f:'dir', maxWidth:50},
    {f: 'src', minWidth:200, maxWidth:200},
    {f:'ch', minWidth:50, maxWidth:50, comparator:numberSort,},
    {f:'note', minWidth:65, maxWidth: 65, comparator:numberSort, valueFormatter:vfMidiNote},  // todo formatter that displays number as string, filter, etc.
    {f:'cmd',  maxWidth:350},
    {f:'type', minWidth:80, maxWidth:80},
    {f:'value', maxWidth:70},
    {f:'hex', maxWidth:250},
].map(o=>({...o,  suppressMenu: true, floatingFilter: true, floatingFilterComponentParams: { suppressFilterButton: true }}));



export const midiColumnDefs = midiColumns.map(o=>toAgColDef(o)); // xform abbrievated column definitions to AgGrid spec columnDefinitions
