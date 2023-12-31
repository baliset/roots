/**
 * Created by hzamir on 10/13/14. revised 10/2/2023
 */
import {arrMischalfim, vav} from "./mischalfim";


function buildMischalfim(arr)
{
    const result = {};

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
let mischalfim = buildMischalfim(arrMischalfim);

export function mischalef(a,b)
{
    const ao = mischalfim[a];

    return (ao && ao[b]);
}


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



function atLeastTwoMatch(p,e,l, cand)
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
    return (e === vav && root.L === l && p === root.P &&  root.E === root.L );
}

// maybe revise with option that first letter is identical, and not always connect because first letter is also mischalef
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
let  useVavToDoubled = true;
let removeFree = false;

// return index of matching item from
function findEdge(p,e,l, roots, index)
{
    const cand = roots[index];

    if (atLeastTwoMatch(p, e, l, cand)) { // if two of the three letters of shoresh are the same

        // if a remaining letter is a mischalef
        if(mischalef(p, cand.P) || mischalef(e, cand.E) || mischalef(l, cand.L)) {
            return index;
        } else if(useVavToDoubled && doubledLast(p,e,l,cand)) {
            return index;
        }
    // } else if(pairMischalef(p,e,l,cand)) {  // not sure which cases this adds
    //     return index;
    }
    return -1;
}

let mappedNodes = {}
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

    const edge = {from: aidx + 1, to: bidx + 1};
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
   mappedNodes = {};
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
                    mappedNodes[src.r] =true;
                    mappedNodes[roots[j].r] = true;
                }
            }
        }
    } // end for each src root
    return  edges;
}

function diagram(list, nodeMax, edgeMax)
{
     nodeMax = Math.min(nodeMax, list.length);


    let nodes = populateNodes(list, nodeMax);
    console.log(`nodes`, nodes);

    let edges = populateEdges(list, nodeMax, edgeMax);

    // remove anything from list that is not contained in mapped edges
    if(removeFree) {
        const unfreelist = list.filter(o=>mappedNodes[o.r]); // shrink the list, and do it again!
        nodeMax = Math.min(nodeMax, unfreelist.length);

        nodes = populateNodes(unfreelist, nodeMax);
        edges = populateEdges(unfreelist, nodeMax, edgeMax);
    }
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


export function renderGraphData(list, amischalfim, otherChoices, maxNodes, maxEdges)
{
    mischalfim = buildMischalfim(amischalfim);
    useVavToDoubled =   otherChoices.vavToDoubled;
    removeFree = otherChoices.removeFree;
    return diagram(list, maxNodes, maxEdges);
}

// reset graphableRows from outside to communicate what to render
export const toRender = {graphableRows:{}}
