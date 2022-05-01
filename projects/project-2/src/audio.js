export { audioCtx, trackBuffers, setupWebaudio };

let audioCtx;
let trackBuffers;

// TODO: Find more sounds
const trackPaths = {
    classical: {
        CIRCLE: "sounds/temp/bass.wav",
        TRIANGLE: "sounds/temp/snare.wav",
        SQUARE: "sounds/temp/cymbal.wav",
        HEXAGON: "sounds/temp/hihat.wav"
    },
    // retro: {
    //     CIRCLE: "sounds/metronome.wav",
    //     TRIANGLE: "sounds/metronome.wav",
    //     SQUARE: "sounds/metronome.wav",
    //     HEXAGON: "sounds/metronome.wav"
    // },
    arcade: {
        CIRCLE: "sounds/arcade/circle.wav",
        TRIANGLE: "sounds/arcade/triangle.flac",
        SQUARE: "sounds/arcade/square.wav",
        HEXAGON: "sounds/arcade/hexagon.wav"
    },
    // electronic: {
    //     CIRCLE: "sounds/metronome.wav",
    //     TRIANGLE: "sounds/metronome.wav",
    //     SQUARE: "sounds/metronome.wav",
    //     HEXAGON: "sounds/metronome.wav"
    // },
    other: {
        metronome: "sounds/other/metronome.wav"
    }
};

function setupWebaudio()
{
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a new instance of sound file loader and then load the files
    new BufferLoader(audioCtx, trackPaths).loadTracks();
}

class BufferLoader
{
    constructor(ctx, trackPaths)
    {
        this.ctx = ctx;
        this.trackPaths = trackPaths; // ex. {"trackName" :"trackURL", ...}
        this.trackBuffers = {};	      // will be populated with {"trackName" : buffer, ...}
        this.loadCount = 0;
        this.numToLoad = 0;

        for (let genreName of Object.keys(this.trackPaths))
        {
            for (let trackName of Object.keys(this.trackPaths[genreName]))
            {
                this.numToLoad++;
            }
        }
    }

    loadTracks()
    {
        for (let genreName of Object.keys(this.trackPaths))
        {
            for (let trackName of Object.keys(this.trackPaths[genreName]))
            {
                let trackURL = this.trackPaths[genreName][trackName];
                this.loadBuffer(genreName, trackName, trackURL);
            }
        }
    }

    async loadBuffer(genreName, trackName, trackURL)
    {
        try
        {
            let response = await fetch(trackURL);
            if (!response.ok)
            {
                throw new Error(response.statusText);
            }

            const arrayBuffer = await response.arrayBuffer();

            const decodeSuccess = buffer =>
            {
                if (buffer)
                {
                    if (!this.trackBuffers[genreName]) this.trackBuffers[genreName] = {};
                    this.trackBuffers[genreName][trackName] = buffer;

                    if (++this.loadCount == this.numToLoad)
                    {
                        trackBuffers = this.trackBuffers;
                    }
                }
                else
                {
                    console.error('Error decoding file data: ' + url);
                    return;
                }
            };
            const decodeError = e => console.error('decodeAudioData error', e);

            this.ctx.decodeAudioData(arrayBuffer, decodeSuccess, decodeError);
        }
        catch (error)
        {
            console.error('BufferLoader: Fetch error');
        }
    }
}