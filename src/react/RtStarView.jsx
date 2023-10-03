import React, {useCallback, useEffect, useState} from 'react';
import {actions} from "../actions-integration";
import {selectors} from "../actions/selectors";
import {useSelector} from "../actions-integration";
import {roots} from '../roots/roots';
import Graph from "react-vis-graph-wrapper";
import "vis-network/styles/vis-network.css";
import {renderGraphData, toRender} from "../roots/myvis.js";

toRender.graphableRows = roots; // the full list
const   defaultGraph = {nodes: [], edges: []};

const defaultOptions = {
  layout: { hierarchical: false},
  edges: { color: "white"}
};

const events =  {
  select: ({ nodes, edges }) => {
    console.log("Selected nodes/edges:", nodes, edges);
  },
  doubleClick: ({ pointer: { canvas } }) => {
  }
}



export const  RtStarView = ()=>{

  const {
  } = useSelector(s=>s);

  const [maxNodes, setMaxNodes] = useState(1995); // get limits.nodes value here
  const [maxEdges, setMaxEdges] = useState(20000); // get limits.edges value here


  const {initialData, initialOptions} = renderGraphData(toRender.graphableRows, maxNodes, maxEdges);
  const [graph, setGraph] = useState(defaultGraph);
  const [options, setOptions] = useState(defaultOptions);

  const chMaxNodes = useCallback((evt)=>{setMaxNodes(evt.target.value)},[]);
  const chMaxEdges = useCallback((evt)=>{setMaxEdges(evt.target.value)},[]);

  const render = useCallback(()=>{

   const { data, options,  nodeMax, edgeMax} = renderGraphData(toRender.graphableRows, maxNodes, maxEdges);
   console.log(`new graphData`, data);
   setGraph(data);
   setOptions(options);
  }, [maxNodes, maxEdges]);

   return  (
      <div key={`${graph.length}-${options.length}`} style={{marginTop:'30px'}}>
        <h1>Star view</h1>

        <label>Maximum number of roots:</label>&nbsp;
        <input type="number" min={1} max={1995} value={maxNodes} onChange={chMaxNodes}/>&nbsp;
        <label>connections:</label>&nbsp;
        <input type="number" min={1} max={1995} value={maxEdges} onChange={chMaxEdges}/>
        <hr/>
        <button onClick={render}>Show results</button>
        <Graph events={events} graph={graph} options={options} style={{  backgroundColor: 'midnightblue', height: "100%", width:"100%"}} />
      </div>

    );
};
