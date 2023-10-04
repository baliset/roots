
type ShapeInnies = 'ellipse'|'circle'|'database'|'box'|'text';
type ShapeOuties = 'image'|'circularImage'|'diamond'|'dot'|'star'|'triangle'|'hexagon'|'square'|'icon'|'custom';
type Shape = ShapeInnies | ShapeOuties;
  type Color = {background: string; border: string, highlight: {background:string, border:string}};

type Size = `${number}px`;

type  NodeOptions = {shape:Shape, color:Color};
type ArrowEndOptions = {enabled:boolean};
export type EdgeOptions = {color:string, width:number, arrows: {to: ArrowEndOptions, from: ArrowEndOptions}};

type InteractionOptions = {keyboard: {speed: {x:number, y:number, zoom: number}}};

export type VisNetworkOptions = {width:Size, height:Size, nodes:NodeOptions, edges:EdgeOptions, interaction: InteractionOptions}


export const defaultOptions:VisNetworkOptions = {

  width: '2000px',
  height: '2000px',
  nodes: {
    color: {
      background: 'white',
      border: 'cyan',
      highlight: {
        background: 'pink',
        border: 'red'
      }
    },
    shape: 'circle'
  },
  edges: { color:'yellow', width: 0, arrows: {to:{enabled:false}, from:{enabled:false}}},
  interaction: {
    keyboard: {
      speed: {
        x: 10,
        y: 10,
        zoom: 0.02
      }
    }
  }
};
