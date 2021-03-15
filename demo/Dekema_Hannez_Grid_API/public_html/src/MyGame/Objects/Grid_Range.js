/* 
 * Allows for mass-changing of grid tile properties for a given range of index values
 * that are contained within the grid object.
 * 
 */

/*global gEngine: false, Grid: false, Tile: false, vec2: false, GameObject: false, SpriteRenderable: false ShakePosition: false */

/*
// the edit tile functions
// these will all return false if the given X/Y is invalid
// and true if the tile was able to be edited
Grid.prototype.editTileTexture = function(x, y, texture) {
   if (x < 0 || y < 0 || x >= this.mGridW || y >= this.mGridH) {
       return false; // invalid coordinates
   } else {
       this.mTiles[y][x].setTexture(texture);
       return true;
   }
};

Grid.prototype.editTileCollision = function(x, y, toSet) {
  if (x < 0 || y < 0 || x >= this.mGridW || y >= this.mGridH) {
       return false; // invalid coordinates
   } else {
       this.mTiles[y][x].setCollision(toSet);
       return true;
   }
};

Grid.prototype.editTileVisible = function(x, y, toSet) {
  if (x < 0 || y < 0 || x >= this.mGridW || y >= this.mGridH) {
       return false; // invalid coordinates
   } else {
       this.mTiles[y][x].setVisible(toSet);
       return true;
   }
};

// Now, the edit range functions
// All of these include basic handling for unexpected range input
// if a number is lower than 0, it will be set to 0
// if a number is higher than the grid height/width, will be set to that
Grid.prototype.editRangeTexture = function(x1, y1, x2, y2, texture) {
  // error handling
  x1 = Math.max(0, Math.min(x1, this.mGridW - 1));
  x2 = Math.max(0, Math.min(x2, this.mGridW - 1));
  y1 = Math.max(0, Math.min(y1, this.mGridH - 1));
  y2 = Math.max(0, Math.min(y2, this.mGridH - 1));
  
  for (var i = y1; i <= y2; i++) {
      for (var j = x1; j <= x2; j++) {
          this.mTiles[i][j].setTexture(texture);
      }
  }
};

Grid.prototype.editRangeCollision = function(x1, y1, x2, y2, toSet) {
  // error handling
  x1 = Math.max(0, Math.min(x1, this.mGridW - 1));
  x2 = Math.max(0, Math.min(x2, this.mGridW - 1));
  y1 = Math.max(0, Math.min(y1, this.mGridH - 1));
  y2 = Math.max(0, Math.min(y2, this.mGridH - 1));
  
  for (var i = y1; i <= y2; i++) {
      for (var j = x1; j <= x2; j++) {
          this.mTiles[i][j].setCollision(toSet);
      }
  }
};

Grid.prototype.editRangeVisible = function(x1, y1, x2, y2, toSet) {
  // error handling
  x1 = Math.max(0, Math.min(x1, this.mGridW - 1));
  x2 = Math.max(0, Math.min(x2, this.mGridW - 1));
  y1 = Math.max(0, Math.min(y1, this.mGridH - 1));
  y2 = Math.max(0, Math.min(y2, this.mGridH - 1));
  
  for (var i = y1; i <= y2; i++) {
      for (var j = x1; j <= x2; j++) {
          this.mTiles[i][j].setVisible(toSet);
      }
  }
}; */