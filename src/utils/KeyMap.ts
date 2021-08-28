import { midiKeyNumberToNote, Note, noteToMidiKeyNumber, parseNoteNameToNote } from "./Note";

const top = "q2w3er5t6y7ui9o0p[=]" //C4
const down = "zsxdcvgbhnjm,l.;/"; //C3

const noteC3 = parseNoteNameToNote('C3');
const noteC3MidiKeyNumber = noteToMidiKeyNumber(noteC3);

const noteC4 = parseNoteNameToNote('C4');
const noteC4MidiKeyNumber = noteToMidiKeyNumber(noteC4);

export const keyBoardToNote = (key:string): (Note|null) =>{
    if(top.indexOf(key) > -1){
        return midiKeyNumberToNote(top.indexOf(key) + noteC4MidiKeyNumber);
    } else if(down.indexOf(key) > -1){
        return midiKeyNumberToNote(down.indexOf(key) + noteC3MidiKeyNumber);
    } else {
        return null;
    }
}
