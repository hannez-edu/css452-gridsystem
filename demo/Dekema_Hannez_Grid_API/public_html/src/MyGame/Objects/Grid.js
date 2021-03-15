/* 
 * Manages a grid object within the world, composed of many tile objects.
 * Can easily fetch tiles and change their state, as well as get their WC positions.
 * Grid size determined in tiles, tile size determined in WC units.
 * Center of grid positioning in WC can be changed.
 * 
 */

/*global gEngine: false, Tile: false, vec2: false, GameObject: false, SpriteRenderable: false ShakePosition: false */


// GridW & GridH units are in # of tile objects.
// GridX&Y units are in WC, and determine the location of the CENTER of the grid.
// tileW & TileH units are in WC, and signify the size of each tile in the grid.
function Grid(gridW, gridH, gridX, gridY, tileW, tileH) {
    this.mTiles = []; // This array will be filled with array objects of tiles
    this.mTileW = tileW;
    this.mTileH = tileH;

    this.mGridW  = gridW;
    this.mGridH = gridH;
    this.mGridX = gridX;
    this.mGridY = gridY;

    // Track objects that have been given to the Grid to control movement of.
    this.mObjects = [];

    // Filling grid with tile object in grid dimensions given. May move to another func.
    for (var i = 0; i < gridH; i++) { // Col loop
      var row = [];
      for (var j = 0; j < gridW; j++) { // Row loop
        var tilex = (gridX - (tileW * Math.floor(gridW / 2))) + (j * tileW);
        var tiley = (gridY - (tileH * Math.floor(gridH / 2))) + (i * tileH);
        var isEdge = false;
        // Even case for X; offset
        if (gridW % 2 === 0) { 
          tilex = tilex + (tileW / 2);
        }
        // Even case for Y; offset
        if (gridH % 2 === 0) { 
          tiley = tiley + (tileH / 2);
        }
        // Tile is an edge tile; Mark it as such.
        if (i === (gridH - 1) || i === 0 || j === (gridW - 1) || j === 0) {
          isEdge = true;
        }
        row.push(new Tile(tileW, tileH, tilex, tiley, isEdge));
      }
      this.mTiles.push(row);
    }
    
    // add walls to the edges of the table
    // for prototyping purposes
    for (var i = 0; i < this.mGridW; i++) {
        this.mTiles[0][i].addWall([0, -1]); // add wall to bottom
        this.mTiles[this.mGridH - 1][i].addWall([0, 1]); // add wall to top
    }
    
    for (var i = 0; i < this.mGridH; i++) {
        this.mTiles[i][0].addWall([-1, 0]); // add wall to left
        this.mTiles[i][this.mGridW - 1].addWall([1, 0]); // add wall to right
    }
    
}

// Directional Enum; Each defined as the step from curr index to the next
Grid.eDirection = Object.freeze({
    eNorth: [0, 1],
    eEast: [1, 0],  
    eSouth: [0, -1],
    eWest: [-1, 0],
    eStop: [0, 0]
});

// Draw each tile object within the grid.
Grid.prototype.draw = function(cam) {
  for (var i = 0; i < this.mGridH; i++) { // Col loop
    for (var j = 0; j < this.mGridW; j++) { // Row loop
      var tile = this.mTiles[i][j];
      tile.draw(cam); // Will draw textures if visible, and edges if set to do so
    }
  }
};

// Setting all the edge visualization flags of the tiles to given bool
Grid.prototype.setVisualizeEdges = function(bool) {
  for (var i = 0; i < this.mGridH; i++) { // Col loop
    for (var j = 0; j < this.mGridW; j++) { // Row loop
      var tile = this.mTiles[i][j];
      tile.setGridLineVisibility(bool);
    }
  }
};

// Setting all the edge visualization flags of the tiles to given bool
Grid.prototype.setVisualizeWalls = function(bool) {
  for (var i = 0; i < this.mGridH; i++) { // Col loop
    for (var j = 0; j < this.mGridW; j++) { // Row loop
      var tile = this.mTiles[i][j];
      tile.setWallVisibility(bool);
    }
  }
};

// Get the currently set width of grid tiles in WC
Grid.prototype.getTileWidth = function() {
  return this.mTileW;
};

// Get the currently set height of grid tiles in WC
Grid.prototype.getTileHeight = function() {
  return this.mTileH;
};

// Checks to see if a given WC is contained within the grid object.
Grid.prototype.isWCValidInGrid = function(x, y) {
  // This is a bit ugly, so I'm gonna condense it later.
  // For now, I just wanted to make the math on this easier to read. ✓
  if (x < (this.mGridX - ((this.mGridW / 2) * this.mTileW))) {
      return false;
  } else if (x > (this.mGridX + ((this.mGridW / 2) * this.mTileW))) {
      return false;
  } else if (y < (this.mGridY - ((this.mGridH / 2) * this.mTileH))) {
      return false;
  } else if (y > (this.mGridY + ((this.mGridH / 2) * this.mTileH))) {
      return false;
  }
  return true;
};

// Return the index of the tile at the given world coordinates
// NOTE: This will automatically check if the given coordinate
// is contained within the grid. If it's not, it will return [-1, -1]
Grid.prototype.getTileAtWC = function(x, y) {
    // return -1, -1 if the WC is not in the grid
    if (!this.isWCValidInGrid(x, y)) {
        return [-1, -1];
    } else {
        // subtract the left bound of the grid from x
        x = x - (this.mGridX - ((this.mGridW / 2) * this.mTileW));
        // subtract the bottom bound of the grid form y
        y = y - (this.mGridY - ((this.mGridH / 2) * this.mTileH));
        
        // We need to do some error checking here, just to make sure
        // we don't return an invalid coordinate - cause guess what?
        // There is an exactly 1 (one) pixel wide/tall line where you
        // can get a coordinate larger than is actually contained in the grid. 
        var foundX = Math.min(this.mGridW - 1, Math.floor(x / this.mTileW));
        var foundY = Math.min(this.mGridH - 1, Math.floor(y / this.mTileH));
        
        return vec2.fromValues(foundX, foundY);
    }
};

// Return the tile corresponding to the given index coordinate
Grid.prototype.getTileAtIndex = function(x, y) {
  if (x >= 0 && x <= (this.mGridW - 1) && y >= 0 && y <= (this.mGridH - 1)) {
    return this.mTiles[y][x];
  } else {
    return null;
  }
};

Grid.prototype.getTile = function(pos) {
    if (pos[0] >= 0 && pos[0] <= (this.mGridW - 1) && pos[1] >= 0 && pos[1] <= (this.mGridH - 1)) {
    return this.mTiles[pos[1]][pos[0]];
  } else {
    return null;
  }
};

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

Grid.prototype.addTileWall = function(x, y, direction) {
    if (x > -1 && x < this.mGridW) {
        if (y > -1 && y < this.mGridH) {
            this.mTiles[y][x].addWall(direction);
            return true;
        }
    }
    return false;
};

Grid.prototype.addWallRange = function (x1, y1, x2, y2, direction) {
    var minX, maxX;
    if (x1 < x2) {
        minX = x1;
        maxX = x2;
    } else {
        minX = x2;
        maxX = x2;
    }
    var minY, maxY;
    if (y1 < y2) {
        minY = y1;
        maxY = y2;
    } else {
        minY = y2;
        maxY = y1;
    }
    var oppoDirection = [0 - direction[0], 0 - direction[1]];
    
    for (var i = minY; i <= maxY; i++) {
        for (var j = minX; j <= maxX; j++) {
            this.addTileWall(j, i, direction);
            this.addTileWall(j + direction[0], i + direction[1], oppoDirection);
        }
    }
};

Grid.prototype.removeTileWall = function(x, y, direction) {
    if (x > -1 && x < this.mGridW) {
        if (y > -1 && y < this.mGridH) {
            this.mTiles[y][x].removeWall(direction);
            return true;
        }
    }
    return false;
};

Grid.prototype.removeWallRange = function (x1, y1, x2, y2, direction) {
    var minX, maxX;
    if (x1 < x2) {
        minX = x1;
        maxX = x2;
    } else {
        minX = x2;
        maxX = x2;
    }
    var minY, maxY;
    if (y1 < y2) {
        minY = y1;
        maxY = y2;
    } else {
        minY = y2;
        maxY = y1;
    }
    var oppoDirection = [0 - direction[0], 0 - direction[1]];
    
    for (var i = minY; i <= maxY; i++) {
        for (var j = minX; j <= maxX; j++) {
            this.removeTileWall(j, i, direction);
            this.removeTileWall(j + direction[0], i + direction[1], oppoDirection);
        }
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
};


// Given object MUST have an associated Xform to change its position properly.
// If given impossible object, reject it and immediately return -1.
Grid.prototype.addObjectToGrid = function(obj) {
    // Error chk: Given object must have an Xform to modify position.
    try {
        obj.getXform();
    } catch (error) {
        console.log(error);
        return -1;
    }

    // Add object to mObject array. Put the object in the first available spot.
    var id;
    var added = false;
    for (id = 0; id < this.mObjects.length; id++) {
      if (this.mObjects[id] === null) {
        this.mObjects[id] = obj;
        added = true;
        break;
      }
    }
    // mObjects was not large enough to hold the object; push it to the end.
    if (!added) {
      this.mObjects.push(obj);
      id = this.mObjects.length - 1;
    }

    var pos = obj.getXform().getPosition();
    var tileIndex = this.getTileAtWC(pos[0], pos[1]);
    var tile = null;

    // Invalid init tile position
    if (tileIndex[0] === -1 && tileIndex[1] === -1) {
      var indexX = 0;
      var indexY = 0;

      tile = this.getTileAtIndex(indexX, indexY);

      // Keep looking for a new default tile until we find one that is not occupied.
      while (tile.getCollision()) {
        indexX++;
        tile = this.getTileAtIndex(indexX, indexY);

        // Entire X row searched and no available spots; move up a row.
        if (tile === null) {
          indexX = 0;
          indexY++;
          tile = this.getTileAtIndex(indexX, indexY);
        }

        // NEED TERMINATION CASE IF WE HAVE SEARCHED ALL TILES AND NONE HAVE A SPOT AVAILABLE **********
      }
    } else {
      tile = this.getTileAtIndex(tileIndex[0], tileIndex[1]);
    }
    
    // We now have our tile to tie the object to; Send it to its position & enable collision.
    obj.getXform().setPosition(tile.getXPosWC(), tile.getYPosWC());
    tile.setCollision(true);

    // Could resize object to ensure it fits within tile bounds... Might be up to the game dev
    // to do this though.

    // Addition successful. Return id.
    return id;
};

// Given the id of an object belonging to the grid, removes the object from grid control.
// Note, this does not remove the object from existence, rather just removes its direct
// ties to the grid. 
// Returns true if removal was successful, false otherwise.
// Requires the array to stay at the same size, else ids may no longer return expected objs.
Grid.prototype.removeObjectFromGrid = function(id) {
  if (this.mObjects[id] === null) {
    return false;
  }

  this.mObjects[id] = null;

  return true;
};

// Attempts to move the specified object from its current tile index to a given
// tile index. Returns a bool representing if the move was successful or not.
// Note: This DOES NOT check for anything inbetween the object; Simply checks if
// the desired location can have an object placed there and does so if possible.
// id = int ID corresponding to object to change position
// x & y represent the grid index to move the object to
Grid.prototype.changeObjectPosition = function(id, x, y) {
    var obj = this.mObjects[id];
    if (obj === null || obj === undefined) {
        return false;
    }
    
    var pos = this.getIDPosition(id);
    
    // Tile object is currently in.
    var tile = this.getTileAtIndex(pos[0], pos[1]);
    
    var newTile = this.getTileAtIndex(x, y);
    if (newTile === null || newTile.getCollision()) { //Invalid tile coord given, or has collision already
        return false;
    }
    
    obj.getXform().setPosition(newTile.getXPosWC(), newTile.getYPosWC());
    tile.setCollision(false);
    newTile.setCollision(true);
    
    return true;
};

// Moves the object specified by the given ID one space in the given direction.
// Returns true if move was successful, false otherwise.

// A bit redundant w/ above function at the moment, should probably rework a bit.
Grid.prototype.moveObjectPositionDir = function(id, direction) {
    var obj = this.mObjects[id];
    if (obj === null || obj === undefined) {
        return false;
    }
    
    var pos = this.getIDPosition(id);
    
    // Tile object is currently in.
    var tile = this.getTileAtIndex(pos[0], pos[1]);
    
    // Wall check
    var walls = tile.getWalls();
    for (var i = 0; i < walls.length; i++) {
        if (direction[0] === walls[i][0] && direction[1] === walls[i][1]) { // Given direction has a wall, prevent movement.
            return false;
        }
    }
    
    var newTile = this.getTileAtIndex(pos[0] + direction[0], pos[1] + direction[1]);
    if (newTile === null || newTile.getCollision()) { //Invalid tile coord given, or has collision already
        return false;
    }
    
    obj.getXform().setPosition(newTile.getXPosWC(), newTile.getYPosWC());
    tile.setCollision(false);
    newTile.setCollision(true);
    
    return true;
};

// Returns the position of the specified object in Grid coordinates.
// Returns [-1, -1] if the given ID is invalid.
Grid.prototype.getIDPosition = function(id) {
    if (this.mObjects[id] === null) {
      return [-1, -1];
    }

    var pos = this.mObjects[id].getXform().getPosition();

    // Object already exists within Grid, so we can assume this will be a valid tile.
    return this.getTileAtWC(pos[0], pos[1]);
};


Grid.prototype.AStarSearch = function(start, finish) {
    
    // before anything, check and make sure that these are valid
    // positions. return empty if not.
    if (start[0] < 0 || start[1] < 0 || start[0] >= this.mGridW || start[1] >= this.mGridH) {
        return [];
    }
    
    if (finish[0] < 0 || finish[1] < 0 || finish[0] >= this.mGridW || finish[1] >= this.mGridH) {
        return [];
    }
    
    // clear any data from previous searches
    this.readySearch();
    
    // initialize search
    var openList = [];
    var visitedList = [];
    openList.push(start);
    
    while (openList.length > 0) {
        // find the tile in our list with the lowest combined
        // cost and heuristic score (we get this with getF())
        var bestIndex = 0;
        for (var i = 0; i < openList.length; i++) {
            var tempTile = this.getTile(openList[bestIndex]);
            var tempTile2 = this.getTile(openList[i]);
            // find the lowest f score (f = cost + heuristic)
            if (tempTile.getF() > tempTile2.getF()) {
                bestIndex = i;
            }
        }
        // currentPos - cPos. Is a vec2 of a position in grid
        var cPos = openList[bestIndex];
        
        // if we've reached the end case, return the path found
        if (cPos[0] === finish[0] && cPos[1] === finish[1]) {
            // get the direction from the parent
            var curr = cPos;
            var ret = [];
            var totalMoves = this.getTile(cPos).getC();
            for (var i = 0; i < totalMoves; i++) {
                var dir = this.getTile(curr).getD();
                // push the direction from the tile
                ret.push(dir);
                // and move to the tiles parent
                curr = [curr[0] - dir[0], curr[1] - dir[1]];
            }
            // return the retrieved directions in reverse order
            return ret.reverse();
        }
        
        // remove currentTile from openList, and add to visited
        cPos = openList.splice(bestIndex, 1)[0];
        visitedList.push(cPos);
        var neighbors = this.getNeighbors(cPos);
        
        // now, go through all possible successors of current tile
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor =  neighbors[i];
            var nTile = this.getTile(neighbor);
            
            // don't bother examining if we haven't visited already
            var visitedAlready = false;
            for (var k = 0; k < visitedList.length; k++) {
                var temp = visitedList[k];
                if (neighbor[0] === temp[0] && neighbor[1] === temp[1]) {
                    visitedAlready = true;
                }
            }
            
            // if we haven't visited it before
            if (!visitedAlready) {
                var cScore = this.getTile(cPos).getC() + 1;
                var cScoreIsBest = false;
                var found = false;
                // determine if we've seen this node before
                for (var k = 0; k < openList.length; k++) {
                    var temp = openList[k];
                    if (neighbor[0] === temp[0] && neighbor[1] === temp[1]) {
                        found = true;
                    }
                }
                // if we have not seen this tile, add it to the openList
                if (!found) {
                    cScoreIsBest = true;
                    nTile.setH(this.manhattanDistance(neighbor, finish));
                    openList.push(neighbor);
                }
                else if (cScore < nTile.getC()) {
                    // we've seen the node, but we have a better score
                    cScoreIsBest = true;
                }

                if (cScoreIsBest) {
                    // found an optimal path to the tile
                    nTile.setC(cScore);

                    // so, every tile stores the direction to it from the
                    // predecessor. so, grab the direction we took from
                    // the current tile.
                    nTile.setD([neighbor[0] - cPos[0], neighbor[1] - cPos[1]]);
                }
            }
        }
    }
    
    // if we've reached here, that means no path has been
    // found. return an empty array.
    return [];
};

// helper function for A*
// just meant to reset data from any previous searches
Grid.prototype.readySearch = function() {
    for (var x = 0; x < this.mGridW; x++) {
        for (var y = 0; y < this.mGridH; y++) {
            this.mTiles[y][x].readySearch();
        }
    }
};

// manhattan distance heuristic for A* search
Grid.prototype.manhattanDistance = function(pos1, pos2) {
    return Math.abs(pos2[0] - pos1[0]) + Math.abs(pos2[1] - pos1[1]);
};

Grid.prototype.getNeighbors = function(curr) {
    var ret = [];
    var cTile = this.getTile(curr);
    var moves = cTile.getMoves();
    for (var i = 0; i < moves.length; i++) {
        var temp = vec2.fromValues(curr[0] + moves[i][0], curr[1] + moves[i][1]);
        ret.push(temp);
    }
    return ret;
};