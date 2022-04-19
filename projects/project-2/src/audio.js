import { fireInTime } from "./app.js";
export { audioCtx, beat, setupWebaudio };

let audioCtx;

let beat;
let intervalID;

const trackPaths = { // we'll name our sound files to make it easier to keep track of them
    // kick: "sounds/kick.wav",
    // snare: "sounds/snare.wav",
    // hihat: "sounds/hihat.wav",
    metronome: "sounds/metronome.wav"
};

function setupWebaudio()
{
    // TODO: audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx = new window.AudioContext();

    // Create a new instance of sound file loader and then load the files
    // tracksLoaded() will be called once the audio files are loaded
    new BufferLoader(audioCtx, trackPaths, tracksLoaded).loadTracks();
}

function tracksLoaded(bufferObj)
{
    // RhythmSample will create new source nodes and play them every time we click the button 
    beat = new RhythmSample(bufferObj.metronome);
    startButton.onclick = _ =>
    {
        // beat = new RhythmSample(bufferObj.kick, bufferObj.snare, bufferObj.hihat);
        if(!intervalID)
        {
            beat.play();
            intervalID = setInterval(fireInTime, beat.timescale * 1000);
        }
        else
        {
            clearInterval(intervalID);
            intervalID = null;
            beat.playing = false;
        }
    }
}

/*
  Class RhythmSample:
    - has references to 3 `ArrayBuffer` binary arrays
    - `createSourceNodeAndPlay()` creates audio source nodes that point at these arrays and schedules a start time for the node
*/
class RhythmSample
{
    // constructor(kick, snare, hihat, metronome)
    constructor(metronome)
    {
        // this.kick = kick;
        // this.snare = snare;
        // this.hihat = hihat;
        this.metronome = metronome
        // this.times = [];
        this.timescale = 0;
    }

    play()
    {
        let startTime = audioCtx.currentTime;

        let tempo = 80; // BPM (Beats Per Minute)
        let halfNoteTime = 120 / tempo;
        let quarterNoteTime = 60 / tempo;
        let eighthNoteTime = 30 / tempo;

        this.timescale = halfNoteTime;
        startTime += quarterNoteTime;

        // Play 2 bars of the following:
        for (let bar = 0; bar < 2; bar++)
        {
            let time = startTime + bar * 8 * quarterNoteTime;

            // console.log(this.times);
            // 6 - Play the bass (kick) drum on beats 1, 5 - both of these source nodes are using the same `ArrayBuffer` binary data
            // this.createSourceNodeAndPlay(this.kick, time);
            // this.createSourceNodeAndPlay(this.kick, time + 4 * eighthNoteTime);

            // // 7 - Play the snare drum on beats 3, 7 - both of these source nodes are using the same `ArrayBuffer` binary data
            // this.createSourceNodeAndPlay(this.snare, time + 2 * eighthNoteTime);
            // this.createSourceNodeAndPlay(this.snare, time + 6 * eighthNoteTime);
            // this.createSourceNodeAndPlay(this.metronome, time);

            // Play the metronome every fourth note
            for (let i = 0; i < 8; ++i)
            {
                // this.createSourceNodeAndPlay(this.metronome, time + i * eighthNoteTime);
                let temp = time + i * quarterNoteTime;
                // this.times = this.times.concat(temp);
                this.createSourceNodeAndPlay(this.metronome, temp);
            }
        }
    }

    createSourceNodeAndPlay(buffer, time)
    {
        // 9 - Create an `AudioBufferSourceNode`
        let source = audioCtx.createBufferSource();

        // 10 - Set its buffer (binary audio data)
        source.buffer = buffer;

        // 11 - Connect the source node to the destination
        source.connect(audioCtx.destination);

        // 12 - Start playing the sound
        source.start(time);
    }
}


/**** We already saw what this class was doing in chapter 1 ****/
class BufferLoader
{
    constructor(ctx, trackPaths, callback)
    {
        this.ctx = ctx;
        this.trackPaths = trackPaths; // ex. {"trackName" :"trackURL", ...}
        this.callback = callback;
        this.trackBuffers = {};	      // will be populated with {"trackName" : buffer, ...}
        this.loadCount = 0;
        this.numToLoad = Object.keys(this.trackPaths).length;
    }

    loadTracks()
    {
        for (let trackName of Object.keys(this.trackPaths))
        {
            let trackURL = this.trackPaths[trackName];
            this.loadBuffer(trackName, trackURL);
        }
    }

    loadBuffer(trackName, trackURL)
    {
        const request = new XMLHttpRequest();
        request.responseType = "arraybuffer";
        request.open("GET", trackURL, true);
        request.send();

        /* Callbacks */
        request.onerror = e => console.error('BufferLoader: XHR error');

        request.onload = e =>
        {
            const arrayBuffer = request.response;

            const decodeSuccess = buffer =>
            {
                if (buffer)
                {
                    this.trackBuffers[trackName] = buffer;

                    if (++this.loadCount == this.numToLoad)
                    {
                        this.callback(this.trackBuffers);
                    }
                }
                else
                {
                    console.error('error decoding file data: ' + url);
                    return;
                }
            };

            const decodeError = e =>
            {
                console.error('decodeAudioData error', e);
            };

            this.ctx.decodeAudioData(arrayBuffer, decodeSuccess, decodeError);
        };
    }
}