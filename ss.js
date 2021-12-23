//Canvas API context
const canvas1 = document.getElementById('canvas1');
const ctx = canvas1.getContext('2d');

//web-audio API context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
//Selecting the audio element
const audioElement = document.querySelector('audio');
//Passing audio element to audio context
const track = audioContext.createMediaElementSource(audioElement);
//send audio to output
//track.connect(audioContext.destination);

/*------------------------------------------------- */
/*-------------play/pause functionality-------------*/
/*------------------------------------------------- */

    // selecting the play button
    const playButton = document.querySelector('button');

    //waiting for button to be clicked
    playButton.addEventListener('click', function(){

        //checking if the audio is in suspended state (autoplay policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        //play or pause depending on state
        if(this.dataset.playing === 'false'){
            audioElement.play();
            this.dataset.playing = 'true';
        } else if(this.dataset.playing === 'true'){
            audioElement.pause();
            this.dataset.playing = false;
        }
    }, false);

//sets playing dataset to false when song is over
audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false';
}, false);


/*------------------------------------------------- */
/*--------Modifying the audio --------- */
/*------------------------------------------------- */
const gainNode = audioContext.createGain();

/**
 * ! moved the connection down to the analyser
 * TODO: track.connect(gainNode).connect(audioContext.destination);
*/

//volume control
const volumeControl = document.querySelector('#volume');

canvas1.addEventListener('wheel', function(e){
    if(e.deltaY < 0){
        volumeControl.valueAsNumber += 0.1;
        gainNode.gain.value = volumeControl.value;
    }else {
        volumeControl.value -= 0.1;
        gainNode.gain.value = volumeControl.value;
    }
    e.preventDefault();
    e.stopPropagation();
});

volumeControl.addEventListener('input', function(){
    gainNode.gain.value = this.value;
}, false);


/*------------------------------------------------- */
/*---------------Audio analyser ------------------- */
/*------------------------------------------------- */
var analyser = audioContext.createAnalyser();
var analyser2 = audioContext.createAnalyser();


//routing the audio
track.connect(gainNode).connect(audioContext.destination);
track.connect(analyser).connect(analyser2)
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

analyser2.fftSize = 256;
var bufferLength2 = analyser2.frequencyBinCount;
var dataArray2 = new Uint8Array(bufferLength2);

//Making canvas "fullscreen"
canvas1.width = window.innerWidth;
canvas1.height = window.innerHeight;

//Make canvas updite height/width when resizing the browser
window.addEventListener('resize', function(){
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
});

//declaring mouse object
const mouse = {
    x: undefined,
    y: undefined,
};

canvas1.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
    
});

/* var hue = 0;
function colorUpdate() {
    hue += 5;
} */

function draw(){
    var drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    analyser2.getByteFrequencyData(dataArray2);
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);

    //2nd viz shit
    var barWidth = (canvas1.width / bufferLength2) /4;
    var barHeight;
    var x2 = mouse.x;

    

    ctx.lineWidth = 1;
    ctx.beginPath();

    //Circle shit
    const tot = bufferLength;
    const arc = Math.PI * 2 / tot; // Arc in radians
    let ang = 0; //Start at angle 0 (East)
    let hue = 0;
    let lgt = 0;
    
    //sets lightning value to 0 when not playing
    if (playButton.dataset.playing === 'true'){
        lgt = 50;
    } else {
        lgt = 0;
    };
    
    //function to place oscilloscope on points around mouse
    for(let i = 0; i < tot; i++){
        const dist = 100;
        var v = dataArray[i] / 128.0;
        var x = v * dist * Math.cos(ang) + mouse.x;
        var y = v * dist * Math.sin(ang) + mouse.y;
        if(i === 0){
            ctx.moveTo(x, y);
        }else {
            ctx.lineTo(x, y);
        }
        ang += arc;
        hue += (x*2) - (y*2);
        
    };
    ctx.strokeStyle = 'hsl(' + hue + ',100%,' + lgt +'%)';
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx.stroke();

    //draw freq viz
    for(let i = 0; i < bufferLength2; i++){
        barHeight = dataArray2[i]/4;

        ctx.fillStyle = 'hsl(' + (barHeight*5) +','+ (barHeight) +'%,' + lgt + '%)';
        ctx.fillRect((x2+200), mouse.y-barHeight/2, barWidth, barHeight);

        x2 += barWidth +3;
    };  
};
draw();

const mellowMusic = document.getElementById('mellowMusic');
const upbeatMusic = document.getElementById('upbeatMusic');

mellowMusic.addEventListener('click', function(){
    if (this.dataset.chosen === 'false'){
        audioElement.src = './pluck.mp3';
        this.dataset.chosen = 'true';
        audioElement.play();
        upbeatMusic.dataset.chosen="false";
        playButton.dataset.playing = "true"
        this.disabled = true;
        upbeatMusic.disabled = false;
    }
});

upbeatMusic.addEventListener('click', function(){
    if (this.dataset.chosen === 'false'){
        audioElement.src = './hehe.mp3';
        this.dataset.chosen = 'true';
        audioElement.play();
        mellowMusic.dataset.chosen = "false";
        playButton.dataset.playing="true";
        this.disabled = true;
        mellowMusic.disabled = false;
    }
});
