/* 
 * Manages the state of a single tile.
 */

// tileW & TileH units are in WC
function Tile(tileW, tileH, tileX, tileY, isEdge) {
  this.mXPos = tileX;
  this.mYPos = tileY;
  this.mWidth = tileW;
  this.mHeight = tileH;
  this.mTexture = null;
  this.mRenderComponent = null;
  this.mCollidable = false;
  this.mVisible = false;
  this.mGridLinesVisible = false;
  this.mWallsVisible = false;
  this.mWalls = [];
  this.mMoves = [];
  this.mIsEdge = isEdge;
  this.mCost = 0;
  this.mHCost = 0;
  this.mDirection = [0, 0]; // code for stop
  this.mParent = [-1, -1];
  this.mWallLines = [];
  
  // initialize moves
  this.mMoves.push([1, 0]);
  this.mMoves.push([-1, 0]);
  this.mMoves.push([0, 1]);
  this.mMoves.push([0, -1]);
  
  // now, create the edge lines
  this._createEdgeLines(tileW, tileH, tileX, tileY);
  this._createWallLines(tileW, tileH, tileX, tileY);
}

// Draw the tile as LineRenderables around the bounds of the tile.
Tile.prototype.draw = function(cam) {
  // draw the renderable of the texture if exists and is visible
  if (this.mVisible === true && this.mRenderComponent !== null) {
    this.mRenderComponent.draw(cam);
  }
  // if we have set the edges to be visible
  if (this.mGridLinesVisible === true) {
    // if this is an edge tile, draw the top and left LineRenderables
    if (this.mIsEdge === true) {
      // draw left and top LineRenderables
      this.mEdgeLines[0].draw(cam); // the left line
      this.mEdgeLines[1].draw(cam); // the top line
    }
    // draw bottom and right LineRenderables
    this.mEdgeLines[2].draw(cam); // the right line
    this.mEdgeLines[3].draw(cam); // the bottom line
  }
  // draw wall lines
  if (this.mWallsVisible === true) {
    for (var i = 0; i < this.mWalls.length; i++) {
        // if this is top or bottom
        if (this.mWalls[i][0] === 0) {
            if (this.mWalls[i][1] === -1) {
                // bottom wall
                this.mWallLines[3].draw(cam);
            } else {
                // top wall
                this.mWallLines[1].draw(cam);
            }
        }
        else {
            // else, this is a left or right wall
            if (this.mWalls[i][0] === -1) {
                // left wall
                this.mWallLines[0].draw(cam);
            } else {
                // right wall
                this.mWallLines[2].draw(cam);
            }
        }
    } 
  }
  
};

Tile.prototype.getXPosWC = function() {
  return this.mXPos;
};

Tile.prototype.getYPosWC = function() {
  return this.mYPos;
};

Tile.prototype.getCollision = function() {
  return this.mCollidable;
};

Tile.prototype.setCollision = function(bool) {
  this.mCollidable = bool;
};

// Push given direction to the walls array.
// Might also want a func that can remove walls.
// Return true if new wall was added, false if the wall already exists.
Tile.prototype.addWall = function(direction) {
  for (var i = 0; i < this.mWalls.length; i++) {
      if (direction[0] === this.mWalls[i][0] && direction[1] === this.mWalls[i][1]) {
          return false;
      }
  }
  for (var i = 0; i < this.mMoves.length; i++) {
      if (direction[0] === this.mMoves[i][0] && direction[1] === this.mMoves[i][1]) {
          this.mMoves.splice(i, 1);
      }
  } 
  
  this.mWalls.push(direction);
  return true;
};

// acts almost as an assert that there is no wall in that direction
Tile.prototype.removeWall = function(direction) {
    for (var i = 0; i < this.mWalls.length; i++) {
        if (direction[0] === this.mWalls[i][0] && direction[1] === this.mWalls[i][1]) {
            this.mWalls.splice(i, 1);
            this.mMoves.push(direction);
            return true;
        }
    }
    return false;
};

// Return array of directions containing walls for this tile.
Tile.prototype.getWalls = function() {
  return this.mWalls;
};

// Return array of directions not containing walls for this tile.
// Also invalidate moves if the tile the move would lead to is in collidable state
Tile.prototype.getMoves = function() {
    return this.mMoves;
};

// Set the texture field to a given texture. 
// May modify later to support passing specific texture renderables to fill a tile with, 
// rather than just a texture path corresponding to a loaded texture asset.
Tile.prototype.setTexture = function(texture) {
  this.mRenderComponent = new TextureRenderable(texture);
  this.mRenderComponent.setColor([1, 1, 1, 0]);
  this.mRenderComponent.getXform().setPosition(this.mXPos, this.mYPos);
  this.mRenderComponent.getXform().setSize(this.mWidth, this.mHeight);
  this.mTexture = texture;
};

// Returns if the current tile is visible or not. (Has a texture and is being drawn)
Tile.prototype.isVisible = function() {
  return this.mVisible;
};

// Set the visibility of the tile. For it to be set to visible, the tile must have
// a non-null texture associated with it. Returns true if was successful, false otherwise.
Tile.prototype.setVisible = function(setTo) {
  if (this.mTexture === null) { // No texture, so don't modify visibility.
    return false;
  } else {
    this.mVisible = setTo;
    return true;
  }
};

// set grid line visibility
Tile.prototype.setGridLineVisibility = function(setTo) {
  this.mGridLinesVisible = setTo;
};

Tile.prototype.setWallVisibility = function(setTo) {
  this.mWallsVisible = setTo;
};

Tile.prototype._createEdgeLines = function(tileW, tileH, tileX, tileY) {
  this.mEdgeLines = [];
  var leftX = tileX - (tileW / 2);
  var rightX = tileX + (tileW / 2);
  var topY = tileY + (tileH / 2);
  var bottomY = tileY - (tileH / 2);
  var leftLine = new LineRenderable(leftX, topY, leftX, bottomY);
  var rightLine = new LineRenderable(rightX, topY, rightX, bottomY);
  var topLine = new LineRenderable(leftX, topY, rightX, topY);
  var bottomLine = new LineRenderable(leftX, bottomY, rightX, bottomY);
  this.mEdgeLines.push(leftLine);
  this.mEdgeLines.push(topLine);
  this.mEdgeLines.push(rightLine);
  this.mEdgeLines.push(bottomLine);
};

Tile.prototype._createWallLines = function(tileW, tileH, tileX, tileY) {
  
  var leftX = tileX - (tileW / 2);
  var rightX = tileX + (tileW / 2);
  var topY = tileY + (tileH / 2);
  var bottomY = tileY - (tileH / 2);
  var leftLine = new LineRenderable(leftX, topY, leftX, bottomY);
  leftLine.setColor([1, 1, 1, 1]);
  var rightLine = new LineRenderable(rightX, topY, rightX, bottomY);
  rightLine.setColor([1, 1, 1, 1]);
  var topLine = new LineRenderable(leftX, topY, rightX, topY);
  topLine.setColor([1, 1, 1, 1]);
  var bottomLine = new LineRenderable(leftX, bottomY, rightX, bottomY);
  bottomLine.setColor([1, 1, 1, 1]);
  this.mWallLines.push(leftLine);
  this.mWallLines.push(topLine);
  this.mWallLines.push(rightLine);
  this.mWallLines.push(bottomLine);
};

Tile.prototype.readySearch = function() {
    this.mCost = 0;
    this.mHCost = 0;
    this.mDirection = [0, 0];
    this.mParent = [-1, -1];
};
Tile.prototype.setC = function(c) { this.mCost = c; };
Tile.prototype.getC = function() { return this.mCost; };
Tile.prototype.setH = function(h) { this.mHCost = h; };
Tile.prototype.getH = function() { return this.mHCost; };
Tile.prototype.getF = function() { return this.mCost + this.mHCost; };
Tile.prototype.setD = function(d) { this.mDirection = d; };
Tile.prototype.getD = function() { return this.mDirection; };
Tile.prototype.setP = function(p) { this.mParent = [p[0], p[1]]; };
Tile.prototype.getP = function() { return this.mParent; };
Tile.prototype.hasP = function() {
    return ((this.mParent[0] > -1) && (this.mParent[1] > -1));
};