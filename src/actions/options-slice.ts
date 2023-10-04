import {Mischalef, arrMischalfim, MischalefChoices, allChoices, filterChosen} from '../roots/mischalfim';

export interface OptionsState {
  mischalfim: Mischalef[];
  allmischalfim:Mischalef[];
  choices:MischalefChoices;
}

type OptionsCreator = (...rest: any)=>unknown;
type OptionsCreators = Record<string, OptionsCreator>;
type OptionsReducer = (s:OptionsState,...rest: any)=>OptionsState;
type OptionsReducers = Record<string, OptionsReducer>;

interface SliceConfig {
  name: string;
  reducers: OptionsReducers;
  creators: OptionsCreators;
  initialState: OptionsState;
}

const initialState:OptionsState = {
  mischalfim: arrMischalfim,
  allmischalfim: arrMischalfim,
  choices: allChoices(arrMischalfim)
};


// type value will be added automatically to creators to match the key, or better yet to match the slice/key
const creators = {
  choose: (choices:MischalefChoices) => ({choices}),
  chooseOne: (choice:string, value:boolean) => ({choice, value}),
  clearChoices: () => ({}),
  allChoices:()=> ({}),
};

const reducers:OptionsReducers = {
  allChoices: (s) => {
    const choices = {...s.choices};
    Object.keys(choices).forEach(k=>choices[k]=true);
    return {...s, choices, mischalfim:filterChosen(s.allmischalfim, choices)};
  },

  clearChoices: (s) => {
    const choices = {...s.choices};
    Object.keys(choices).forEach(k=>choices[k]=false);
    return {...s, choices, mischalfim:filterChosen(s.allmischalfim, choices)};
  },
  choose: (s, {choices})=>({...s, choices, mischalfim:filterChosen(s.allmischalfim, choices)}),
  chooseOne: (s, {choice, value} )=>
  {
    const choices= {...s.choices, [choice]:value };
    return {...s, choices, mischalfim:filterChosen(s.allmischalfim, choices)};
  }
};

export const sliceConfig:SliceConfig = {name: 'options', creators, initialState, reducers};

