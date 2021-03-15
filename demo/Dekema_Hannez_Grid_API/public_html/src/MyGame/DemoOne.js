/*
 * File: DemoOne.js 
 * This will serve as a demonstration of the Grid API functionality in the form of use in a 
 * "MyGame" type structure. This demo demonstrates our Grid System API through the use of a free 
 * moving object that interacts with the grid. On click, collidable blocks are placed that the 
 * free moving player cannot move through. Demonstrates the ability to do collision checking with 
 * grid tiles with objects not explicitly given to the grid.
 * 
 * Texture assets used belong to Mojang, the developers of the game Minecraft.
 */

"use strict";

function DemoOne() {
    // The camera to view the scene
    this.mCamera = null;

    this.mGrid = null;
    
    this.kPlayer = "assets/player.png";
    this.kStone = "assets/stoneone.png";
    this.kGrass = "assets/grassone.png";
    
    this.mPlayer = null;
    
    this.mVisualEdge = false;
    
    this.mMsg = null;
    this.mControls = null;
    this.mControls2 = null;
}
gEngine.Core.inheritPrototype(DemoOne, Scene);

DemoOne.prototype.loadScene = function () {
    // override to load scene specific contents
    gEngine.Textures.loadTexture(this.kStone);
    gEngine.Textures.loadTexture(this.kGrass);
    gEngine.Textures.loadTexture(this.kPlayer);
};

DemoOne.prototype.unloadScene = function () {
    // .. unload all resources
    gEngine.Textures.unloadTexture(this.kPlayer);
    gEngine.Textures.unloadTexture(this.kStone);
    gEngine.Textures.unloadTexture(this.kGrass);
    
    var next = new DemoTwo();
    gEngine.Core.startScene(next);
};

DemoOne.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 37.5), // position of the camera
        100,                       // width of camera
        [0, 0, 640, 480]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
            // sets the background to gray
    
    this.mMsg = new FontRenderable("MOUSE TRACKING");
    this.mMsg.setColor([0, 0, 0, 1]);
    this.mMsg.getXform().setPosition(1, 74);
    this.mMsg.getXform().setHeight(2);
    
    this.mControls = new FontRenderable("Controls");
    this.mControls.setColor([0, 0, 0, 1]);
    this.mControls.getXform().setPosition(1, 4.5);
    this.mControls.getXform().setHeight(2);
    this.mControls.setText("Controls: WASD = Move Character, V = Toggle Grid Visibility, LMB = Place Block,");
    
    this.mControls2 = new FontRenderable("Controls");
    this.mControls2.setColor([0, 0, 0, 1]);
    this.mControls2.getXform().setPosition(1, 2.5);
    this.mControls2.getXform().setHeight(2);
    this.mControls2.setText("MMB = Remove Block");
    
    this.mPlayer = new GameObject(new TextureRenderable(this.kPlayer));
    this.mPlayer.getRenderable().setColor([1, 1, 1, 0]);
    this.mPlayer.getXform().setPosition(20, 20);
    this.mPlayer.getXform().setSize(2.5, 4.5);

    // Filling nearly the entire canvas world; Leaving space for text below.
    this.mGrid = new Grid(20, 14, 50, 40, 5, 5);
    this.mGrid.setVisualizeEdges(this.mVisualEdge);
    
    
    this.mGrid.editRangeTexture(0, 0, 20, 14, this.kGrass);
    this.mGrid.editRangeVisible(0, 0, 20, 14, true);
};

// Draw function to manage draws to the canvas
DemoOne.prototype.draw = function () {
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // Clearing Canvas
    this.mCamera.setupViewProjection(); // Setup cam view projection

    this.mControls.draw(this.mCamera);
    this.mControls2.draw(this.mCamera);
    
    this.mGrid.draw(this.mCamera);
    this.mPlayer.draw(this.mCamera);
    
    this.mMsg.draw(this.mCamera);
};

// Update function updating applicaiton state.
DemoOne.prototype.update = function () {
   this._updateKeys();
   var msg = "Mouse @: WC = (";
   
   var mouseX = this.mCamera.mouseWCX();
   var mouseY = this.mCamera.mouseWCY();
   
   msg += mouseX.toPrecision(3) + ", " + mouseY.toPrecision(3) + ") ";
   msg += "GridIndex = (";
   
   var gridIndex = this.mGrid.getTileAtWC(mouseX, mouseY);
   msg += gridIndex[0] + ", " + gridIndex[1] + ")";
   
   this.mMsg.setText(msg);
};


DemoOne.prototype._updateKeys = function() {
    var delta = 0.25;
    
    // Unload & swap to demo 2.
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        gEngine.GameLoop.stop();
    }
    
    // *** WASD: Use to demo object movement within grid. ***
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) { // North
        var TL = [(this.mPlayer.getXform().getXPos() - (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() + (this.mPlayer.getXform().getHeight() / 2))];
        var TR = [(this.mPlayer.getXform().getXPos() + (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() + (this.mPlayer.getXform().getHeight() / 2))];
        
        var currTLIndex = this.mGrid.getTileAtWC(TL[0], TL[1]);
        var currTRIndex = this.mGrid.getTileAtWC(TR[0], TR[1]);
        var nextTLIndex = this.mGrid.getTileAtWC(TL[0], TL[1] + delta);
        var nextTRIndex = this.mGrid.getTileAtWC(TR[0], TR[1] + delta);
        
        if (currTLIndex[1] !== nextTLIndex[1] || currTRIndex[1] !== nextTRIndex[1]) {
            var TLCurrTile = this.mGrid.getTileAtIndex(currTLIndex[0], currTLIndex[1]);
            var TLNextTile = this.mGrid.getTileAtIndex(nextTLIndex[0], nextTLIndex[1]);
            var TRCurrTile = this.mGrid.getTileAtIndex(currTRIndex[0], currTRIndex[1]);
            var TRNextTile = this.mGrid.getTileAtIndex(nextTRIndex[0], nextTRIndex[1]);
            
            var TLCollide = TLNextTile !== null && !TLNextTile.getCollision() && !TLCurrTile.getWalls().includes(Grid.eDirection.eNorth);
            var TRCollide = TRNextTile !== null && !TRNextTile.getCollision() && !TRCurrTile.getWalls().includes(Grid.eDirection.eNorth);
            
            if (TLCollide && TRCollide) {
                this.mPlayer.getXform().incYPosBy(delta);
            }
        } else {
            this.mPlayer.getXform().incYPosBy(delta);
        }
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) { // West   
        var TL = [(this.mPlayer.getXform().getXPos() - (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() + (this.mPlayer.getXform().getHeight() / 2))];
        var BR = [(this.mPlayer.getXform().getXPos() - (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() - (this.mPlayer.getXform().getHeight() / 2))];
        
        var currTLIndex = this.mGrid.getTileAtWC(TL[0], TL[1]);
        var currBRIndex = this.mGrid.getTileAtWC(BR[0], BR[1]);
        var nextTLIndex = this.mGrid.getTileAtWC(TL[0] - delta, TL[1]);
        var nextBRIndex = this.mGrid.getTileAtWC(BR[0] - delta, BR[1]);
        
        if (currTLIndex[0] !== nextTLIndex[0] || currBRIndex[0] !== nextBRIndex[0]) {
            var TLCurrTile = this.mGrid.getTileAtIndex(currTLIndex[0], currTLIndex[1]);
            var TLNextTile = this.mGrid.getTileAtIndex(nextTLIndex[0], nextTLIndex[1]);
            var BRCurrTile = this.mGrid.getTileAtIndex(currBRIndex[0], currBRIndex[1]);
            var BRNextTile = this.mGrid.getTileAtIndex(nextBRIndex[0], nextBRIndex[1]);
            
            var TLCollide = TLNextTile !== null && !TLNextTile.getCollision() && !TLCurrTile.getWalls().includes(Grid.eDirection.eWest);
            var BRCollide = BRNextTile !== null && !BRNextTile.getCollision() && !BRCurrTile.getWalls().includes(Grid.eDirection.eWest);
            
            if (TLCollide && BRCollide) {
                this.mPlayer.getXform().incXPosBy(-delta);
            }
        } else {
            this.mPlayer.getXform().incXPosBy(-delta);
        }
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) { // South
        var BL = [(this.mPlayer.getXform().getXPos() - (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() - (this.mPlayer.getXform().getHeight() / 2))];
        var BR = [(this.mPlayer.getXform().getXPos() + (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() - (this.mPlayer.getXform().getHeight() / 2))];
        
        var currBLIndex = this.mGrid.getTileAtWC(BL[0], BL[1]);
        var currBRIndex = this.mGrid.getTileAtWC(BR[0], BR[1]);
        var nextBLIndex = this.mGrid.getTileAtWC(BL[0], BL[1] - delta);
        var nextBRIndex = this.mGrid.getTileAtWC(BR[0], BR[1] - delta);
        
        if (currBLIndex[1] !== nextBLIndex[1] || currBRIndex[1] !== nextBRIndex[1]) {
            var BLCurrTile = this.mGrid.getTileAtIndex(currBLIndex[0], currBLIndex[1]);
            var BLNextTile = this.mGrid.getTileAtIndex(nextBLIndex[0], nextBLIndex[1]);
            var BRCurrTile = this.mGrid.getTileAtIndex(currBRIndex[0], currBRIndex[1]);
            var BRNextTile = this.mGrid.getTileAtIndex(nextBRIndex[0], nextBRIndex[1]);
            
            var BLCollide = BLNextTile !== null && !BLNextTile.getCollision() && !BLCurrTile.getWalls().includes(Grid.eDirection.eSouth);
            var BRCollide = BRNextTile !== null && !BRNextTile.getCollision() && !BRCurrTile.getWalls().includes(Grid.eDirection.eSouth);
            
            if (BLCollide && BRCollide) {
                this.mPlayer.getXform().incYPosBy(-delta);
            }
        } else {
            this.mPlayer.getXform().incYPosBy(-delta);
        }
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) { // East
        var TR = [(this.mPlayer.getXform().getXPos() + (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() + (this.mPlayer.getXform().getHeight() / 2))];
        var BR = [(this.mPlayer.getXform().getXPos() + (this.mPlayer.getXform().getWidth() / 2)), (this.mPlayer.getXform().getYPos() - (this.mPlayer.getXform().getHeight() / 2))];
        
        var currTRIndex = this.mGrid.getTileAtWC(TR[0], TR[1]);
        var currBRIndex = this.mGrid.getTileAtWC(BR[0], BR[1]);
        var nextTRIndex = this.mGrid.getTileAtWC(TR[0] + delta, TR[1]);
        var nextBRIndex = this.mGrid.getTileAtWC(BR[0] + delta, BR[1]);
        
        if (currTRIndex[0] !== nextTRIndex[0] || currBRIndex[0] !== nextBRIndex[0]) {
            var TRCurrTile = this.mGrid.getTileAtIndex(currTRIndex[0], currTRIndex[1]);
            var TRNextTile = this.mGrid.getTileAtIndex(nextTRIndex[0], nextTRIndex[1]);
            var BRCurrTile = this.mGrid.getTileAtIndex(currBRIndex[0], currBRIndex[1]);
            var BRNextTile = this.mGrid.getTileAtIndex(nextBRIndex[0], nextBRIndex[1]);
            
            var TRCollide = TRNextTile !== null && !TRNextTile.getCollision() && !TRCurrTile.getWalls().includes(Grid.eDirection.eEast);
            var BRCollide = BRNextTile !== null && !BRNextTile.getCollision() && !BRCurrTile.getWalls().includes(Grid.eDirection.eEast);
            
            if (TRCollide && BRCollide) {
                this.mPlayer.getXform().incXPosBy(delta);
            }
        } else {
            this.mPlayer.getXform().incXPosBy(delta);
        }
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.V)) {
        if (this.mVisualEdge) {
            this.mVisualEdge = false;   
        } else {
            this.mVisualEdge = true;
        }
        
        this.mGrid.setVisualizeEdges(this.mVisualEdge);
    }
    
    // Add a collidable block to mouse position
    if (gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Left)) {
        var mouseX = this.mCamera.mouseWCX();
        var mouseY = this.mCamera.mouseWCY();
        
        var tileIndex = this.mGrid.getTileAtWC(mouseX, mouseY);
        var tile = this.mGrid.getTileAtIndex(tileIndex[0], tileIndex[1]);
        
        if (tile !== null) {
            tile.setTexture(this.kStone);
            tile.setCollision(true);
        }
    }
    
    // Remove a collidable block at mouse position, if there is one.
    if (gEngine.Input.isButtonClicked(gEngine.Input.mouseButton.Middle)) {
        var mouseX = this.mCamera.mouseWCX();
        var mouseY = this.mCamera.mouseWCY();
        
        var tileIndex = this.mGrid.getTileAtWC(mouseX, mouseY);
        var tile = this.mGrid.getTileAtIndex(tileIndex[0], tileIndex[1]);
        
        if (tile !== null) {
            tile.setTexture(this.kGrass);
            tile.setCollision(false);
        }
    }
    
};