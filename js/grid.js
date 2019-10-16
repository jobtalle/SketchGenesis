const Grid = function(width, height) {
    const xCells = Math.ceil(width / Grid.RESOLUTION) + 1;
    const yCells = Math.ceil(height / Grid.RESOLUTION) + 1;
    const cells = new Array(xCells * yCells);
    const weights = new Array(xCells * yCells);
    const vector = new Vector(0, 0);

    for (let i = 0; i < weights.length; ++i)
        weights[i] = 1;

    const clear = () => {
        for (let i = 0; i < cells.length; ++i)
            cells[i] = 0;
    };

    const add = (x, y, value) => {
        cells[x + y * xCells] += value;
    };

    const get = (x, y) => {
        return cells[x + y * xCells] * weights[x + y * xCells];
    };

    this.get = (x, y) => {
        const ix = Math.floor(x * Grid.RESOLUTION_INVERSE);
        const iy = Math.floor(y * Grid.RESOLUTION_INVERSE);
        const dx = x - ix * Grid.RESOLUTION;
        const dy = y - iy * Grid.RESOLUTION;
        const fx = dx * Grid.RESOLUTION_INVERSE;
        const fy = dy * Grid.RESOLUTION_INVERSE;

        const pLeft = get(ix, iy) * fy + get(ix, iy + 1) * (1 - fy);
        const pRight = get(ix + 1, iy) * fy + get(ix + 1, iy + 1) * (1 - fy);
        const pTop = get(ix, iy) * fx + get(ix + 1, iy) * (1 - fx);
        const pBottom = get(ix, iy + 1) * fx + get(ix + 1, iy + 1) * (1 - fx);

        vector.x = pLeft - pRight;
        vector.y = pTop - pBottom;

        return vector;
    };

    this.populate = agents => {
        clear();

        for (const agent of agents) {
            const ix = Math.floor(agent.getPosition().x * Grid.RESOLUTION_INVERSE);
            const iy = Math.floor(agent.getPosition().y * Grid.RESOLUTION_INVERSE);
            const dx = agent.getPosition().x - ix * Grid.RESOLUTION;
            const dy = agent.getPosition().y - iy * Grid.RESOLUTION;
            const fx = dx * Grid.RESOLUTION_INVERSE;
            const fy = dy * Grid.RESOLUTION_INVERSE;

            add(ix, iy, (1 - fx) * (1 - fy) * agent.getPressure());
            add(ix + 1, iy, fx * (1 - fy) * agent.getPressure());
            add(ix, iy + 1, (1 - fx) * fy * agent.getPressure());
            add(ix + 1, iy + 1, fx * fy * agent.getPressure());
        }
    };

    this.draw = context => {
        context.fillStyle = "gray";
        context.strokeStyle = "white";

        for (let y = 0; y < yCells; ++y) for (let x = 0; x < xCells; ++x) {
            const px = x * Grid.RESOLUTION;
            const py = y * Grid.RESOLUTION;
            const pressure = get(x, y);

            if (pressure !== 0) {
                context.beginPath();
                context.arc(px, py, pressure, 0, Math.PI + Math.PI);
                context.fill();
            }
        }
    };
};

Grid.RESOLUTION = 32;
Grid.RESOLUTION_INVERSE = 1 / Grid.RESOLUTION;