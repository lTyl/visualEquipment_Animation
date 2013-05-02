# Live Demos
1. http://labs.aurava.com/javascript/visualEquipment/
2. http://labs.aurava.com/javascript/visualEquipment_Performance/
3. http://labs.aurava.com/javascript/visualEquipment_Animation/


## _Usage_

1. In your entity, make sure you require `'plugins.visual-equipment'`

2. Create instance of VisualEquipment():
`visualEquipment: new VisualEquipment(<WidthOfFrame>, <heightOfFrame>)`

3. Set VisualEquipment() preferred render mode:
`this.visualEquipment.renderMode = "PRE_RENDER"`or `this.visualEquipment.renderMode = "REAL_TIME"`
> PRE-RENDER - Does not support animation frames. Only renders the resulting image once, or until render() is called again.
> REAL_TIME - Supports animations. Layers the sprite image in REAL_TIME with no caching or optimizations.

4. Add your draw layers: `this.visualEquipment.addLayer(<path/to/spritesheet>, <index of sprite in_ heet>, <width of sprite frame>, <height of sprite frame>, <xOffset>, <yOffset>)`

5. If using animations, add your animations: `this.visualEquipment.addAnim(<name>, <animation Delay>, <array Holding index Values>, <amount OfTimes To Cycle Animation>, <layers that are affected by this animation>)`

6. Add `this.visualEquipment.update()` to your update method.

7. Add `this.visualEquipment.draw(this.pos.x, this.pos.y)` to your draw method.

## NOTICE
This code is a proof of concept and is not game ready. It is not very intuitive nor performant.

## License
Relesed under the WTFPL license: http://www.wtfpl.net/.