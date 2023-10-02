import React, {useCallback, useEffect, useState} from 'react';
import {actions} from "../actions-integration";
import {selectors} from "../actions/selectors";
import {useSelector} from "../actions-integration";
import {roots} from '../roots/roots';
import Graph from "react-graph-vis";
import "vis-network/styles/vis-network.css";


const   defaultGraph = {
    nodes: [
      { id: 1, label: "Node 1", color: "#e04141" },
      { id: 2, label: "Node 2", color: "#e09c41" },
      { id: 3, label: "Node 3", color: "#e0df41" },
      { id: 4, label: "Node 4", color: "#7be041" },
      { id: 5, label: "Node 5", color: "#41e0c9" }
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 2, to: 5 }
    ]
  };

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "white"
  }
};

export const  RtStarView = ()=>{

  const {
  } = useSelector(s=>s);

  const [graph, setGraph] = useState(defaultGraph);
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
        <div style={{  backgroundColor: 'midnightblue'}}>
        <Graph graph={graph} options={options} style={{ height: "640px" }} />
        </div>
      </div>

    );
};
