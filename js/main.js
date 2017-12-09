/*
 MAZE-A-TRON
 Written by Richard Stanton , Computer Science M.S. student at University of Missouri - St. Louis
 For CS 5130 - Professor Badri Adhikari
 Fall Semester 2017
 */

var menu_width = 300;
var maze_columns = 20;
var maze_rows = maze_columns;

var gameState = "inactive";
//Build data structures to hold wall information
var vWall = [];
var hWall = [];
var leadCell;
var startCell;
var endCell;
var pathSet = [];
var shortestPath;
var solutionSet = [];
var difficulty;
var solutionInterval;

var browser_height = window.innerHeight;
var browser_width = window.innerWidth;
displayWindowSize();


function startGame(diff){
    difficulty = diff;

    removeWelcomeContainer();
    initGame();

    switch (diff){
        case 'easy':
            maze_columns = 12;
            document.getElementById("current_game_display").innerHTML = "Easy - 12x12";
            break;
        case 'normal':
            maze_columns = 25;
            document.getElementById("current_game_display").innerHTML = "Normal - 25x25";
            break;
        case 'hard':
            maze_columns = 45;
            document.getElementById("current_game_display").innerHTML = "Hard - 45x45";
            break;
    }
    maze_rows = maze_columns;
    buildMaze();
}

function initGame() {
    gameState = "active";
    //Build data structures to hold wall information
    vWall = [];
    hWall = [];
    leadCell = null;
    startCell = null;
    endCell = null;
    pathSet = [];
    shortestPath = 0;
    document.getElementById("current_game_section").style.display = "";
    var mazeTableElem = document.getElementById("maze_table");
    if (mazeTableElem){
        document.getElementById("maze_area").removeChild(mazeTableElem);
    }
    // re-init shortest path display
    document.getElementById("shortest_path_display").innerHTML = 0;
    document.getElementById("shortestPathLength").style.display = "none";
    // document.getElementById("showSolutionButton").style.display = "none";  // Uncomment this for final release
}


function displayWindowSize(){
    document.getElementById("left_control_area").style.height = (window.innerHeight - 20) + "px";
}


function buildMaze(){
    buildMazeTable();
    var junctionPartArray;
    var randomIndex;
    var junctionX;
    var junctionY;
    var randomDirection;

    // data structure to hold available junctions
    var openJunctionArray = [];

    // Build data structure to hold the junctions of the maze
    var mazeJunctionArray = [];
    for (var i = 1; i < maze_columns; i++){
        mazeJunctionArray[i] = new Array(maze_rows);
        for (var j = 1; j < maze_rows; j++){
            openJunctionArray.push(i + ":" + j);
        }
    }

    // Initialize wall data
    for (var i = 0; i < maze_columns; i++) {
        vWall[i] = new Array(maze_columns);
        for (var j = 0; j < maze_columns; j++){
            vWall[i][j] = false;
        }
        hWall[i] = new Array(maze_rows);
        for (var j = 0; j < maze_rows; j++){
            hWall[i][j] = false;
        }
    }

    // Algorithm to build maze
    while (openJunctionArray.length > 0){
        randomIndex = Math.floor(Math.random() * openJunctionArray.length);
        junctionPartArray = openJunctionArray[randomIndex].split(":");
        junctionX = Number(junctionPartArray[0]);
        junctionY = Number(junctionPartArray[1]);

        // Find available directions to build a wall
        var openDirectionArray = [];
        if (vWall[junctionX - 1][junctionY] != true) {
            openDirectionArray.push("up");
        }
        if (vWall[junctionX][junctionY] != true) {
            openDirectionArray.push("down");
        }
        if (hWall[junctionX][junctionY - 1] != true) {
            openDirectionArray.push("left");
        }
        if (hWall[junctionX][junctionY] != true) {
            openDirectionArray.push("right");
        }

        if(openDirectionArray.length > 0){
            randomDirection = openDirectionArray[Math.floor(Math.random() * openDirectionArray.length)];

            switch (randomDirection){
                // Draw wall upward
                case "up":
                    vWall[junctionX - 1][junctionY] = true;
                    document.getElementById("maze_cell_" + junctionX + "_" + junctionY).className += " cell_wall_right";
                    break;
                // Draw wall downward
                case "down":
                    vWall[junctionX][junctionY] = true;
                    document.getElementById("maze_cell_" + (junctionX + 1) + "_" + junctionY).className += " cell_wall_right";
                    break;
                // Draw wall left-ward
                case "left":
                    hWall[junctionX][junctionY - 1] = true;
                    document.getElementById("maze_cell_" + junctionX + "_" + junctionY).className += " cell_wall_bottom";
                    break;
                // Draw wall right-ward
                case "right":
                    hWall[junctionX][junctionY] = true;
                    document.getElementById("maze_cell_" + junctionX + "_" + (junctionY + 1)).className += " cell_wall_bottom";
                    break;
            }
        }

        mazeJunctionArray[junctionX][junctionY] = true;
        openJunctionArray.splice(randomIndex, 1);
    }

    // Build Start Square
    var randomSide = Math.floor(Math.random() * 4);
    var randomSquare;
    switch (randomSide){
        // Top side
        case 0:
            randomSquare = Math.floor(Math.random() * maze_columns) + 1;
            startCell = document.getElementById("maze_cell_1_" + randomSquare);
            startCell.className = startCell.className.replace("cell_wall_top", "");
            break;
        // Bottom side
        case 1:
            randomSquare = Math.floor(Math.random() * maze_columns)  + 1;
            startCell = document.getElementById("maze_cell_" + maze_rows + "_" + randomSquare);
            startCell.className = startCell.className.replace("cell_wall_bottom", "");
            break;
        // Left side
        case 2:
            randomSquare = Math.floor(Math.random() * maze_rows) + 1;
            startCell = document.getElementById("maze_cell_" + randomSquare + "_" + 1);
            startCell.className = startCell.className.replace("cell_wall_left", "");
            break;
        // Right side
        case 3:
            randomSquare = Math.floor(Math.random() * maze_rows) + 1;
            startCell = document.getElementById("maze_cell_" + randomSquare + "_" + maze_columns);
            startCell.className = startCell.className.replace("cell_wall_right", "");
            break;
    }

    // build end square
    var solutionGraph = BFS(startCell); // build origin graph with no solutions, just distances
    var furthestCell = getFarthestBorderSquare(solutionGraph);
    endCell = document.getElementById("maze_cell_" + furthestCell.row + "_" + furthestCell.col);
    if(furthestCell.col == 1){
        endCell.className = endCell.className.replace("cell_wall_left", "");
    }
    else if(furthestCell.col == maze_columns){
        endCell.className = endCell.className.replace("cell_wall_right", "");
    }
    else if (furthestCell.row == 1){
        endCell.className = endCell.className.replace("cell_wall_top", "");
    }
    else if(furthestCell.row == maze_rows){
        endCell.className = endCell.className.replace("cell_wall_bottom", "");
    }

    setStartCell();
    setEndCell();
    leadCell = startCell;
    pathSet.push(leadCell);
    solutionGraph = BFS(startCell); // rebuild with an exit
    buildSolutionSet(solutionGraph, endCell);

    statusUpdate();
}


function getFarthestBorderSquare(solutionGraph){
    var furthestCell = solutionGraph[1][1];

    for (var i = 1; i <= maze_columns; i++){
        if (solutionGraph[1][i].distance > furthestCell.distance){
            furthestCell = solutionGraph[1][i];
        }
        if (solutionGraph[maze_rows][i].distance > furthestCell.distance){
            furthestCell = solutionGraph[maze_columns][i];
        }
        if (solutionGraph[i][1].distance > furthestCell.distance){
            furthestCell = solutionGraph[i][1];
        }
        if (solutionGraph[i][maze_columns].distance > furthestCell.distance){
            furthestCell = solutionGraph[i][maze_rows];
        }
    }

    return furthestCell;
}


function buildMazeTable(){
    //Ideally Maze is constructed dynamically, to allow different rows and columns
    var maze_table = document.createElement("table");
    var maze_row;
    var maze_cell;

    maze_table.id = "maze_table";
    for(y = 1; y <= maze_rows; y++){
        maze_row = document.createElement("tr");
        maze_row.id = "maze_row_" + y;
        for(x = 1; x <= maze_columns; x++){
            maze_cell = document.createElement("td");
            maze_cell.id = "maze_cell_" + y + "_" + x;
            maze_cell.className = "maze_cell";
            maze_cell.style.verticalAlign = "center";
            // Build outer borders
            if(y == 1) maze_cell.className += " cell_wall_top";
            if(y == maze_columns) maze_cell.className += " cell_wall_bottom";
            if(x == 1) maze_cell.className += " cell_wall_left";
            if(x == maze_rows) maze_cell.className += " cell_wall_right";
            // Add mouseEnter handler
            maze_cell.addEventListener("mouseenter", function() {
                alterPath(this);
            });

            maze_row.appendChild(maze_cell);
        }
        maze_table.appendChild(maze_row);
    }

    document.getElementById("maze_area").appendChild(maze_table);
    myResize();
}


function calcMazeCellSize(){
    var smallest_dimension;
    // Calculates the maze cell size based on available space
    // Right now it's limited by even number of rows and columns (square maze)
    var maze_table_height = window.innerHeight - 20; // 20 is padding
    var maze_table_width = window.innerWidth - menu_width - 30 - 20;
    if(maze_table_height > maze_table_width){
        smallest_dimension = maze_table_width;
    } else {
        smallest_dimension = maze_table_height;
    }
    var maze_cell_size = Math.floor(smallest_dimension / maze_rows);

    return maze_cell_size;
}



function myResize(){
    browser_height = window.innerHeight;
    browser_width = window.innerWidth;

    // Resize the maze to fill up as much as possible
    var maze_cell_size = calcMazeCellSize() + "px";
    var maze_cell_fontSize = Math.ceil(calcMazeCellSize() * .6) + "px";
    if (document.getElementById("maze_table")){
        for(y = 1; y <= maze_rows; y++){
            for(x = 1; x <= maze_columns; x++){
                var maze_cell = document.getElementById("maze_cell_" + y + "_" + x);
                maze_cell.style.width = maze_cell_size;
                maze_cell.style.height = maze_cell_size;
                maze_cell.style.fontSize = maze_cell_fontSize;
            }
        }
    }
    displayWindowSize();
}


function alterPath(cell){
    var cellStrArray;
    var cellX;
    var cellY;
    var leadCellStrArray;
    var leadCellX;
    var leadCellY;
    var isOpenAdjacent = false;
    var cellInPath;

    // Don't change path if the game is over
    if(gameState != "active") return;

    // We are at the lead, do nothing
    if (leadCell == cell) return;

    // Extract coordinates from cell
    cellStrArray = cell.id.split("_");
    cellX = Number(cellStrArray[2]);
    cellY = Number(cellStrArray[3]);
    leadCellStrArray = leadCell.id.split("_");
    leadCellX = Number(leadCellStrArray[2]);
    leadCellY = Number(leadCellStrArray[3]);

    // Is this an adjacent cell to the lead
    if (cellX == leadCellX){
        // check to see if they can move to the left
        if( cellY == (leadCellY + 1) && vWall[cellX - 1][cellY - 1] == false){
            isOpenAdjacent = true;
        }
        // check to see if they can move to the right
        else if (cellY == (leadCellY - 1) && vWall[cellX - 1][cellY] == false) {
            isOpenAdjacent = true;
        }
    }
    if (cellY == leadCellY){
        // check to see if they can move down
        if( cellX == (leadCellX - 1) && hWall[cellX][cellY - 1] == false){
            isOpenAdjacent = true;
        }
        // check to see if they can move up
        else if (cellX == (leadCellX + 1) && hWall[cellX - 1][cellY - 1] == false) {
            isOpenAdjacent = true;
        }
    }

    if (isOpenAdjacent == false) return;

    // Check to see if it was a previously chosen path, if so undo it.
    cellInPath = pathSet.indexOf(cell);
    // If the current cell is the one before the head, then we are going back
    if (cellInPath != -1 && cellInPath == pathSet.length - 2) {
        leadCell.className = leadCell.className.replace("lead_cell", "");
        cell.className = cell.className.replace("path_cell ", "");
        pathSet.pop(); // The one we are erasing
        pathSet.pop(); // The previous cell, which will be pushed back on as the new leadCell
    }
    // If the current cell is way back on the list (even 1st cell), then we are coming back on a loop and we need to pop off until we get back there.
    else if (cellInPath >= 0) {
        // Deal with the head first
        leadCell.className = leadCell.className.replace("lead_cell", "");
        // Now remove the unnecessary loop
        var popCell;
        var currentPathLength = pathSet.length;
        for(i = 0; i < currentPathLength - cellInPath; i++){
            popCell = pathSet.pop();
            popCell.className = popCell.className.replace("path_cell ", "");
        }
    }
    else {
        leadCell.className = leadCell.className.replace("lead_cell", "path_cell ");
    }

    // Change the lead cell
    leadCell = cell;
    leadCell.className += " lead_cell";
    pathSet.push(leadCell);
    statusUpdate();

    // End game scenario
    if(leadCell == endCell) {
        leadCell.className = leadCell.className.replace("end_cell", "");
        gameState = "finished";
        showEndModal();
        return;
    }
}


function statusUpdate(){
    document.getElementById("path_distance").innerHTML = pathSet.length;
}


function buildSolutionSet(solutionGraph, endCell){
    var endCellStrArray = endCell.id.split("_");
    var endCellRow = Number(endCellStrArray[2]);
    var endCellCol = Number(endCellStrArray[3]);
    var endCellGraph = solutionGraph[endCellRow][endCellCol];
    shortestPath = endCellGraph.distance;
    solutionSet = solutionGraph;

    document.getElementById("shortest_path_distance").innerHTML = shortestPath;
    document.getElementById("shortest_path_display").innerHTML = shortestPath;
}


function BFS(startCell){
    var graphSet = initGraphSet(startCell);
    // Extract coordinates from cell
    var cellStrArray = startCell.id.split("_");
    var cellRow = Number(cellStrArray[2]);
    var cellCol = Number(cellStrArray[3]);
    var queue = [];
    queue.push(graphSet[cellRow][cellCol]);

    while (queue.length > 0){
        queue = buildSolutionPath(queue, graphSet);
    }

    return graphSet;
}


function showEndModal(){

    if (pathSet.length == shortestPath){
        document.getElementById("path_distance2").innerHTML = pathSet.length;
        $('#successModal').modal('show');
        showOptimalPath();
        showSolutionPathCount(solutionSet);
    }
    else {
        document.getElementById("path_distance3").innerHTML = pathSet.length;
        $('#failModal').modal('show');
    }

    document.getElementById("shortestPathLength").style.display = "";
    document.getElementById('showSolutionButton').style.display = "";
}


function showHelpModal(){
    $('#helpModal').modal('show');
}


function retryHandler(showSolution){
    // Clear all cells
    var maze_cell;
    for(y = 1; y <= maze_rows; y++) {
        for (x = 1; x <= maze_columns; x++) {
            maze_cell = document.getElementById("maze_cell_" + y + "_" + x);
            maze_cell.className = maze_cell.className.replace("lead_cell", "");
            maze_cell.className = maze_cell.className.replace("path_cell ", "");
            maze_cell.className = maze_cell.className.replace("path_cell_optimal_shared", "");
            maze_cell.className = maze_cell.className.replace("path_cell_optimal_only", "");
            maze_cell.className = maze_cell.className.replace("solution_path_head", "");
            maze_cell.className = maze_cell.className.replace("solution_path_dead", "");
            maze_cell.innerHTML = "";
        }
    }

    setStartCell();
    setEndCell();
    leadCell = startCell;

    pathSet = []; // clear the pathSet
    pathSet.push(leadCell);

    if (!showSolution){
        statusUpdate();
    }

    gameState = "active";
}


function showOptimalPath(){
    // Extract coordinates from endCell
    var shortestCellDOM;
    var v;

    // Display the shortest path
    startCell.className = startCell.className.replace("path_cell ", "");
    startCell.className += " path_cell_optimal_shared";

    // Loop through entire set
    for (var i = 1; i <= maze_columns; i++){
        for (var j = 1; j <= maze_rows; j++){
            v = solutionSet[i][j];
            if (v.color == "DARK GRAY"){
                shortestCellDOM = document.getElementById("maze_cell_" + v.row + "_" + v.col);
                if (shortestCellDOM.className.indexOf("path_cell ") > -1){
                    shortestCellDOM.className = shortestCellDOM.className.replace("path_cell ", "");
                    shortestCellDOM.className += " path_cell_optimal_shared";
                }
                else {
                    shortestCellDOM.className += " path_cell_optimal_only";
                }
            }
        }
    }

    leadCell.className = leadCell.className.replace("path_cell_optimal_only", "");
    leadCell.className = leadCell.className.replace("lead_cell", "lead_cell_optimal");

    // Display steps for longer path
    for (var i = 1; i < (pathSet.length - 1); i++){
        var pathCellDOM = pathSet[i];
        if (pathCellDOM.className.indexOf("path_cell ") > -1){
            pathCellDOM.innerHTML = i + 1;
        }
    }

    showSolutionPathCount(solutionSet);
}


function getAncestorDistance(v, solutionSet, distance){
    if (v.parent == null) {return 0;}
    if (!distance) distance = 0;

    var parentCell = v.parent;
    var parentCellDOM = document.getElementById("maze_cell_" + parentCell.row + "_" + parentCell.col);
    var ancestorList = getListOfAncestors(v, solutionSet);
    var ancestorCell;
    var ancestorCellDOM;

    // check if any ancestor is a shared path or part of the user's solution, if so then it is baseline
    for (var i = 0; i < ancestorList.length; i++) {
        ancestorCell = ancestorList[i];
        ancestorCellDOM = document.getElementById("maze_cell_" + ancestorCell.row + "_" + ancestorCell.col);
        if(ancestorCellDOM.className.indexOf("path_cell ") > -1 || ancestorCellDOM.className.indexOf("path_cell_optimal_shared") > -1){
            return 0;
        }
    }

    distance = 1 + getAncestorDistance(parentCell, solutionSet, distance);
    parentCellDOM.innerHTML = distance;

    return distance;
}


function setStartCell(){
    startCell.innerHTML = "&#127968;"; // house
    startCell.className = startCell.className.replace("start_cell", ""); // removes it if it already exists
    startCell.className += " start_cell lead_cell";
}


function setEndCell(){
    endCell.innerHTML = "&#127937;"; //checkered flag
    endCell.className = endCell.className.replace("end_cell", ""); // removes it if it already exists
    endCell.className += " end_cell";
}


function showSolutionHandler(){
    // avoid reclicks
    if (gameState == "showSolution") {
        gameState = "inactive"; // This inactive state will clear the solutionInterval
        setTimeout(showSolutionHandler, 100); // wait and start again after past interval has been cleared
        return;
    }
    document.getElementById("shortestPathLength").style.display = "";
    retryHandler(true);
    gameState = "showSolution";
    startCell.className = startCell.className.replace("lead_cell", "");

    var graphSet = initGraphSet(startCell);
    // Extract coordinates from cell
    var cellStrArray = startCell.id.split("_");
    var cellRow = Number(cellStrArray[2]);
    var cellCol = Number(cellStrArray[3]);
    var queue = [];
    queue.push(graphSet[cellRow][cellCol]);

    solutionInterval = setInterval(function(){ queue = buildSolutionPathForDisplay(queue, graphSet) }, getSolutionDisplayInterval());

    return graphSet;
}


function initGraphSet(startCell){
    var graphSet = [];

    // initialize all the vertices
    for (var i = 1; i <= maze_columns; i++){
        graphSet[i] = new Array(maze_rows);
        for (var j = 1; j <= maze_rows; j++){
            graphSet[i][j] = {row:i, col:j, color:"WHITE", distance:Number.MAX_VALUE, parent:null};
        }
    }

    // Extract coordinates from cell
    var cellStrArray = startCell.id.split("_");
    var cellRow = Number(cellStrArray[2]);
    var cellCol = Number(cellStrArray[3]);

    graphSet[cellRow][cellCol].color = "GRAY";
    graphSet[cellRow][cellCol].distance = 1; // We include the first block as part of the solution path

    return graphSet;
}


function buildSolutionPathForDisplay(queue, graphSet){
    if (gameState != "showSolution") {
        clearInterval(solutionInterval);
        return;
    }
    if (queue && queue.length > 0){
        queue = buildSolutionPath(queue, graphSet);
        showSolutionGraph(graphSet);
    }
    else {
        gameState = "inactive";
        clearInterval(solutionInterval);
    }

    return queue;
}


function buildSolutionPath(queue, graphSet){
    var u = queue.shift();
    var v;
    var isDeadEnd = true;
    var bordersEndCell = false;

    // Can we move up? Check up (row - 1)
    if(u.row - 1 > 0 && hWall[u.row - 1][u.col - 1] == false){
        v = graphSet[u.row - 1][u.col];
        if (v.color == "WHITE"){
            v.color = "GRAY"
            v.distance = u.distance + 1;
            v.parent = u;
            queue.push(v);
            isDeadEnd = false;
        }
        else {
            if(v.color != "BLACK" && u.distance + 1 == v.distance) isDeadEnd = false;
            if(document.getElementById("maze_cell_" + v.row + "_" + v.col) == endCell && v.distance == u.distance + 1) {
                bordersEndCell = true;
            }
        }

    }

    // Can we move down? Check down (row + 1)
    if(u.row + 1 <= maze_rows && hWall[u.row][u.col - 1] == false){
        v = graphSet[u.row + 1][u.col];
        if (v.color == "WHITE"){
            v.color = "GRAY"
            v.distance = u.distance + 1;
            v.parent = u;
            queue.push(v);
            isDeadEnd = false;
        }
        else {
            if(v.color != "BLACK" && u.distance + 1 == v.distance) isDeadEnd = false;
            if(document.getElementById("maze_cell_" + v.row + "_" + v.col) == endCell && v.distance == u.distance + 1) {
                bordersEndCell = true;
            }
        }
    }

    // Can we move left? Check left (col - 1)
    if(u.col - 1 > 0 && vWall[u.row - 1][u.col - 1] == false){
        v = graphSet[u.row][u.col - 1];
        if (v.color == "WHITE"){
            v.color = "GRAY"
            v.distance = u.distance + 1;
            v.parent = u;
            queue.push(v);
            isDeadEnd = false;
        }
        else {
            if(v.color != "BLACK" && u.distance + 1 == v.distance) isDeadEnd = false;
            if(document.getElementById("maze_cell_" + v.row + "_" + v.col) == endCell && v.distance == u.distance + 1) {
                bordersEndCell = true;
            }
        }
    }

    // Can we move right? Check right (col - 1)
    if(u.col + 1 <= maze_columns && vWall[u.row - 1][u.col] == false){
        v = graphSet[u.row][u.col + 1];
        if (v.color == "WHITE"){
            v.color = "GRAY"
            v.distance = u.distance + 1;
            v.parent = u;
            queue.push(v);
            isDeadEnd = false;
        }
        else {
            if(v.color != "BLACK" && u.distance + 1 == v.distance) isDeadEnd = false;
            if(document.getElementById("maze_cell_" + v.row + "_" + v.col) == endCell && v.distance == u.distance + 1) {
                bordersEndCell = true;
            }
        }
    }

    var cellDOM = document.getElementById("maze_cell_" + u.row + "_" + u.col);
    if (isDeadEnd && cellDOM != endCell && !(bordersEndCell)){
        u.color = "BLACK";
        showAncestorDeadEnd(u, graphSet);
    } else {
        u.color = "DARK GRAY";
    }

    return queue;
}


function showSolutionGraph(graphSet){
    var cellDOM;
    var v;

    // Loop through entire set, clear the tile then add new class
    for (var i = 1; i <= maze_columns; i++){
        for (var j = 1; j <= maze_rows; j++){
            v = graphSet[i][j];
            cellDOM = document.getElementById("maze_cell_" + v.row + "_" + v.col);
            // clear the solution classes
            cellDOM.className = cellDOM.className.replace("solution_path_head", "");
            cellDOM.className = cellDOM.className.replace("solution_path_dead", "");
            cellDOM.className = cellDOM.className.replace("path_cell_optimal_only", "");
            if (v.color == "GRAY"){
                cellDOM.className += " solution_path_head";
                if (cellDOM != startCell && cellDOM!= endCell){
                    cellDOM.innerHTML = v.distance;
                }
            } else if(v.color == "DARK GRAY"){
                cellDOM.className += " path_cell_optimal_only";
            } else if(v.color == "BLACK"){
                cellDOM.className += " solution_path_dead";
            }
        }
    }
}


function showSolutionPathCount(graphSet){
    var cellDOM;
    var v;

    // Loop through entire set, clear the tile then add new class
    for (var i = 1; i <= maze_columns; i++){
        for (var j = 1; j <= maze_rows; j++){
            v = graphSet[i][j];
            cellDOM = document.getElementById("maze_cell_" + v.row + "_" + v.col);
            // clear the solution classes
            if (v.color == "DARK GRAY"){
                if (cellDOM != startCell && cellDOM!= endCell){
                    cellDOM.innerHTML = v.distance;
                }
            }
        }
    }
}


function removeWelcomeContainer(){
    var welcomeElem = document.getElementById("welcomeContainer");
    if (welcomeElem){
        document.getElementById("maze_area").removeChild(welcomeElem);
    }
}


function getSolutionDisplayInterval(){
    var interval = 100;
    if (difficulty == "normal"){
        interval = 50;
    }
    else if (difficulty == "hard"){
        interval = 20;
    }
    return interval;
}


function isAncestorCellDead(ancestorCell, graphSet){
    var ancestorCellDOM = document.getElementById("maze_cell_" + ancestorCell.row + "_" + ancestorCell.col);
    if(ancestorCellDOM == startCell || ancestorCellDOM == endCell){return false};

    var v;
    var hasPath = false;

    // Can we move up? Check up (row - 1)
    if(ancestorCell.row - 1 > 0 && hWall[ancestorCell.row - 1][ancestorCell.col - 1] == false){
        v = graphSet[ancestorCell.row - 1][ancestorCell.col];
        if (v.color != "BLACK" && v.distance == ancestorCell.distance + 1){
            hasPath = true;
        }
    }

    // Can we move down? Check down (row + 1)
    if(ancestorCell.row + 1 <= maze_rows && hWall[ancestorCell.row][ancestorCell.col - 1] == false){
        v = graphSet[ancestorCell.row + 1][ancestorCell.col];
        if (v.color != "BLACK" && v.distance == ancestorCell.distance + 1){
            hasPath = true;
        }
    }

    // Can we move left? Check left (col - 1)
    if(ancestorCell.col - 1 > 0 && vWall[ancestorCell.row - 1][ancestorCell.col - 1] == false){
        v = graphSet[ancestorCell.row][ancestorCell.col - 1];
        if (v.color != "BLACK" && v.distance == ancestorCell.distance + 1){
            hasPath = true;
        }
    }

    // Can we move right? Check right (col - 1)
    if(ancestorCell.col + 1 <= maze_columns && vWall[ancestorCell.row - 1][ancestorCell.col] == false){
        v = graphSet[ancestorCell.row][ancestorCell.col + 1];
        if (v.color != "BLACK" && v.distance == ancestorCell.distance + 1){
            hasPath = true;
        }
    }

    if(hasPath){
        return false;
    }

    return true;
}


function showAncestorDeadEnd(u, graphSet){
    var ancestorList = getListOfAncestors(u, graphSet);
    var ancestorCell;

    // check if they are dead
    // if they are dead, recursively showAncestorDeadEnd on the new cell
    for (var i = 0; i < ancestorList.length; i++) {
        ancestorCell = ancestorList[i];
        if(isAncestorCellDead(ancestorCell, graphSet)){
            ancestorCell.color = "BLACK";
            showAncestorDeadEnd(ancestorCell, graphSet);
        }
    }
}


function getListOfAncestors(child, graphSet){
    var ancestorList = [];
    var neighbor;

    // Can we move up? Check up (row - 1)
    if(child.row - 1 > 0 && hWall[child.row - 1][child.col - 1] == false){
        neighbor = graphSet[child.row - 1][child.col];
        if (neighbor.color != "BLACK" && neighbor.distance == child.distance - 1){
            ancestorList.push(neighbor);
        }
    }

    // Can we move down? Check down (row + 1)
    if(child.row + 1 <= maze_rows && hWall[child.row][child.col - 1] == false){
        neighbor = graphSet[child.row + 1][child.col];
        if (neighbor.color != "BLACK" && neighbor.distance == child.distance - 1){
            ancestorList.push(neighbor);
        }
    }

    // Can we move left? Check left (col - 1)
    if(child.col - 1 > 0 && vWall[child.row - 1][child.col - 1] == false){
        neighbor = graphSet[child.row][child.col - 1];
        if (neighbor.color != "BLACK" && neighbor.distance == child.distance - 1){
            ancestorList.push(neighbor);
        }
    }

    // Can we move right? Check right (col - 1)
    if(child.col + 1 <= maze_columns && vWall[child.row - 1][child.col] == false){
        neighbor = graphSet[child.row][child.col + 1];
        if (neighbor.color != "BLACK" && neighbor.distance == child.distance - 1){
            ancestorList.push(neighbor);
        }
    }

    return ancestorList;
}
