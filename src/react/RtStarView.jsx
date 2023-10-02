import React, {useCallback, useEffect, useState} from 'react';
import {actions} from "../actions-integration";
import {selectors} from "../actions/selectors";
import {useSelector} from "../actions-integration";
import {roots} from '../roots/roots';


export const  RtStarView = ()=>{

  const {
  } = useSelector(s=>s);

  const [maxNodes, setMaxNodes] = useState(100); // get limits.nodes value here
  const [maxEdges, setMaxEdges] = useState(200); // get limits.edges value here

  const chMaxNodes = useCallback((evt)=>{setMaxNodes(evt.target.value)},[]);
  const chMaxEdges = useCallback((evt)=>{setMaxEdges(evt.target.value)},[]);

//<input type="text" ref={refInput} value={editText}  onChange={chValue} onBlur={blValue} style={{width: "100%"}}/>;

  const render = useCallback(()=>{alert(`render here`)})

   return  (
      <div style={{marginTop:'30px'}}>
        <h1>Star view</h1>

        <label>Maximum number of roots:</label>&nbsp;
        <input type="number" min={1} max={1995} value={maxNodes} onChange={chMaxNodes}/>&nbsp;
        <label>connections:</label>&nbsp;
        <input type="number" min={1} max={1995} value={maxEdges} onChange={chMaxEdges}/>
        <hr/>
        <button onClick={render}>Show results</button>

      </div>

    );
};
