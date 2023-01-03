// storage -> 2d array
let collectedGraphComponent = [];
let graphComponentMatrix = [];

// for (let i = 0;i < rows;i++) {
//     let row = [];
//     for(let j = 0;j < cols;j++) {
//         row.push([]);
//     }
//     graphComponentMatrix.push(row);
// }

// it will return boolean value true -> cycle, false -> not cycle
function isGraphCyclic(graphComponentMatrix) {
    // dependency -> visited, dfsVisited ( both will be a 2d array ) 
    let visited = [];
    let dfsVisited = [];

    for (let i = 0;i < rows;i++) {
        let visitedRow = [];
        let dfsVisitedRow = [];
        for (let j = 0;j < cols;j++) {
            visitedRow.push(false);
            dfsVisitedRow.push(false);
        }
        visited.push(visitedRow);
        dfsVisited.push(dfsVisitedRow);
    }

    for (let i = 0;i < rows;i++) {
        for (let j = 0;j < cols;j++) {
           if (visited[i][j] === false) {
            let response = dfsCycleDetection(graphComponentMatrix, i, j, visited, dfsVisited);
            if (response === true) {
                // found cycle so return immediately, no need to explore more path
                return [i, j];
            }
           } 
        }
    }

    return null;
}

// start -> visited => true, dfsVisited => true
// end -> dfsVisited => false
// if visited[i][j] -> already explored path, so go back no use to explore again
// cycle detection condition -> if (visited[i][j] == true && dfsVisited[i][j] == true) -> cycle
// this function return -> true/false
function dfsCycleDetection(graphComponentMatrix, srcr, srcc, visited, dfsVisited) {
    visited[srcr][srcc] = true;
    dfsVisited[srcr][srcc] = true;

    for (let children = 0;children < graphComponentMatrix[srcr][srcc].length;children++) {
        let [nbrr, nbrc] = graphComponentMatrix[srcr][srcc][children]; // nbrr -> neighbour row, nbrc -> neighbour column
        if (visited[nbrr][nbrc] === false) {
            let response = dfsCycleDetection(graphComponentMatrix, nbrr, nbrc, visited, dfsVisited);
            if (response === true) {
                // found cycle so return immediately, no need to explore more path
                return true;
            }
        }
        else if (visited[nbrr][nbrc] === true && dfsVisited[nbrr][nbrc] === true) {
            // found cycle so return immediately, no need to explore more path
            return true;
        }
    }

    dfsVisited[srcr][srcc] = false;
    return false;
}