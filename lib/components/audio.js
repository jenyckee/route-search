const Tone = require('tone');
module.exports = function (onLoop, onPhase1, onPhase2) {

    var lowPass = new Tone.Filter({type: "lowpass", frequency: 4200, Q: 20}).toMaster();
    
    var fmSynth = new Tone.FMSynth({
        "envelope" : {
            "attack" :0.01,
            release  : 0.01,
        }
    }
    ).toMaster();

    var polySynth = new Tone.PolySynth(6, Tone.Synth, {
        "oscillator" : {
            "partials" : [0,2,4],
        },
        "envelope" : {
            "attack" :0.05,
            "sustain": 1,
            release  : 0.1,
        }
    }).connect(lowPass);

    var freeverb = new Tone.Freeverb().toMaster();
    
    var loop = new Tone.Sequence((time, col) => {
        onLoop();
        fmSynth.triggerAttackRelease(col, "64n");
        console.log(col);
      }, ["F8", "G#8", "F8", "C9"], "16n");
    
    function startLoop() {
        loop.start();
    }

    function stopLoop() {
        loop.stop();
    }

    Tone.Transport.start();    

    new Tone.Sequence(function(time, col){
        const phase1 = (phase1) => {
            onPhase1();
            polySynth.triggerAttack(["F1", "G#1", "C2"]);            
            stopLoop();
        }
        const phase2 = (phase2) => {
            onPhase2();
            polySynth.releaseAll();
            startLoop()
        }
        var phases = [phase1, phase2];
        phases[col]();
    }, [0, 1], "1").start(0);

    return {
        startLoop,
        stopLoop
    };
}

