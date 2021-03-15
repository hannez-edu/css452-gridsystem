/*
 * File: DemoTwo.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectSet, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, DyePack, Hero, Minion, Brain,
  GameObject, DyePackSet, Patrol */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DemoTwo() {
    this.kSky = "assets/sky.png";
    this.kMinionSprite = "assets/minion_portal.png";

    // The camera to view the scene
    this.mCamera = null;
    this.mBg = null;

    this.mMsg = null;
    this.mTracker = 0;
    this.mTile = null;
    this.mGrid = null;
    this.mHero = null;
    this.mHeroId = null;
    this.mAttempted = false;
    this.mMoveTracker = 0;
    this.mFound = -1;
}
gEngine.Core.inheritPrototype(DemoTwo, Scene);

DemoTwo.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kSky);
};

DemoTwo.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kSky);
    
    var next = new DemoOne();
    gEngine.Core.startScene(next);
};

DemoTwo.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 50), // position of the camera
        200,                       // width of camera
        [0, 0, 800, 800]           // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0, 0, 0, 1]);
            // sets the background to gray
   
    this.mAttempted = false;


    // Objects in the scene

    this.mMsg = new FontRenderable("Status Message");
    this.mMsg.setColor([1, 1, 1, 1]);
    this.mMsg.getXform().setPosition(-45, (36 - 70));
    this.mMsg.setTextHeight(3);
    
    //this.mTile = new Tile(10, 10, 50, 50, false);
    //this.mTile.setTexture(this.kStone);
    //this.mTile.setVisible(true);
    
    this.mHero = new GameObject(new TextureRenderable(this.kMinionSprite));
    this.mHero.getRenderable().setColor([1, 1, 1, 0]);
    this.mHero.getXform().setSize(10, 10);
    
    this.mGrid = new Grid(20, 15, 50, 75, 10, 10);
    this.mGrid.setVisualizeEdges(false); 
    
    this.mHeroId = this.mGrid.addObjectToGrid(this.mHero);
    this.mGrid.changeObjectPosition(this.mHeroId, 10, 7);
    this.mGrid.editRangeTexture(0, 0, 50, 50, this.kSky);
    this.mGrid.editRangeVisible(0, 0, 50, 50, true);
    this.mGrid.editTileVisible(10, 7, false);
    
    this.mGrid.addWallRange(0, 0, 20, 15, [0, 1]);
    this.mGrid.addWallRange(0, 0, 20, 15, [1, 0]);
    this.mGrid.setVisualizeWalls(true);

};


DemoTwo.prototype.drawCamera = function (camera) {
    camera.setupViewProjection();
    //this.mBg.draw(camera);
    this.mGrid.draw(camera);
    this.mHero.draw(camera);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
DemoTwo.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.8, 0.8, 0.8, 1.0]); // clear to light gray

    // Step  B: Draw with all three cameras
    this.drawCamera(this.mCamera);
    this.mMsg.draw(this.mCamera);   //q only draw status in the main camera
  
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
DemoTwo.prototype.update = function () {
    
    // Unload & swap to demo 1.
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        gEngine.GameLoop.stop();
    }
    
    var msg = "";
    var track = this.mTracker + 1;
    var inGrid = false;
    var tilePos = [-1, -1];
    if (this.mCamera.isMouseInViewport()) {
        var mousePos = vec2.fromValues(this.mCamera.mouseWCX(), this.mCamera.mouseWCY());
        inGrid = this.mGrid.isWCValidInGrid(mousePos[0], mousePos[1]);
        if (inGrid) {
            tilePos = this.mGrid.getTileAtWC(mousePos[0], mousePos[1]);
            
            if (gEngine.Input.isButtonPressed(gEngine.Input.mouseButton.Left)) {
                var start = this.mGrid.getIDPosition(this.mHeroId);
                this.mFound = this.mGrid.AStarSearch(start, tilePos);
                this.mTracker = 0;
                this.mMoveTracker = 0;
            }
        }
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.Space)) {
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
            var pos = this.mGrid.getIDPosition(this.mHeroId);
            if (pos[0] > 0) {
                this.mGrid.editTileVisible(pos[0] - 1, pos[1], false);
                this.mGrid.removeWallRange(pos[0], pos[1], pos[0], pos[1], [-1, 0]);
                this.mGrid.moveObjectPositionDir(this.mHeroId, [-1, 0]);
            }
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
            var pos = this.mGrid.getIDPosition(this.mHeroId);
            if (pos[0] < 19) {
                this.mGrid.editTileVisible(pos[0] + 1, pos[1], false);
                this.mGrid.removeWallRange(pos[0], pos[1], pos[0], pos[1], [1, 0]);
                this.mGrid.moveObjectPositionDir(this.mHeroId, [1, 0]);
            }
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Up)) {
            var pos = this.mGrid.getIDPosition(this.mHeroId);
            if (pos[1] < 14) {
                this.mGrid.editTileVisible(pos[0], pos[1] + 1, false);
                this.mGrid.removeWallRange(pos[0], pos[1], pos[0], pos[1], [0, 1]);
                this.mGrid.moveObjectPositionDir(this.mHeroId, [0, 1]);
            }
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Down)) {
            var pos = this.mGrid.getIDPosition(this.mHeroId);
            if (pos[1] > 0) {
                this.mGrid.editTileVisible(pos[0], pos[1] - 1, false);
                this.mGrid.removeWallRange(pos[0], pos[1], pos[0], pos[1], [0, -1]);
                this.mGrid.moveObjectPositionDir(this.mHeroId, [0, -1]);
            }
        }
    } else {
        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Left)) {
            this.mGrid.moveObjectPositionDir(this.mHeroId, [-1, 0]);
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Right)) {
            this.mGrid.moveObjectPositionDir(this.mHeroId, [1, 0]);
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Up)) {
            this.mGrid.moveObjectPositionDir(this.mHeroId, [0, 1]);
        }

        if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Down)) {
            this.mGrid.moveObjectPositionDir(this.mHeroId, [0, -1]);
        }
    }
    
    
    if (this.mFound.length > this.mMoveTracker) {
        if (this.mTracker === 3) {
            var temp = this.mFound[this.mMoveTracker];
            this.mGrid.moveObjectPositionDir(this.mHeroId, temp);
            this.mTracker = 0;
            this.mMoveTracker++;
        }
        this.mTracker++;
    }
    
    
    msg += "In grid: " + inGrid + ", Tile: " + tilePos[0] + ", " + tilePos[1];
    msg += " Found Path Length: " + this.mFound.length;
    if (this.mFound.length > 0) {
        msg += " Moving Direction: [" + this.mFound[0][0] + ", " + this.mFound[0][1] + "]";
    }
    this.mMsg.setText(msg);
};