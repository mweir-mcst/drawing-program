const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const fillColorInput = document.querySelector("#fillColor");
const strokeColorInput = document.querySelector("#strokeColor");
const lineWidthInput = document.querySelector("#lineWidth");
const undoButton = document.querySelector("#undo");
const redoButton = document.querySelector("#redo");
const saveButton = document.querySelector("#save");
const penButton = document.querySelector("#pen");
const lineButton = document.querySelector("#line");
const rectButton = document.querySelector("#rect");
const ellipseButton = document.querySelector("#ellipse");

let mousePos = [], lastMousePos = [], mouseDown = false;
let savedShapes = [], drawingPaths = [], undoneShapes = []
let currentPath, currentPos;
let shapeType = "pen";
let shiftDown = false;

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

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    function getPerfectMax() {
        let sizeX = Math.max(Math.abs(mousePos[0] - currentPos[0]), Math.abs(mousePos[1] - currentPos[1]));
        let sizeY = Math.max(Math.abs(mousePos[0] - currentPos[0]), Math.abs(mousePos[1] - currentPos[1]));
        if (mousePos[0] - currentPos[0] === sizeX * -1) sizeX *= -1;
        if (mousePos[1] - currentPos[1] === sizeY * -1) sizeY *= -1;
        return [sizeX, sizeY];
    }

    ctx.fillStyle = fillColorInput.value;
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
                    if (shiftDown) {
                        let size = getPerfectMax();
                        path.rect(...currentPos, size[0], size[1]);
                    } else {
                        path.rect(...currentPos, mousePos[0] - currentPos[0], mousePos[1] - currentPos[1]);
                    }
                    break;
                case "ellipse":
                    if (shiftDown) {
                        let size = getPerfectMax();
                        ellipse(path, currentPos, [currentPos[0] + size[0], currentPos[1] + size[1]]);
                    } else {
                        ellipse(path, currentPos, mousePos);
                    }
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

function save() {
    canvas.toBlob(async blob => {
        const file = await download(URL.createObjectURL(blob));
        alert(`Saved image to ${file}`);
    });
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
    if (e.key === "Shift") shiftDown = true;
    if (!e.ctrlKey) return;
    switch (e.key) {
        case "z":
            e.preventDefault();
            undo();
            break;
        case "y":
            e.preventDefault();
            redo();
            break;
        case "s":
            e.preventDefault();
            save();
            break;
    }
}

onkeyup = e => {
    if (e.key === "Shift") shiftDown = false;
}

undoButton.addEventListener("click", undo);
redoButton.addEventListener("click", redo);
saveButton.addEventListener("click", save);

penButton.addEventListener("click", () => shapeType = "pen");
lineButton.addEventListener("click", () => shapeType = "line");
rectButton.addEventListener("click", () => shapeType = "rect");
ellipseButton.addEventListener("click", () => shapeType = "ellipse");