export type NoteOnListener = (midiKeyNumber: number, velocity: number) => void;
export type NoteOffListener = (midiKeyNumber: number) => void;
export type MessageHandler = (message: any) => void;

export class FrontMIDIService {
  private isMidiSupported: boolean | null = null;
  private isMidiConnected: boolean | null = null;
  public get IsMIDISupported() {
    return this.isMidiSupported;
  }
  public get IsMIDIConnected() {
    return this.isMidiConnected;
  }

  private noteOnListener: NoteOnListener | null = null;
  private noteOffListener: NoteOffListener | null = null;
  public set NoteOnListener(noteOnListener: NoteOnListener | null) {
    this.noteOnListener = noteOnListener;
  }
  public set NoteOffListener(noteOffListener: NoteOffListener | null) {
    this.noteOffListener = noteOffListener;
  }

  public onNoteOn(note: number, velocity: number) {
    if (this.noteOnListener !== null) this.noteOnListener(note, velocity);
  }
  public onNoteOff(note: number) {
    if (this.noteOffListener !== null) this.noteOffListener(note);
  }

  private messageHandler: MessageHandler | null = null;
  public set MessageHandler(handler: MessageHandler | null) {
    this.messageHandler = handler;
  }
  private onMidiMessage(message: any) {
    if (this.messageHandler !== null) this.messageHandler(message);
  }

  public async init() {
    const nav = navigator as any;
    if (nav.requestMIDIAccess) {
      this.isMidiSupported = true;
      await nav.requestMIDIAccess().then(
        (midiAccess: any) => {
          const inputs = midiAccess.inputs;
          for (const input of inputs.values()) {
            input.onmidimessage = (message: any) => {
              this.onMidiMessage(message);
              const command = message.data[0];
              const note = message.data[1];
              const velocity = message.data.length > 2 ? message.data[2] : 0;
              switch (command) {
                case 144: // noteOn
                  if (velocity > 0) {
                    this.onNoteOn(note, velocity);
                  } else {
                    this.onNoteOff(note);
                  }
                  break;
                case 128: // noteOff
                  this.onNoteOff(note);
                  break;
              }
            };
          }
          this.isMidiConnected = true;
        },
        () => {
          this.isMidiConnected = false;
        },
      );
    } else {
      this.isMidiSupported = false;
      this.isMidiConnected = false;
    }
  }
}
