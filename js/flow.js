const Flow = function(width, height) {
    const xCells = Math.ceil(width * Flow.RESOLUTION_INVERSE) + 1;
    const yCells = Math.ceil(height * Flow.RESOLUTION_INVERSE) + 1;
    const cells = new Array(xCells * yCells);
    const noisesX = new Array(cells.length);
    const noisesY = new Array(cells.length);
    let time = 0;

    for (let i = 0; i < cells.length; ++i) {
        cells[i] = new Myr.Vector(0, 0);
        noisesX[i] = cubicNoiseConfig(Math.random());
        noisesY[i] = cubicNoiseConfig(Math.random());
    }

    const get = (x, y) => {
        return cells[x + y * xCells];
    };

    this.apply = (x, y, vector, timeStep) => {
        const ix = Math.floor(x * Flow.RESOLUTION_INVERSE);
        const iy = Math.floor(y * Flow.RESOLUTION_INVERSE);
        const lt = get(ix, iy);
        const rt = get(ix + 1, iy);
        const lb = get(ix, iy + 1);
        const rb = get(ix + 1, iy + 1);
        const fx = (x - ix * Flow.RESOLUTION) * Flow.RESOLUTION_INVERSE;
        const fy = (y - iy * Flow.RESOLUTION) * Flow.RESOLUTION_INVERSE;
        const vxLeft = lt.x * (1 - fy) + lb.x * fy;
        const vyLeft = lt.y * (1 - fy) + lb.y * fy;
        const vxRight = rt.x * (1 - fy) + rb.x * fy;
        const vyRight = rt.y * (1 - fy) + rb.y * fy;

        vector.x += (vxLeft * (1 - fx) + vxRight * fx) * timeStep;
        vector.y += (vyLeft * (1 - fx) + vyRight * fx) * timeStep;
    };

    this.update = timeStep => {
        time += timeStep * Flow.SPEED;

        for (let i = 0; i < cells.length; ++i) {
            cells[i].x = (cubicNoiseSample1(noisesX[i], time) - Flow.PIVOT_X) * Flow.MAGNITUDE_X;
            cells[i].y = (cubicNoiseSample1(noisesY[i], time) - Flow.PIVOT_Y) * Flow.MAGNITUDE_Y;
        }
    };

    this.draw = myr => {
        for (let y = 0; y < yCells; ++y) for (let x = 0; x < xCells; ++x) {
            const index = x + y * xCells;

            myr.push();
            myr.translate(x * Flow.RESOLUTION, y * Flow.RESOLUTION);

            myr.primitives.drawLine(
                Myr.Color.CYAN,
                0,
                0,
                cells[index].x,
                cells[index].y);

            myr.pop();
        }
    };

    randomize(cells[0]);
    randomize(cells[1]);
};

Flow.SPEED = 0.2;
Flow.PIVOT_X = 0.5;
Flow.PIVOT_Y = 0.5;
Flow.MAGNITUDE_X = 900;
Flow.MAGNITUDE_Y = 900;
Flow.RESOLUTION = 256;
Flow.RESOLUTION_INVERSE = 1 / Flow.RESOLUTION;