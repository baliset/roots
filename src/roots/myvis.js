/**
 * Created by hzamir on 10/13/14.
 */
let hardMax;
let edgeMax;

function populateNodes(roots)
{
    const nodes = [];

    const max = Math.min(hardMax, roots.length);

    for (let i = 0, len = max; i < len; ++i) {
        const root = roots[i];
        const node = {id:i+1, label: root.P + root.E + root.L};
        if(root.d)
          node.title = root.d;
        else
          node.color='cornsilk';
        nodes.push(node);
    }

    return nodes;
}


// these are arrays of associated letters that each one can be interchanged for any of the others
// this will be used to build the mischalfim map
const arrMischalfim = [
  // wholesale phonetic families (found in hirsch)
  {kind: 'gutturals', data: ['\u05d0', '\u05d4', '\u05d7', '\u05e2']}, // alef, he, ches, ayin
  {kind: 'palatals', data:  ['\u05d2','\u05e7', '\u05db', '\u05d9']}, // gimmel qof chaf yod!
  {kind: 'labials', data:   ['\u05d1', '\u05e4', '\u05de']},           // labials beis, peh, mem
  {kind: 'dentals', data:   ['\u05d3','\u05d8','\u05ea' ]},             // dalet tes taf
  {kind: 'sibilants', data: ['\u05e9', '\ufb2b', '\u05e6', '\u05e1','\u05d6']},  // shin sin tzadi samech zayin


  {kind: 'daletzayin', data:['\u05d3','\u05d6']}, // dalet to zayin
  {kind: 'zayintzadi', data:  ['\u05d6', '\u05e6']}, // zayin tzadi
  {kind: 'tzadi ayin', data:  ['\u05e6', '\u05e2']}, //  tzadi ayin
  {kind: 'tzadi tes', data:  ['\u05e6', '\u05d8']}, //  tzadi tes

  {kind: 'vav yod', data: ['\u05d5','\u05d9']}, // vav to yod
  {kind: 'shin taf', data:  ['\u05e9', '\u05ea']}, // shin to taf
  {kind: 'shin sin', data: ['\u05e9', '\ufb2b']} // shin to sin
    //['\u05dc','\u05e8'], // lamed to resh
];



function buildMischalfim(arr)
{
  const result = {};

  for (let i = 0; i < arr.length; ++i) {
    const set = arr[i].data;
    for (var j = 0; j < set.length; ++j) {
      const key = set[j];
      for (var k = 0; k < set.length; ++k) {
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


function mischalef(a,b)
{
    const ao = mischalfim[a];

    return (ao && ao[b]);
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
     if(
         e === l            &&       // doubled src last letters
         cand.E === cand.L  &&       // doubled dst last letters
         (mischalef(e,cand.E)) &&    // pairs are interchangeable
         (p === cand.P || mischalef(p, cand.P)) // first letter is same or interchangeable

     )

     {
         return true;
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

const mappedEdges = {};
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


function dumpEdges(edges)
{
    const div =  $('#edges');
    div.append("edges=[");
    for(let i = 0; i < edges.length; ++i)
    {
        const e = edges[i];
        div.append("<div>{from:" + e.from + ", to: " + e.to + "},</div>");
    }
    div.append("<div>];</div>");
}

function dumpNodes(nodes)
{
    const div =  $('#nodes');
    div.append("nodes=[");
    for(let i = 0; i < nodes.length; ++i)
    {
        const n = nodes[i];
        div.append("<div>{id:" + n.id + ", label: '" + n.label + "'},</div>");
    }
    div.append("<div>];</div>");

}


function populateEdges(roots) {
    const edges = [];

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

function diagram(list)
{
    const nodes = populateNodes(list);
    const edges = populateEdges(list);
//
//        dumpNodes(nodes);
//        dumpEdges(edges);

    const container = document.getElementById('vis');
    const data= {
        nodes: nodes,
        edges: edges
    };
    const options = {
        width: '1000px',
        height: '800px',
        nodes: {
            color: {
                background: 'white',
                border: 'cyan',
                highlight: {
                    background: 'pink',
                    border: 'red'
                }
            },
            shape: 'label'
        },
        edges: { color:'white', width: 4},
        keyboard: {
            speed: {
                x: 10,
                y: 10,
                zoom: 0.02
            }
        }

    };
    const network = new vis.Network(container, data, options);


}

function stats()
{
    $('#edgecount').text(''+edgeCount);
}

function render(list, maxNodes, maxEdges)
{
    hardMax = Math.min(maxNodes, list.length);
    edgeMax = maxEdges;
    diagram(list);
    stats();
}
