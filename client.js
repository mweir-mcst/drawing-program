const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let mousePos = [], lastMousePos = [], mouseDown = false;
let savedPaths = [], drawingPaths = [], undonePaths = [], currentPath;

function draw() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    for (const path of savedPaths.concat(drawingPaths)) ctx.stroke(path);

    if (mousePos !== lastMousePos) {
        if (mouseDown) {
            const path = new Path2D();
            path.moveTo(...lastMousePos);
            path.lineTo(...mousePos);
            currentPath.moveTo(...lastMousePos);
            currentPath.lineTo(...mousePos);
            path.closePath();
            ctx.stroke(path);
            drawingPaths.push(path);
        }
        lastMousePos = mousePos;
    }
}

setInterval(draw, 0);

onmousedown = () => {
    currentPath = new Path2D();
    mouseDown = true;
}

onmouseup = () => {
    mouseDown = false;
    currentPath.closePath();
    drawingPaths = [];
    undonePaths = [];
    savedPaths.push(currentPath);
}

onmousemove = e => mousePos = [e.x, e.y];

onkeydown = e => {
    if (e.ctrlKey && e.key === "z" && savedPaths.length > 0) undonePaths.push(savedPaths.pop());
    if (e.ctrlKey && e.key === "y" && undonePaths.length > 0) savedPaths.push(undonePaths.pop());
}