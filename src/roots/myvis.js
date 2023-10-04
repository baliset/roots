/**
 * Created by hzamir on 10/13/14. revised 10/2/2023
 */
import {mischalef} from "./mischalfim";

function populateNodes(roots, nodeMax)
{
    const max = Math.min(nodeMax, roots.length);

    return roots.slice(0, max).map((o,i)=>({id:i+1, label:o.r, title:o.d}));

  // const node = {id:i+1, label: root.P + root.E + root.L};
  // if(root.d)
  //   node.title = root.d;
  // else
  //   node.color='cornsilk';

}



function twoMatch(p,e,l, cand)
{
    let matches = 0;
    if(p === cand.P)
        ++matches;
    if(e === cand.E)
        ++matches;
    if(l === cand.L)
        ++matches;

    return matches >= 2;

}

/*
 function containsNameOfHashem()
 {
   // yod heh
   // aleph lamed


 }

function firstOrLastTwoMatch(p,e,l,cand)
{
    if(e === cand.E)
    {
        return (p === cand.P || l === cand.L)
    }
    return false;
}
*/

// if the first letter is the same
// and the second letter is a vav
// and the third letter is the second and third letter or the second root
function doubledLast(p,e,l, root)
{
    if(p === root.P && e ==='\u05d5')
    {
        if(root.E === root.L && root.L === l)
        {
            return true;
        }
    }
    return false;

}

function pairMischalef(p,e,l, cand)
{
return
     if(
         e === l            &&       // doubled src last letters
         cand.E === cand.L  &&       // doubled dst last letters
         (mischalef(e,cand.E)) &&    // pairs are interchangeable
         (p === cand.P || mischalef(p, cand.P)) // first letter is same or interchangeable

     )

     {
         return true;
     } else {
        return false;
      }
}
// return index of matching item from
function findEdge(p,e,l, roots, index)
{
    const cand = roots[index];

    if (twoMatch(p, e, l, cand)) {
        if(mischalef(p, cand.P) || mischalef(e, cand.E) || mischalef(l, cand.L)) {
            return index;
        } else if(doubledLast(p,e,l,cand)) {
            return index;
        }
    } else if(pairMischalef(p,e,l,cand)) {
        return index;
    }
    return -1;
}

let mappedEdges = {};
let edgeCount = 0;
function createEdge(aidx, bidx, edges) {
    if(bidx < 0)
        return null;
    if (aidx === bidx)
        return null;

    // canonical key
    const key = '' + ((aidx < bidx)? (aidx + '_' + bidx) : (bidx + '_' + aidx));

    if (mappedEdges[key])
        return null;

    var edge = {from: aidx + 1, to: bidx + 1};
    mappedEdges[key]=true;
    edgeCount++;

    edges.push(edge);
    return edge;
}


// function dumpEdges(edges)
// {
//     const div =  $('#edges');
//     div.append("edges=[");
//     for(let i = 0; i < edges.length; ++i)
//     {
//         const e = edges[i];
//         div.append("<div>{from:" + e.from + ", to: " + e.to + "},</div>");
//     }
//     div.append("<div>];</div>");
// }
//
// function dumpNodes(nodes)
// {
//     const div =  $('#nodes');
//     div.append("nodes=[");
//     for(let i = 0; i < nodes.length; ++i)
//     {
//         const n = nodes[i];
//         div.append("<div>{id:" + n.id + ", label: '" + n.label + "'},</div>");
//     }
//     div.append("<div>];</div>");
//
// }
//

function populateEdges(roots, hardMax, edgeMax) {
    const edges = [];

   mappedEdges = {};
   edgeCount = 0;


  console.log('populate edges: hardMax', hardMax);
    for (let i = 0, len = hardMax; i < len; ++i) {
        const src = roots[i];
        for(let j = 0, mlen = hardMax; j < mlen; ++j)
        {
            if (edgeCount === edgeMax)
                return edges;
            if (j !== i) {
                const matchindex = findEdge(src.P, src.E, src.L, roots, j);
                if (matchindex >= 0) {
                    createEdge(i, matchindex, edges);
                }
            }
        }
    } // end for each src root
    return edges;
}

function diagram(list, nodeMax, edgeMax)
{
    const nodes = populateNodes(list, nodeMax);
    const edges = populateEdges(list, nodeMax, edgeMax);
//
//        dumpNodes(nodes);
//        dumpEdges(edges);

    const data= {
        nodes: nodes,
        edges: edges
    };
    // const network = new vis.Network(container, data, options);
    return {nodeMax, edgeMax, data};

}


export function renderGraphData(list, maxNodes, maxEdges)
{
    const nodeMax = Math.min(maxNodes, list.length);
    return diagram(list, nodeMax, maxEdges);
}

// reset graphableRows from outside to communicate what to render
export const toRender = {graphableRows:{}}
