const Pressure = function(width, height) {
    const grid = new Grid(width, height);
    const agents = [];

    this.spawn = (x, y) => {
        agents.push(new Agent(new Vector(x, y)));
    };

    this.update = timeStep => {
        grid.update(timeStep, agents);

        for (let i = agents.length; i-- > 0;) {
            agents[i].update(timeStep, grid);

            if (agents[i].getPosition().x < Grid.RESOLUTION ||
                agents[i].getPosition().y < Grid.RESOLUTION ||
                agents[i].getPosition().x > width - Grid.RESOLUTION ||
                agents[i].getPosition().y > height - Grid.RESOLUTION) {
                agents.splice(i, 1);
            }
        }
    };

    this.draw = context => {
        grid.draw(context);

        for (const agent of agents)
            agent.draw(context);
    };
};