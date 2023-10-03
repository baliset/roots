
const defCol = {
    sortable:true,
    filter:true,
    enableCellChangeFlash:true,

};

const numberSort = (num1, num2) => {
    return num1 - num2;
};


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
