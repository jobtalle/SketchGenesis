const Pressure = function(width, height) {
    const grid = new Grid(width, height);
    const agents = [];

    this.spawn = (x, y) => {
        agents.push(new Agent(new Vector(x, y)));
    };

    this.update = timeStep => {
        grid.update(timeStep, agents);

        for (let i = agents.length; i-- > 0;) {
            agents[i].update(timeStep);

            if (agents[i].position.x < 0 ||
                agents[i].position.y < 0 ||
                agents[i].position.x > width ||
                agents[i].position.y > height) {
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