for (let i=0;i < rows;i++) {
    for (let j=0;j < cols;j++) {
        let cell = document.querySelector(`.cell[rid="${i}"][cid="${j}"]`);
        cell.addEventListener("blur", (e) => {
            let address = addressBar.value;
            let [activecell, cellProp] = getCellAndCellProp(address);
            let enteredData = activecell.innerText;

            if (enteredData === cellProp.value) {
                return;
            }

            cellProp.value = enteredData;
            // if data modifies remove p-c relation, formula empty, update children with new modified value
            removeChildFromParent(cellProp.formula);
            cellProp.formula = "";
            updateChildrenCells(address);
        })
    }
}

let formulaBar = document.querySelector(".formula-bar");
formulaBar.addEventListener("keydown", async (e) =>{
    let inputFormula = formulaBar.value;
    if (e.key === "Enter" && inputFormula) {
        // if change in formula, break the parent child relation, evaluate new formula, add new parent child relation
        let address = addressBar.value;
        let [cell, cellProp] = getCellAndCellProp(address);
        if (inputFormula !== cellProp.formula) {
            removeChildFromParent(cellProp.formula);
        }

        addChildToGraphComponent(inputFormula, address);
        // check formula is cyclic or not, then only evaluate it
        // true -> cycle, false -> not cyclic
        let cycleResponce = isGraphCyclic(graphComponentMatrix);
        if (cycleResponce) {
            //alert("Your Formula is Cyclic");
            let responce = confirm("Your Formula is Cyclic. Do you want to trace your path?");
            while (responce === true) {
                // keep on tracking color until user is satisfied
                await isGraphCyclicTracePath(graphComponentMatrix, cycleResponce);
                responce = confirm("Your Formula is Cyclic. Do you want to trace your path?");
            }
            removeChildFromGraphComponent(inputFormula, address);
            return;
        }

        let evaluatedValue = evaluateFormula(inputFormula);

        // to update ui and cellprop in db
        setCellUIAndCellProp(evaluatedValue, inputFormula, address);
        addChildToParent(inputFormula);

        updateChildrenCells(address);
    }
})

function addChildToGraphComponent(formula, childAddress) {
    let [crid, ccid] = decodeRidCidFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for (let i = 0;i < encodedFormula.length;i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
            let [prid, pcid] = decodeRidCidFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].push([crid, ccid]);
        }
    }
}

function removeChildFromGraphComponent(formula, childAddress) {
    let [crid, ccid] = decodeRidCidFromAddress(childAddress);
    let encodedFormula = formula.split(" ");
    for (let i = 0;i < encodedFormula.length;i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
            let [prid, pcid] = decodeRidCidFromAddress(encodedFormula[i]);
            graphComponentMatrix[prid][pcid].pop();
        }
    }
}

function updateChildrenCells(parentAddress) {
    let [parentCell, parentCellProp] = getCellAndCellProp(parentAddress);
    let children = parentCellProp.children;

    for (let i = 0;i < children.length;i++) {
        let childAddress = children[i];
        let [childCell, childCellProp] = getCellAndCellProp(childAddress);
        let childFormula = childCellProp.formula;

        let evaluatedValue = evaluateFormula(childFormula);
        setCellUIAndCellProp(evaluatedValue, childFormula, childAddress);
        updateChildrenCells(childAddress);
    }
}

function addChildToParent(formula) {
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for (let i=0;i < encodedFormula.length;i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
           let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
           parentCellProp.children.push(childAddress);
        }
    }
}

function removeChildFromParent(formula) {
    let childAddress = addressBar.value;
    let encodedFormula = formula.split(" ");
    for (let i = 0;i < encodedFormula.length;i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
            let [parentCell, parentCellProp] = getCellAndCellProp(encodedFormula[i]);
            let idx = parentCellProp.children.indexOf(childAddress);
            parentCellProp.children.splice(idx, 1);
        }
    }
}

function evaluateFormula(formula) {
    let encodedFormula = formula.split(" ");
    for (let i = 0;i < encodedFormula.length;i++) {
        let asciiValue = encodedFormula[i].charCodeAt(0);
        if (asciiValue >= 65 && asciiValue <= 90) {
            let [cell, cellProp] = getCellAndCellProp(encodedFormula[i]);
            encodedFormula[i] = cellProp.value;
        }
    }
    let decodedFormula = encodedFormula.join(" ");
    return eval(decodedFormula);
}

function setCellUIAndCellProp(evaluatedValue, formula, address) {
    let [cell, cellProp] = getCellAndCellProp(address);

    cell.innerText = evaluatedValue;
    cellProp.value = evaluatedValue;
    cellProp.formula = formula;
}