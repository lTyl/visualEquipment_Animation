ig.module(
    'plugins.visual-equipment'
)

    .requires(
    'impact.image',
    'plugins.visual-equipment-animation'
)

    .defines(function () {
        VisualEquipment = ig.Class.extend({
            layers:[], // The layers to draw. Index of 0 is drawn first.
            drawingCanvas: null,
            drawingContext: null,
            animations: {},
            currentAnimation: null,
            renderMode: "PRE-RENDER", // Modes:
                                      // "PRE-RENDER" - Takes multiple images and layers them on top of one another on an off-screen canvas.
                                      //                This image is static and cannot be animated.
                                      // "REAL_TIME"  - This render mode renders the image EVERY TIME the draw() method is called.
                                      //              - By using this mode, animations can be achieved by manipulating the sprite index and spritesheet
                                      //              - values in the respective draw layer, so animations can be constructed on a per-layer basis.
                                      //              - This method is obviously slower than PRE-RENDER.
                                      // !NOTE! When animations is empty, VisualEquipment uses 'PRE-RENDER' mode by default.

            /**
             * init: Create a new offscreen canvas element. The rendered sprite will be drawn onto this canvas.
             * @param frameWidth - The width of the rendered frame.
             * @param frameHeight - The height of the rendered frame.
             */
            init:function (frameWidth, frameHeight) {
                this.drawingCanvas = ig.$new('canvas');
                this.drawingContext = this.drawingCanvas.getContext('2d');
                this.drawingCanvas.width = frameWidth;
                this.drawingCanvas.height = frameHeight;
            },

            /**
             * draw: Draw the rendered frame to the visible canvas.
             * @param x - The X value to draw the rendered frame to on the visible canvas.
             * @param y - The Y value to draw the rendered frame to on the visible canvas.
             */
            draw:function (x, y) {
                if (this.renderMode == "PRE-RENDER" && this.animations.length > 0){
                    // Pre-render rendering.
                    ig.system.context.drawImage(this.drawingCanvas, x, y);
                    ig.Image.drawCount++;
                } else if(this.renderMode == "REAL_TIME"){
                    // REAL_TIME rendering
                    this.render();
                    ig.system.context.drawImage(this.drawingCanvas, x, y);
                    ig.Image.drawCount++;
                } // REAL_TIME_CACHED rendering.
            },

            /**
             * update: Update the current frame sequence and replace the sprite index at the correct layer
             *         to create an animation effect.
             */
            update: function(){
                if (this.currentAnimation){
                    this.currentAnimation.update();
                    this.updateSpriteIndex();
                }
            },

            /**
             * addAnim -- When called, adds a new animation to the animations array.
             * @param name -- The name of the animation
             * @param length -- The length of time between each frame
             * @param frames -- The frames, as an array
             * @param cycleCount -- The amount of time to cycle the animation
             * @param affectedLayers -- The layers that this animation manipulates
             * @param newSpriteSheet -- If passed, sets a new spritesheet at layer
             * @param layer -- The layer index.
             */
            addAnim: function(name, length, frames, cycleCount, affectedLayers, newSpriteSheet, layer){
                newSpriteSheet = newSpriteSheet || 0;
                layer = layer || 0;
                if(newSpriteSheet){
                    this.replaceSpriteSheetAtlayer(layer, newSpriteSheet);
                }
                var anim = new VisualEquipmentAnimation(length, frames, cycleCount, affectedLayers);
                this.animations[name] = anim;
            },

            /**
             * updateSpriteIndex: Cycles through the layersToAnimate array and replaces the spriteIndex with the new index value
             */
            updateSpriteIndex: function(){
                for(var i = 0; i < this.currentAnimation.layersToAnimate.length; i++){
                    this.replaceSpriteIndexAtLayer(this.currentAnimation.layersToAnimate[i], this.currentAnimation.frames[this.currentAnimation.currentFrame]);
                }
            },

            /**
             * addLayer: When called, adds a new draw layer to the rendering stack.
             * @param spriteSheet -- Path to the image file that holds the sprite. (MUST BE PRE-LOADED IN MAIN.JS)
             * @param spriteIndex -- The index of the sprite to draw in the spriteSheet
             * @param frameWidth -- The width of each frame in spriteSheet.
             * @param frameHeight -- The height of each frame in spriteSheet.
             * @param xOffset -- When the layer is drawn, it is drawn at 0,0. By providing an offset, it then draws at 0+offset.
             * @param yOffset -- When the layer is drawn, it is draw at 0,0. By providing an offset, the layer is drawn at 0+offset.
             */
            addLayer:function (spriteSheet, spriteIndex, frameWidth, frameHeight, xOffset, yOffset) {
                this.layers.push(
                    {
                        "spriteSheet":spriteSheet,
                        "spriteIndex":spriteIndex,
                        "frameWidth":frameWidth,
                        "frameHeight":frameHeight,
                        "xOffset":xOffset || 0,
                        "yOffset":yOffset || 0
                    }
                );
            },

            /**
             * replaceSpriteIndexAtLayer: Replaces the spriteIndex at layer with a new spriteIndex.
             * @param layer -- The layer index, from the layers[] array.
             * @param spriteIndex -- The targetIndex, the index in the spriteSheet to use.
             */
            replaceSpriteIndexAtLayer: function(layer, spriteIndex) {
                this.layers[layer].spriteIndex = spriteIndex;
            },

            /**
             * replaceSpriteSheetAtLayer: Replaces the loaded spritesheet in layers[] with a new image path.
             * @param layer -- The layer index to replace.
             * @param spriteSheetPath -- The path to the new spriteSheet.
             */
            replaceSpriteSheetAtlayer: function(layer, spriteSheetPath){
                this.layers[layer].spriteSheet = spriteSheetPath;
            },

            /**
             * copyLayerToLocation: Copies the source data to the target.
             * @param source -- Index value of the source layer.
             * @param target -- Index value of the target layer.
             */
            copyLayerToLocation: function(source, target){
                this.layers[target] = this.layers[source];
            },

            /**
             * flush(): Destroys all layers and creates garbage for the garbage collector.
             */
            flush: function(){
                this.layers = [];
            },

            /**
             * render(): The main renderer. This cycles through the layers array and then draws the sprite from the spriteSheet
             *           in each layer to the drawingCanvas by calling the drawLayer method.
             * NOTE: layers are drawn from 0. So the first layer (index of 0) will be drawn first. Any additional layer will be drawn
             * ON TOP of the first layer.
             */
            render:function () {
                // Cycle through every layer in layers.
                for (var layer = 0; layer < this.layers.length; layer++) {
                    // Create new temporary variables to store the stuff we need.
                    var image = new ig.Image(this.layers[layer].spriteSheet),
                        scale = ig.system.scale,
                        imgWidthScaled = Math.floor(this.layers[layer].frameWidth * scale),
                        flipX = 0,
                        flipY = 0,
                        imgHeightScaled = Math.floor(this.layers[layer].frameHeight * scale);
                    if (this.currentAnimation){
                        flipX = (this.currentAnimation.flip.x ? imgWidthScaled : 0),
                        flipY = (this.currentAnimation.flip.y ? imgHeightScaled : 0);
                    }
                    // Draw the layer.
                    this.drawLayer(
                        image.data,
                        ( Math.floor(this.layers[layer].spriteIndex * this.layers[layer].frameWidth)) * scale,
                        ( Math.floor(this.layers[layer].spriteIndex * this.layers[layer].frameHeight / image.width) * this.layers[layer].frameHeight) * scale,
                        imgWidthScaled,
                        imgHeightScaled,
                        (0 + this.layers[layer].xOffset - flipX),
                        (0 + this.layers[layer].yOffset - flipY),
                        imgWidthScaled,
                        imgHeightScaled);
                }
            },

            /**
             * drawLayer: The main drawing method. Takes the passed parameters and thenf draws to drawingCanvas.
             * @param image -- The sprite to draw.
             * @param clipX -- The X position to start clippinh.
             * @param clipY -- The Y position to start clipping
             * @param widthClip -- The total width of the clipped image
             * @param heightClip -- The total height of the clipped image.
             * @param x -- The X value (On the off-screen canvas) to draw.
             * @param y -- The Y value (On the off-screen canvas) to draw.
             * @param width --Width.
             * @param height -- Height
             */
            drawLayer: function(image, clipX, clipY, widthClip, heightClip, x, y, width, height ){
                this.drawingContext.drawImage(image, clipX, clipY, widthClip, heightClip, x, y, width, height);
            }
        })
    })