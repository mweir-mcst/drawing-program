const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const fillColorInput = document.querySelector("#fillColor");
const strokeColorInput = document.querySelector("#strokeColor");
const lineWidthInput = document.querySelector("#lineWidth");
const undoButton = document.querySelector("#undo");
const redoButton = document.querySelector("#redo");
const penButton = document.querySelector("#pen");
const lineButton = document.querySelector("#line");
const rectButton = document.querySelector("#rect");
const ellipseButton = document.querySelector("#ellipse");

let mousePos = [], lastMousePos = [], mouseDown = false;
let savedShapes = [], drawingPaths = [], undoneShapes = []
let currentPath, currentPos;
let shapeType = "pen";

function ellipse(path, pointA, pointB) {
    path.ellipse(
        (pointA[0] + pointB[0]) / 2,
        (pointA[1] + pointB[1]) / 2,
        (Math.max(pointA[0], pointB[0]) - Math.min(pointA[0], pointB[0])) / 2,
        (Math.max(pointA[1], pointB[1]) - Math.min(pointA[1], pointB[1])) / 2,
        0,
        0,
        Math.PI * 2
    )
}

function draw() {
    canvas.width = innerWidth - 50;
    canvas.height = innerHeight;

    for (const shape of savedShapes.concat(drawingPaths.map(path => ({
        type: "pen",
        fillColor: fillColorInput.value,
        strokeColor: strokeColorInput.value,
        lineWidth: lineWidthInput.value,
        path
    })))) {
        ctx.fillStyle = shape.fillColor;
        ctx.strokeStyle = shape.strokeColor;
        ctx.lineWidth = shape.lineWidth;
        ctx.fill(shape.path);
        ctx.stroke(shape.path);
    }

    ctx.strokeStyle = strokeColorInput.value;

    if (mousePos === lastMousePos) return;
    if (mouseDown) {
        const path = new Path2D();
        if (shapeType === "pen") {
            path.moveTo(...lastMousePos);
            path.lineTo(...mousePos);
            currentPath.moveTo(...lastMousePos);
            currentPath.lineTo(...mousePos);
            path.closePath();
            ctx.stroke(path);
            drawingPaths.push(path);
        } else {
            switch (shapeType) {
                case "line":
                    path.moveTo(...currentPos);
                    path.lineTo(...mousePos);
                    break;
                case "rect":
                    path.rect(...currentPos, mousePos[0] - currentPos[0], mousePos[1] - currentPos[1]);
                    break;
                case "ellipse":
                    ellipse(path, currentPos, mousePos);
                    break;
            }
            path.closePath();
            drawingPaths = [path];
        }
    }
    lastMousePos = mousePos;
}

function undo()  {
    if (savedShapes.length > 0) undoneShapes.push(savedShapes.pop());
}

function redo() {
    if (undoneShapes.length > 0) savedShapes.push(undoneShapes.pop());
}

setInterval(draw, 0);

canvas.addEventListener("mousedown", () => {
    switch (shapeType) {
        case "pen":
            currentPath = new Path2D();
            break;
        case "line":
        case "rect":
        case "ellipse":
            currentPos = mousePos;
            break;
    }
    mouseDown = true;
})

canvas.addEventListener("mouseup", () => {
    mouseDown = false;
    let path;
    switch (shapeType) {
        case "pen":
            currentPath.closePath();
            path = currentPath;
            break;
        case "line":
            path = new Path2D();
            path.moveTo(...currentPos);
            path.lineTo(...mousePos);
            path.closePath();
            break;
        case "rect":
            path = new Path2D();
            path.rect(...currentPos, mousePos[0] - currentPos[0], mousePos[1] - currentPos[1]);
            path.closePath();
            break;
        case "ellipse":
            path = new Path2D();
            ellipse(path, currentPos, mousePos);
            path.closePath();
            break;
    }
    drawingPaths = [];
    undoneShapes = [];
    savedShapes.push({
        strokeColor: strokeColorInput.value,
        fillColor: fillColorInput.value,
        lineWidth: lineWidthInput.value,
        path: path
    });
})

canvas.addEventListener("mousemove", e => mousePos = [e.x, e.y]);

onkeydown = e => {
    if (e.ctrlKey && e.key === "z") undo();
    if (e.ctrlKey && e.key === "y") redo();
}

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);

penButton.addEventListener("click", () => shapeType = "pen");
lineButton.addEventListener("click", () => shapeType = "line");
rectButton.addEventListener("click", () => shapeType = "rect");
ellipseButton.addEventListener("click", () => shapeType = "ellipse");