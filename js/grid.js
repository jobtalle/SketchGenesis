const Grid = function(width, height) {
    const Cell = function() {
        this.agents = [];
        this.agentCount = 0;
    };

    const flow = new Flow(width, height);
    const xCells = Math.ceil(width * Grid.RESOLUTION_INVERSE) + 1;
    const yCells = Math.ceil(height * Grid.RESOLUTION_INVERSE) + 1;
    const cells = new Array(xCells * yCells);

    for (let i = 0; i < cells.length; ++i)
        cells[i] = new Cell();

    const clear = () => {
        for (let i = 0; i < cells.length; ++i)
            cells[i].agentCount = 0;
    };

    const get = (x, y) => {
        return cells[x + y * xCells];
    };

    this.getCentroids = () => {
        const centroids = [];
        const centroidCells = Math.ceil(Grid.CENTROID_SPACING * Grid.RESOLUTION_INVERSE);

        for (let yStart = 0; yStart < yCells; yStart += centroidCells) {
            for (let xStart = 0; xStart < xCells; xStart += centroidCells) {
                const xEnd = Math.min(xCells, xStart + centroidCells);
                const yEnd = Math.min(yCells, yStart + centroidCells);
                const mean = new Myr.Vector(0, 0);
                let influence = 0;

                for (let y = yStart; y < yEnd; ++y) for (let x = xStart; x < xEnd; ++x) {
                    const cell = get(x, y);

                    for (let i = 0; i < cell.agentCount; ++i) {
                        mean.x += cell.agents[i].position.x;
                        mean.y += cell.agents[i].position.y;
                        influence += 1;
                    }
                }

                if (influence !== 0) {
                    mean.divide(influence);

                    centroids.push(mean);
                }
            }
        }

        console.log(centroids);
    };

    this.getWidth = () => {
        return width;
    };

    this.getHeight = () => {
        return height;
    };

    this.getFlow = () => {
        return flow;
    };

    this.populate = agents => {
        clear();

        for (let i = agents.length; i-- > 0;) {
            const agent = agents[i];

            if (agent.position.x < 0 ||
                agent.position.y < 0 ||
                agent.position.x >= width ||
                agent.position.y >= height)
                agents.splice(i, 1);
            else {
                const x = Math.floor(agent.position.x * Grid.RESOLUTION_INVERSE);
                const y = Math.floor(agent.position.y * Grid.RESOLUTION_INVERSE);
                const cell = cells[x + y * xCells];

                cell.agents[cell.agentCount++] = agent;
            }
        }
    };

    this.update = timeStep => {
        flow.update(timeStep);

        for (let y = 0; y < yCells - 1; ++y) for (let x = 0; x < xCells - 1; ++x) {
            const cell = get(x, y);

            if (cell.agentCount !== 0) {
                const right = get(x + 1, y);
                const leftBottom = get(x - 1, y + 1);
                const bottom = get(x, y + 1);
                const rightBottom = get(x + 1, y + 1);

                for (let self = 0; self < cell.agentCount; ++self) {
                    const agent = cell.agents[self];

                    flow.apply(agent.position.x, agent.position.y, agent.velocity, timeStep);

                    for (let other = self + 1; other < cell.agentCount; ++other)
                        agent.collide(cell.agents[other], timeStep);

                    for (let other = 0; other < right.agentCount; ++other)
                        agent.collide(right.agents[other], timeStep);

                    for (let other = 0; other < leftBottom.agentCount; ++other)
                        agent.collide(leftBottom.agents[other], timeStep);

                    for (let other = 0; other < bottom.agentCount; ++other)
                        agent.collide(bottom.agents[other], timeStep);

                    for (let other = 0; other < rightBottom.agentCount; ++other)
                        agent.collide(rightBottom.agents[other], timeStep);
                }
            }
        }
    };

    this.draw = myr => {
        for (let x = 0; x < xCells; ++x)
            myr.primitives.drawLine(
                Myr.Color.WHITE,
                x * Grid.RESOLUTION,
                0,
                x * Grid.RESOLUTION,
                yCells * Grid.RESOLUTION);

        for (let y = 0; y < yCells; ++y)
            myr.primitives.drawLine(
                Myr.Color.WHITE,
                0,
                y * Grid.RESOLUTION,
                xCells * Grid.RESOLUTION,
                y * Grid.RESOLUTION);

            for (let y = 0; y < yCells; ++y) for (let x = 0; x < xCells; ++x) {
                if (get(x, y).agentCount === 0)
                    continue;

                myr.primitives.fillRectangle(
                    Myr.Color.BLUE,
                    x * Grid.RESOLUTION + 1,
                    y * Grid.RESOLUTION + 1,
                    Grid.RESOLUTION - 2,
                    Grid.RESOLUTION - 2);
            }

        flow.draw(myr);
    };
};

Grid.RESOLUTION = Agent.RADIUS * 2;
Grid.RESOLUTION_INVERSE = 1 / Grid.RESOLUTION;
Grid.CENTROID_SPACING = 300;