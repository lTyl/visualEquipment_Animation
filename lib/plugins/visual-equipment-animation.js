ig.module(
    'plugins.visual-equipment-animation'
)

.requires(
    'impact.impact'
)


.defines(function(){
        VisualEquipmentAnimation = ig.Class.extend({
            timer: new ig.Timer(),
            frames: [],
            currentFrame: 0,
            frameLength: 0,
            loopCount: 0,
            totalCycles: 0,
            flip: {x: false, y:false},
            layersToAnimate: [],

            init: function( frameLength, frames, cycleCount, layers ){
                this.frames = frames;
                this.frameLength = frameLength;
                this.totalCycles = cycleCount;
                this.layersToAnimate = layers;
            },
            update: function(){
                var totalFrames = Math.floor(this.timer.delta() / this.frameLength);
                this.loopCount = Math.floor(totalFrames / this.frames.length);
                if (this.loopCount >= this.totalCycles && this.totalCycles > 0){
                    this.currentFrame = this.frames.length -1;
                } else{
                    this.currentFrame = totalFrames % this.frames.length;
                }
            },

            rewind: function(){
                this.timer.reset();
                this.loopCount = 0;
            },

            gotoFrame: function( frame ){
                this.timer.set( this.frameLength * -frame);
                this.update();
            },

            gotoRandomFrame: function(){
                this.gotoFrame( Math.floor( Math.random() * this.frames.length ));
            }
        })
    })