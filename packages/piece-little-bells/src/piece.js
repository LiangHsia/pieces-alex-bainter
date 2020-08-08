import { Chord } from 'tonal';
import Tone from 'tone';
import { createSampler, makePiece } from '@generative-music/utilities';

const PITCH_CLASSES = ['F', 'F', 'G', 'G#', 'A', 'A#', 'B'];
const BASE_P_TO_PLAY = 0.1;
const MODULO_DIVISOR_ONE = 4;
const MODULO_DIVISOR_TWO = 2;
const LOWER_INTERVAL_TIME = 22;
const HIGHER_INTERVAL_TIME = 20;
const INTERVAL_DELAY_MAX = 5;
const INTERVAL_DELAY_MULTIPLIER = 2;

const makeChordInterval = instrument => (tonic, interval) => {
  Tone.Transport.scheduleRepeat(
    () => {
      const notes = Chord.notes(tonic, 'm7');
      const numNotesToPlay = Math.floor(Math.random() * (notes.length + 1));
      let playedNotes = 0;
      let beat = 1;
      while (playedNotes < numNotesToPlay) {
        const chanceToPlay =
          BASE_P_TO_PLAY +
          (beat % MODULO_DIVISOR_ONE === 1 ? BASE_P_TO_PLAY : 0) +
          (beat % MODULO_DIVISOR_TWO === 1 ? BASE_P_TO_PLAY : 0);
        if (Math.random() < chanceToPlay) {
          const noteIndex = Math.floor(Math.random() * notes.length);
          const note = notes[noteIndex];
          notes.splice(noteIndex, 1);
          instrument.triggerAttack(note, `+${beat}`);
          playedNotes += 1;
        }
        beat += 1;
      }
    },
    interval,
    `+${Math.floor(Math.random() * INTERVAL_DELAY_MAX) *
      INTERVAL_DELAY_MULTIPLIER}`
  );
};

const pitchClass =
  PITCH_CLASSES[Math.floor(Math.random() * PITCH_CLASSES.length)];

const getGlock = samples => createSampler(samples['vsco2-glock']);

const makePiece = ({ audioContext, destination, samples }) => {
  if (Tone.context !== audioContext) {
    Tone.setContext(audioContext);
  }
  return getGlock(samples).then(glock => {
    const delay = new Tone.FeedbackDelay({
      delayTime: 8,
      feedback: 0.7,
      wet: 0.5,
    });
    const reverb = new Tone.Freeverb({ roomSize: 0.9, dampening: 2000 });
    glock.chain(delay, reverb, destination);

    const chordInterval = makeChordInterval(glock);
    chordInterval(`${pitchClass}4`, LOWER_INTERVAL_TIME);
    chordInterval(`${pitchClass}5`, HIGHER_INTERVAL_TIME);

    return () => {
      [glock, delay, reverb].forEach(node => node.dispose());
    };
  });
};

export default makePiece;
