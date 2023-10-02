import React, {useCallback, useEffect, useState} from 'react';
import {MyGrid} from "./MyGrid";
import { rootsColumnDefs} from "../xform/columndefs";
import {actions} from "../actions-integration";
import {selectors} from "../actions/selectors";
import {useSelector} from "../actions-integration";
import {CheckGroup} from "./CheckGroup.jsx";
import {roots} from '../roots/roots';

const getRowNodeId = data=>data.id
const gridstyle = {height: '700px', width: '100%'};

export const  RtMidiview = () => {
  const [filter, setFilter]  = useState('');
  const {
  } = useSelector(s=>s);
  // todo this is very inefficient, but fine for now
  const rowData= roots; // instead of midiview


  const ffFilter = o => {
    if (filter === '')
      return true;

    const FILTER = filter.toUpperCase();
    const search = `${o?.cmd ?? ''}${o?.src}${o?.hex}${o?.type}${o?.value?.toString() ?? ''}`.toUpperCase();
    return search.includes(FILTER);
  };

  const columnDefs =  rootsColumnDefs;



   return  (
      <>
      <div style={{marginTop:'30px'}}>
      checkboxes were here
      </div>
      <hr/>
        &nbsp;&nbsp;Filter: <input id="gfilter" name="gfilter" type="text" value={filter} onChange={event => setFilter(event.target.value)}/>
        &nbsp;&nbsp;<button onClick={()=>{}}>Clear Midi Events</button>
        &nbsp; Midi Event Count:  {rowData.length}

        <hr/>
      <MyGrid style={gridstyle} rowData={rowData.filter(ffFilter)} columnDefs={columnDefs}  getRowNodeId={getRowNodeId}/>
      </>
    );
};
