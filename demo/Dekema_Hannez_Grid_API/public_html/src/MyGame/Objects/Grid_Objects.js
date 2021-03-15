/*
 * Manages the object interactions explicitly given to the grid object. Defines object
 * behaviors such as movement, pathfinding, etc. Does not define interactions for objs 
 * not explicitly given to the Grid to manage.
 * 
 * 
 */

/*global gEngine: false, Grid: false, Tile: false, vec2: false, vec3: false, GameObject: false, SpriteRenderable: false ShakePosition: false */

// Adds an object to the grid. Movement & position of this object now belong to
// the grid object, and are manipulated through it.
// Returns the int ID that can be used to access that object in the Grid system.
/*
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

// A* Search
Grid.prototype.getPathTo = function(x1, y1, x2, y2) {
    var currentPos = vec2.fromValues(x1, y1);
    var goalPos = vec2.fromValues(x2, y2);
    var currentPath = []; // holds directions
    var currentCost = 0;
    
    // now a bunch of arrays
    var visitedTiles = [];  // format: [x, y, cost]
    var fringe = [];    // format: [x, y, cost]
    var fringePath = [];    // holds arrays of paths
    
    if (x1 === x2 && y1 === y2) {
        currentPath.push(vec2.fromValues[0, 0]);
        return currentPath;
    }
    
    // add the starting tile to our visited array
    visitedTiles.append(vec3.fromValues(currentPos[0], currentPos[1], currentCost));
    while (currentPos[0] !== goalPos[0] && currentPos[1] !== goalPos[1]) {
        
        // to start: get all successors from this tile
        
        // now, for every successor, evaluate if we've seen it before
            var haveVisited = false;    // assume we haven't seen this node before
            var hCost = manhattanDistance(currentPos, goalPos);
        
        
        
        
        // note: if we reach here and the fringe is empty: break,
        // as there exists no path between the two positions.
        
        // now, find the lowest costing tile on the fringe
        // and update our position
    }
};

Grid.prototype.AStarSearch = function(start, finish) {
    // clear any data from previous searches
    readySearch();
    
    var openList = [];
    var visitedList = [];
    openList.push(start);
    
    while (openList.length > 0) {
        
        // find the tile in our list with the lowest combined
        // cost and heuristic score (we get this with getF())
        var bestIndex = 0;
        for (var i = 0; i < openList.length; i++) {
            var tempTile = this.getTileAtIndex(openList[bestIndex]);
            var tempTile2 = this.getTileAtIndex(openList[i]);
            // find the lowest f score (f = cost + heuristic)
            if (tempTile.getF() > tempTile2.getF()) {
                bestIndex = i;
            }
        }
        // currentPos - cPos. Is a vec2 of a position in grid
        var cPos = openList[bestIndex];
        
        // if we've reached the end case, return the path found
        if (cPos === finish) {
            // get the direction from the parent
            var curr = cPos;
            var ret = [];
            while (this.getTileAtIndex(curr).hasP()) {
                // push the direction from the tile
                ret.push(this.getTileAtIndex(curr).getD());
                // and move to the tiles parent
                curr = this.getTileAtIndex(curr).getP();
            }
            // return the retrieved directions in reverse order
            return ret.reverse();
        }
        
        // remove currentTile from openList, and add to visited
        openList.splice(bestIndex, 1);
        visitedList.push(cPos);
        var neighbors = getNeighbors(cPos);
        
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor =  neighbors[i];
            var nTile = this.getTileAtIndex(neighbor);
            if (visitedList.indexOf(neighbor) > -1) {
                continue;
            }
            
            var cScore = this.getTileAtIndex(cPos).getC() + 1;
            var cScoreIsBest = false;
            
            // we haven't seen this node before
            if (openList.indexOf(neighbor) === -1) {
                cScoreIsBest = true;
                nTile.setH(manhattanDistance(neighbor, finish));
                openList.push(neighbor);
            }
            else if (cScore < nTile.getC()) {
                // we've seen the node, but we have a better score
                cScoreIsBest = true;
            }
            
            if (cScoreIsBest) {
                // found an optimal path to the tile
                nTile.setP(cPos);
                nTile.setC(cScore);
                
                // so, every tile stores the direction to it from the
                // predecessor. so, grab the direction we took from
                // the current tile.
                nTile.setD(this.getTileAtIndex(cPos).getMoves()[i]);
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
            this.mTiles[x][y].readySearch();
        }
    }
};

// manhattan distance heuristic for A* search
Grid.prototype.manhattanDistance = function(pos1, pos2) {
    return Math.abs(pos2[0] - pos1[0]) + Math.abs(pos2[1] - pos1[1]);
};

Grid.prototype.getNeighbors = function(curr) {
    var ret = [];
    var cTile = this.getTileAtIndex(curr);
    var moves = cTile.getMoves();
    for (var i = 0; i < moves.length; i++) {
        var temp = vec2.fromValues(curr[0] + moves[i][0], curr[1] + moves[i][1]);
        ret.push(temp);
    }
    return ret;
}; */