import * as Tone from 'tone';
const seq = new Tone.Sequence(() => {}, [1, 2, 3], "8n");
seq.start(0);
console.log(seq.state);
seq.stop();
console.log(seq.state);
