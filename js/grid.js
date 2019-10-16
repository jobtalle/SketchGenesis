const Grid = function(width, height) {
    const xCells = Math.ceil(width / Grid.RESOLUTION) + 1;
    const yCells = Math.ceil(height / Grid.RESOLUTION) + 1;
    const cells = new Array(xCells * yCells);

    this.draw = context => {
        context.strokeStyle = "white";
        context.beginPath();

        for (let y = 0; y < yCells; ++y) for (let x = 0; x < xCells; ++x) {
            const px = x * Grid.RESOLUTION;
            const py = y * Grid.RESOLUTION;

            context.moveTo(px, py);
            context.lineTo(px + 2, py + 2);
        }

        context.stroke();
    };
};

Grid.RESOLUTION = 32;