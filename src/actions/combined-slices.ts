// -- standard slices --
import {sliceConfig as requestSlice,RequestState} from "./request-slice";
import {sliceConfig as notifySlice,NotifyState} from "./notify-slice";
import {sliceConfig as optionsSlice,OptionsState} from "./options-slice";


//-- standard middlewares
import {loggingMiddleware} from "./logging-middleware";
import {fatalMiddleware} from './fatal-middleware';

// -- app specific slices --
import {sliceConfig as localSlice, LocalState} from "./local-slice";


//-- app specific middlewares


export const allSlices = [requestSlice, notifySlice, localSlice,  optionsSlice];
export const allMiddlewares = [ fatalMiddleware, loggingMiddleware];
export const middlewareInits = [  ];

// when I get smarter about deriving types in typescript I can presumably fix this (he claims)
// but the important thing is it makes every part of state known
//There is a source of truth problem, I need to derive the keys from the slice names directly encountered issues
// with non-literals
export type TotalState = {
   request: RequestState;
    notify: NotifyState;
     local: LocalState;
   options: OptionsState;
}

