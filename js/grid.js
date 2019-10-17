const Grid = function(width, height) {
    const Cell = function() {
        this.agents = [];
        this.agentCount = 0;
    };

    const xCells = Math.ceil(width / Grid.RESOLUTION) + 1;
    const yCells = Math.ceil(height / Grid.RESOLUTION) + 1;
    const cells = new Array(xCells * yCells);

    let connections = 0;

    for (let i = 0; i < cells.length; ++i)
        cells[i] = new Cell();

    const clear = () => {
        for (let i = 0; i < cells.length; ++i) {
            cells[i].agentCount = 0;
        }
    };

    const get = (x, y) => {
        return cells[x + y * xCells];
    };

    const populate = agents => {
        clear();

        for (const agent of agents) {
            const x = Math.floor(agent.getPosition().x * Grid.RESOLUTION_INVERSE);
            const y = Math.floor(agent.getPosition().y * Grid.RESOLUTION_INVERSE);
            const cell = cells[x + y * xCells];

            cell.agents[cell.agentCount++] = agent;
        }
    };

    this.update = (timeStep, agents) => {
        populate(agents);

        for (let y = 0; y < yCells - 1; ++y) for (let x = 0; x < xCells - 1; ++x) {
            const cell = get(x, y);
            const right = get(x + 1, y);
            const leftBottom = get(x - 1, y + 1);
            const bottom = get(x, y + 1);
            const rightBottom = get(x + 1, y + 1);

            for (let self = 0; self < cell.agentCount; ++self) {
                for (let other = self + 1; other < cell.agentCount; ++other)
                    cell.agents[self].collide(cell.agents[other], timeStep);

                for (let other = 0; other < right.agentCount; ++other)
                    cell.agents[self].collide(right.agents[other], timeStep);

                for (let other = 0; other < leftBottom.agentCount; ++other)
                    cell.agents[self].collide(leftBottom.agents[other], timeStep);

                for (let other = 0; other < bottom.agentCount; ++other)
                    cell.agents[self].collide(bottom.agents[other], timeStep);

                for (let other = 0; other < rightBottom.agentCount; ++other)
                    cell.agents[self].collide(rightBottom.agents[other], timeStep);
            }
        }
    };

    this.draw = context => {
        context.fillStyle = "gray";
        context.strokeStyle = "white";

        for (let x = 0; x < xCells; ++x) {
            context.beginPath();
            context.moveTo(x * Grid.RESOLUTION, 0);
            context.lineTo(x * Grid.RESOLUTION, yCells * Grid.RESOLUTION);
            context.stroke();
        }

        for (let y = 0; y < yCells; ++y) {
            context.beginPath();
            context.moveTo(0, y * Grid.RESOLUTION);
            context.lineTo(xCells * Grid.RESOLUTION, y * Grid.RESOLUTION);
            context.stroke();
        }

        for (let y = 0; y < yCells; ++y) for (let x = 0; x < xCells; ++x) {
            if (get(x, y).agentCount === 0)
                continue;

            context.fillStyle = "blue";
            context.beginPath();
            context.rect(x * Grid.RESOLUTION + 1, y * Grid.RESOLUTION + 1, Grid.RESOLUTION - 2, Grid.RESOLUTION - 2);
            context.fill();
        }
    };
};

Grid.RESOLUTION = 48;
Grid.RESOLUTION_INVERSE = 1 / Grid.RESOLUTION;