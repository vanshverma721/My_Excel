let ctrlKey;

document.addEventListener("keydown", (e) => {
    ctrlKey = e.ctrlKey;
})

document.addEventListener("keyup", (e) => {
    ctrlKey = e.ctrlKey;
})

let copyBtn = document.querySelector(".copy");
let cutBtn = document.querySelector(".cut");
let pasteBtn = document.querySelector(".paste");

for (let i = 0;i < rows;i++) { 
    for (let j = 0;j< cols;j++) {
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        handleSelectedCells(cell);
    }
}

let rangeStorage = [];
function handleSelectedCells(cell) {
    cell.addEventListener("click", (e) => {

        if (!ctrlKey) {
            return;
        }

        if (rangeStorage.length >= 2) {
            defaultSelectedCellsUI();
            rangeStorage = [];
        }

        //ui
        cell.style.border = "3px solid #218c74";

        let rid = Number(cell.getAttribute("rid"));
        let cid = Number(cell.getAttribute("cid"));
        rangeStorage.push([rid, cid]);
    })
}

function defaultSelectedCellsUI() {
    for (let i = 0;i < rangeStorage.length;i++) {
        let cell = document.querySelector(`.cell[rid="${rangeStorage[i][0]}"][cid="${rangeStorage[i][1]}"]`);
        cell.style.border = "1px solid #dfe4ea";
    }
}

let copyData = [];
copyBtn.addEventListener("click", (e) => {

    if (rangeStorage.length < 2) {
        return;
    }
    copyData = [];

    let [startRow, endRow, startCol, endCol] = [ rangeStorage[0][0], rangeStorage[1][0], rangeStorage[0][1], rangeStorage[1][1]];
    
    for (let i = startRow;i <= endRow;i++) {
        let copyRow = []
        for (let j = startCol;j <= endCol;j++) {
            let cellProp = sheetDB[i][j];
            copyRow.push(cellProp);
        }
        copyData.push(copyRow);
    }
    defaultSelectedCellsUI();
})

cutBtn.addEventListener("click", (e) => {

    if (rangeStorage.length < 2) {
        return;
    }

    let [startRow, endRow, startCol, endCol] = [ rangeStorage[0][0], rangeStorage[1][0], rangeStorage[0][1], rangeStorage[1][1]];
    
    for (let i = startRow;i <= endRow;i++) {
        for (let j = startCol;j <= endCol;j++) {
            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            
            //db
            let cellProp = sheetDB[i][j];
            cellProp.value = "";
            cellProp.bold = false;
            cellProp.italic = false;
            cellProp.underline = false;
            cellProp.fontSize = 14;
            cellProp.fontFamily = "monospace";
            cellProp.fontColor = "#000000";
            cellProp.BGcolor = "#000000";
            cellProp.alignment = "left";

            // ui
            cell.click();
        }
    }
    defaultSelectedCellsUI();
})

pasteBtn.addEventListener("click", (e) => {

    if (rangeStorage.length < 2) {
        return;
    }

    let rowDiff = Math.abs(rangeStorage[0][0] - rangeStorage[1][0]);
    let colDiff = Math.abs(rangeStorage[0][1] - rangeStorage[1][1]);

    let address = addressBar.value;
    let [startRow, startCol] = decodeRidCidFromAddress(address);

    for (let i = startRow,r = 0;i <= startRow+rowDiff;i++,r++) {
        for (let j = startCol,c = 0;j <= startCol+colDiff;j++,c++) {

            let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
            if (!cell) {
                continue;
            }
            
            // db
            let Data = copyData[r][c];
            let cellProp = sheetDB[i][j];

            cellProp.value = Data.value;
            cellProp.bold = Data.bold;
            cellProp.italic = Data.italic;
            cellProp.underline = Data.underline;
            cellProp.fontSize = Data.fontSize;
            cellProp.fontFamily = Data.fontFamily;
            cellProp.fontColor = Data.fontColor;
            cellProp.BGcolor = Data.BGcolor;
            cellProp.alignment = Data.alignment;

            // ui
            cell.click();
        }
    }
})