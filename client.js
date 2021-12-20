const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const fillColorInput = document.querySelector("#fillColor");
const strokeColorInput = document.querySelector("#strokeColor");
const lineWidthInput = document.querySelector("#lineWidth");
const undoButton = document.querySelector("#undo");
const redoButton = document.querySelector("#redo");

let mousePos = [], lastMousePos = [], mouseDown = false;
let savedShapes = [], drawingShapes = [], undoneShapes = [], currentPath;

function draw() {
    canvas.width = innerWidth - 50;
    canvas.height = innerHeight;

    for (const shape of savedShapes.concat(drawingShapes)) {
        ctx.fillStyle = shape.fillColor;
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.lineWidth;
        switch (shape.type) {
            case "line":
                ctx.stroke(shape.path);
                break;
        }
    }

    ctx.strokeStyle = strokeColorInput.value;

    if (mousePos !== lastMousePos) {
        if (mouseDown) {
            const path = new Path2D();
            path.moveTo(...lastMousePos);
            path.lineTo(...mousePos);
            currentPath.moveTo(...lastMousePos);
            currentPath.lineTo(...mousePos);
            path.closePath();
            ctx.stroke(path);
            drawingShapes.push({
                type: "line",
                strokeColor: strokeColorInput.value,
                fillColor: fillColorInput.value,
                lineWidth: lineWidthInput.value,
                path
            });
        }
        lastMousePos = mousePos;
    }
}

function undo()  {

}

function redo() {
    if (undoneShapes.length > 0) savedShapes.push(undoneShapes.pop());
}

setInterval(draw, 0);

onmousedown = () => {
    currentPath = new Path2D();
    mouseDown = true;
}

onmouseup = () => {
    mouseDown = false;
    currentPath.closePath();
    drawingShapes = [];
    undoneShapes = [];
    savedShapes.push({
        type: "line",
        strokeColor: strokeColorInput.value,
        fillColor: fillColorInput.value,
        lineWidth: lineWidthInput.value,
        path: currentPath
    });
}

onmousemove = e => mousePos = [e.x, e.y];

onkeydown = e => {
    if (e.ctrlKey && e.key === "z") undo();
    if (e.ctrlKey && e.key === "y") redo();
}

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);