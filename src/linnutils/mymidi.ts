import {MIDIVal, IMIDIOutput, IMIDIInput, IMIDIAccess, MidiMessage, ControlChangeMessage, } from "@midival/core";
import {MidiCommand} from "@midival/constants";
import {paramNumToName} from "./LinnVals";
import {BrowserMIDIOutput} from '@midival/core/dist/wrappers/outputs/BrowserMIDIOutput';
import {BrowserMIDIInput} from '@midival/core/dist/wrappers/inputs/BrowserMIDIInput';

import {ccNumbers, ccIsLsbForCcMinus32, ccIsOnOff} from './cc-numbers';

type MidiInOrOut = BrowserMIDIInput|BrowserMIDIOutput;

const details = (device:MidiInOrOut) => {
  const modifiedId = Number(device.id).toString(16);
  return `${device.name}/${device.id}/${modifiedId}`;
}



let midiInputs:IMIDIInput[];
let midiOutputs:IMIDIOutput[];
let linnOut:IMIDIOutput;
let linnIn:IMIDIInput;


const kLinnStrument = 'LinnStrument MIDI';
const isLinn = (o:MidiInOrOut)=>o?.name ===  kLinnStrument;

interface MyNrpnMsg {
  f:number;
  s:number;
  t:number;
}

interface MyMidiEvent {
  timeStamp:number;
  currentTarget: IMIDIInput;
  data:Uint8Array;
}

class NRPNAccept {
  nrpnMsg:MyNrpnMsg[] = [];

  in(arr:number[]) {
    const nrpnMsg = this.nrpnMsg;

    const len = nrpnMsg.length;
    switch(len) {
      case 0:
        if(arr.length === 3 && arr[0] === 0xb0 && arr[1] === 0x63)
          nrpnMsg.push({f: arr[0], s: arr[1], t: arr[2]});
        break;
      case 1:
        if(arr.length === 3 && arr[0] === 0xb0 && arr[1] === 0x62)
          nrpnMsg.push({f: arr[0], s: arr[1], t: arr[2]});
        break;
      case 2:
      case 3:
        if(arr.length === 3 && arr[0] === 0xb0)
          nrpnMsg.push({f: arr[0], s: arr[1], t: arr[2]});
        break;
      case 4:
        if(arr.length === 3 && arr[0] === 0xb0 && arr[1] === 0x65 && arr[2] === 0x7f)
          nrpnMsg.push({f: arr[0], s: arr[1], t: arr[2]});
        break;
      case 5:
        if(arr.length === 3 && arr[0] === 0xb0 && arr[1] === 0x64 && arr[2] === 0x7f) {
          nrpnMsg.push({f: arr[0], s: arr[1], t: arr[2]});

          const pNum = (nrpnMsg[0].t * 128) + (nrpnMsg[1].t & 0x7f);
          const pName = paramNumToName(pNum)
          const pVal = nrpnMsg[2].t * 128 + nrpnMsg[3].t & 0x7f;

          // store the result
          currentLinnParams[pNum]=pVal;
          actions.updateParamView(pNum, 'c', pVal);
          this.nrpnMsg = [];
          return;
        }
        break;
    } // end switch
    // if(nrpnMsg.length > len)
    //   console.info(`+msg ${nrpnMsg.length}`);
  }

}

const nrpnInputFilter = new NRPNAccept();
let id:number = 0;





// v indicates whether the value field (velocity, pressure, comes from b1, b2, neither or both)
// ch has channel, note: has note v: which bytes contain value 1/2/ or both = 4, none
/*
  some commands encode a channel
  some commands encode a note
  an accompanying value may have a name for the type of value it represents, velocity, bend, pressure, etc.
 */

const midiparse:Record<number,any> = {
  0x80: {t: 'Note off',         v:2, ch:1, note:1, vname: 'Velocity' },
  0x90: {t: 'Note on',          v:2, ch:1, note:1, vname: 'Velocity' },
  0xa0: {t: 'Aftertouch',       v:2, ch:1, note:1, vname: 'Pressure' },
  0xb0: {t: 'CC',               v:2, ch:1,         vname: 'Value'    }, // which type of controller determined by byte[1]
  0xd0: {t: 'Channel pressure', v:1, ch:1,         vname: 'Pressure' },
  0xe0: {t: 'Pitch',            v:4, ch:1,         vname: 'Bend'     },  // lsb, msb
  0xc0: {t: 'Program Change',   v:1,               vname: 'Program #'},

  0xf2: {t: 'Song Pointer',     v:4,               vname: 'Beats'    },  // lsb,msb
  0xf3: {t: 'Song Select',      v:1,               vname: 'Song #'   },  // then b1=song number

  // These commands use low nybble if top nibble is F
  // see also https://people.computing.clemson.edu/~johnmc/courses/cpsc872/exam1/spec.html
  0xf0: {t: 'SysEx Start', },
  0xf7: {t: 'SysEx End', },

  // system common
  0xf6: {t: 'Tune Request', }, //  analogue synths should initiate a self tuning operation.

  // midi time code b1 = data
  0xf1: {t: 'Quarter Frame', },

  // these are system realtime, only measure end has a second byte, and it isn't used
  0xf8: {t: 'Timing Clock', },  //Whilst a transmitter is playing, this message is sent 24 times per quarter note.
  0xf9: {t: 'Measure End', },
  0xfa: {t: 'Start', },  //Start the current sequence playing, from the beginning. (This message should be followed with Timing Clocks).
  0xfb: {t: 'Continue', },  //Continue playing the current sequence from the point at which it was stopped.
  0xfc: {t: 'Stop', },      // stop current sequence
  0xfd: {t: 'Cmd 0xfd is undefined'},

  0xfe: {t: 'Active Sensing', }, //When initially sent, the receiver will expect to receive another Active Sensing message each 300ms (max), or it will assume that the connection has been terminated. At termination, the receiver will turn off all voices and return to normal (non- active sensing) operation. Use of this message is optional.
  0xff: {t: 'Reset', }, //Reset all receivers to their power-up status. It should be used sparingly, preferably only under manual control. In particular, it should not be sent automatically on power up, as this could lead to a situation where two devices endlessly reset each other.



}

type ParsedMidi = {cmd:string, ch?:number; note?:number, value:number, type?:string};

type Recordable = Record<string, boolean>;
let recordable:Recordable = {};

export function resetRecordable(rec:Recordable)
{
  recordable = rec;
}
const parseCommand = (arr:number[]): Partial<ParsedMidi> => {
  const masked = arr[0] & 0xf0;
  const maskedCmd = (masked === 0xf0)? arr[0]: masked ;      // expand the command beyond mask if 0xFN
  const b1 = arr?.[1]; // note code, or controller number

  const decoder = midiparse[maskedCmd];
  const ch = decoder?.ch? (arr[0] & 0x0f) + 1: undefined; // not everything has a channel
  const note = decoder?.note? b1: undefined;              // not every command designates a note


  const value = decoder?.v?  decoder.v <=2?  arr[decoder.v]: (arr[2] << 7) + arr[1] - 8192: undefined;
  const type = decoder?.vname;

  let cmd = decoder?.t;
  if(maskedCmd === 0xb0) {
    cmd = ccNumbers[b1]? `${cmd} ${arr[1]} ${ccNumbers[b1]}`: `${cmd} ${arr[1]}`;
    if(ccIsLsbForCcMinus32(b1))
      cmd += ` (LSB for CC${b1-32})`;
    else if (ccIsOnOff(b1))
      cmd += (arr[2] & 0x7f)>=64? ' (ON)':' (OFF)';
  }

  return { cmd,  ch,  note, value, type};

}

const hexify = (v:number)=>v?.toString(16)?.padStart(2,'0')  ;

let actions:any;
export const midiSetup = (midiActions:any) => {

  actions = midiActions;

  function onAnyMidiMessage(event:MyMidiEvent) {
    const {type, name:src} = (event.currentTarget as any);

   if(recordable[src]) {
     const {timeStamp:time} = event;

     const dir = type === 'input' ? 'out' : 'in';
     const arr = Array.from(event.data);

     const parsed = parseCommand(arr); // parse content of message, derive other data from event
     // todo this is causing too many updates, it should really store locally and update n times a second
     // also produce fewer actions
     midiActions.updateMidiView({...parsed, id: ++id, time, dir, src, hex: arr.map(hexify).join(' ')})
   }
   if (event?.currentTarget?.id === linnIn?.id)
    onLinnMidiMessage(event);

  }

  function onLinnMidiMessage(event:MyMidiEvent) {
// expect results for as [b0 63 00, b0 62 xx, b0 xx xx, b0 xx xx, b0 65 7f b0 64 7f]
    nrpnInputFilter.in(Array.from(event.data));
  }

MIDIVal.connect().then((accessObject:IMIDIAccess) => {
 midiInputs =  accessObject.inputs;
 midiOutputs = accessObject.outputs;

  // midiInputs.forEach((device)=>`Input found ${details(device)}`);
  // midiOutputs.forEach((device)=>`Output found ${details(device)}`);

  console.log("Inputs", midiInputs);
  console.log("Outputs", midiOutputs);

  midiOutputs.map((bo:any)=>{
    if(isLinn(bo)) {
      linnOut = bo.output;
      interrogate(); // automatically pull values when we see the connection to a Linnstrument
    }
  });

   midiInputs.map((bi:any)=>{

    if(isLinn(bi?.input)) {
        linnIn = bi.input;

      // (linnIn as any).onmidimessage = onLinnMidiMessage;


    // bi.ommidimessage = onMidiMessage;
    // //   linnIn.addListener('controlChange',(e)=>{
    //     console.log(`see control change: `, e);
    //   })
    } else {

    }
     (bi?.input as any).onmidimessage = onAnyMidiMessage;

   })

  MIDIVal.onOutputDeviceConnected((device:any) => {
    console.log(`OutputDevice Connected: ${details(device)}`);
    if(isLinn(device))
      linnOut = device;
  });

  MIDIVal.onOutputDeviceDisconnected((device:any) => {
    console.log(`Output Device Disconnected ${details(device)}`);
    // if(isLinn(device))
    //   linnOut = undefined;
  });

  MIDIVal.onInputDeviceConnected((device:any) => {
    const {id, name, manufacturer} = device;
    console.log(`Input Device Connected ${details(device)}`, device);

    midiActions.connect({id, name, manufacturer});
  });

  MIDIVal.onInputDeviceDisconnected((device:any) => {
    const {id} = device;
    midiActions.disconnect(id);
    console.log(`Input Device Disconnected  ${details(device)}`);
  });

});

}

const kColorAsSet = 0;
const kColorRed = 1;
const kColorYellow=2;
const kColorGreen=3;
const kColorCyan=4;
const kColorBlue=5;
const kColorMagenta=6;
const kColorOff=7;
const kColorOrange=9;
const kColorWhite=8;
const kColorLime=10;
const kColorPink=11;

const ccCol=20
const ccRow=21;
const ccChangeCol=22;
const ccPersist=23;
const ccClearPersist=24;

const ccReadVal=299;



export type ParamSet = Record<number, number>;

export const currentLinnParams:ParamSet = {};


function sendNRPN(paramNum:number,value:number)
{
//   NRPN messages are a series of MIDI CC messages that allow changing more parameters than are supported by
//   the standard MIDI CC message list. LinnStrument always expects an exact series of 6 MIDI CC messages to be
//   received for setting one NRPN to a different value. The first two select the NRPN parameter number, the
//   received for setting one NRPN to a different value. The first two select the NRPN parameter number, the
//   next two set the NRPN parameter value (both MSB and LSB are used), and the last two reset the active NRPN
//   parameter number. Failure to reset the NPRN parameter number can result in other MIDI input messages to
//   behave unpredictably.
//
//   This is an overview of the message chain:
//
//   1011nnnn   01100011 ( 99)  0vvvvvvv         NRPN parameter number MSB CC
//   1011nnnn   01100010 ( 98)  0vvvvvvv         NRPN parameter number LSB CC
//   1011nnnn   00000110 (  6)  0vvvvvvv         NRPN parameter value MSB CC
//   1011nnnn   00100110 ( 38)  0vvvvvvv         NRPN parameter value LSB CC
//   1011nnnn   01100101 (101)  01111111 (127)   RPN parameter number Reset MSB CC
//   1011nnnn   01100100 (100)  01111111 (127)   RPN parameter number Reset LSB CC

  const msbPn = paramNum >> 7;
  const lsbPn = paramNum & 0x7F;

  const msbVal = value >> 7;
  const lsbVal = value & 0x7F;


  // console.log(`{pn:${paramNum} (0x${paramNum.toString(16)}), val:${value} (0x${value.toString(16)},
  //  msbPn:0x${msbPn.toString(16)}, lsbPn:0x${lsbPn.toString(16)},
  //  msbVal:0x${msbVal.toString(16)} lsbVal:0x${lsbVal.toString(16)}}`);
  const cc = MidiCommand.ControlChange+1;
  linnOut.send([cc,  99,  msbPn]); //   1011nnnn   01100011 ( 99)  0vvvvvvv         NRPN parameter number MSB CC
  linnOut.send([cc,  98,  lsbPn]); //   1011nnnn   01100010 ( 98)  0vvvvvvv         NRPN parameter number LSB CC
  linnOut.send([cc,  6,  msbVal]); //   1011nnnn   00000110 (  6)  0vvvvvvv         NRPN parameter value MSB CC
  linnOut.send([cc, 38,  lsbVal]); //   1011nnnn   00100110 ( 38)  0vvvvvvv         NRPN parameter value LSB CC
  linnOut.send([cc, 101, 127]);    //   1011nnnn   01100101 (101)  01111111 (127)   RPN parameter number Reset MSB CC
  linnOut.send([cc, 100, 127]);    //   1011nnnn   01100100 (100)  01111111 (127)   RPN parameter number Reset LSB CC


}


function setAccent()
{
}

export function interrogate()
{
  // all parameters on Linnstrument are in numeric range 0-66 (left split), 100-166 (right split), and 200-270
  // they can be queried (where they don't represent actions) by sending NRPN 299 with the param number you want to read

  const params:number[] =[];

  for(let i = 0; i <= 270; ++i  ) {
    if((i === 65 || i === 165) || (i >= 0 && i <= 61) || (i >= 100 && i <= 161) || (i >= 200))
      params.push(i);
  }

  let ctr = 0;
  const intervalId = setInterval(()=>{
      if(ctr >= params.length) {
        clearInterval(intervalId);
        return;
      }
      sendNRPN(ccReadVal, params[ctr++]);
  },
  10);

}




export function uploadPatch(patch:ParamSet)
{
  console.log(`uploadPatch`, patch)

  const arr = Object.entries(patch);
  let ctr = 0;
  const intervalId = setInterval(()=>{
      if(ctr >= arr.length) {
        clearInterval(intervalId);
        return;
      }
    const [nrpn, value] = arr[ctr++];
    sendNRPN(Number(nrpn), value); // todo we have a type issue that it believes the keys are strings

    }, 10);

}


export function test()
{
  // 20          Column coordinate for cell color change with CC 22 (starts from 0)
  // 21          Row coordinate for cell color change with CC 22 (starts from 0)
  // 22          Change the color of the cell with the provided column and row coordinates


  if(!linnOut)
    console.error(`There is no linnOut right now`);
    return;

    linnOut.send([MidiCommand.ControlChange, ccCol, 24]);
    linnOut.send([MidiCommand.ControlChange, ccRow, 0]);
    linnOut.send([MidiCommand.ControlChange, ccChangeCol, kColorPink]);



  setTimeout(()=> {
        linnOut.send([MidiCommand.ControlChange, ccCol, 23]);
        linnOut.send([MidiCommand.ControlChange, ccRow, 0]);
        linnOut.send([MidiCommand.ControlChange, ccChangeCol, kColorBlue]);
      }, 20
      );

  setTimeout(()=> {
      linnOut.send([MidiCommand.ControlChange, ccCol, 22]);
      linnOut.send([MidiCommand.ControlChange, ccRow, 1]);
      linnOut.send([MidiCommand.ControlChange, ccChangeCol, kColorMagenta]);
    }, 40
  );



  setTimeout(()=> {
      // linnOut.send([MidiCommand.ControlChange, ccPersist, 0])
    },50
    );





}

