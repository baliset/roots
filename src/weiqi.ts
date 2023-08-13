
export type Point = {x:number, y:number};

type Color = 'E'|'B'|'W';
type Row = Color[];

export type Chain = {color: Color, points: Point[];}


function contains(chain:Chain, point:Point)
{

}


class Board
{
    private readonly rows:Row[];
    private readonly points:Point[];

    constructor(n:number)
    {
      this.rows = new Array(n).map((v,index)=>(new Array(n)).fill('E'));
      const points:Point[] = [];

      // create the total set of points
      this.rows.forEach((row, y)=>row.forEach((color:Color, x)=>points.push({x, y})))
      this.points = points;

      // now create the initial chain states for each color

    }



}
