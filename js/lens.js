const Lens = function(radius) {
    const grid = new Grid(radius + radius, radius + radius);
    const flow = new Flow(radius + radius, radius + radius);
    const agents = [];
    let spawnTime = 0;

    const findSpawnLocation = () => {
        const flowDirection = new Myr.Vector(0, 0);
        const location = new Myr.Vector(0, 0);
        let i = 0;

        while (i < Lens.LOCATION_ATTEMPTS) {
            if (Math.random() < 0.5) {
                location.x = Math.random() * (radius + radius);

                if (Math.random() < 0.5)
                    location.y = 0;
                else
                    location.y = radius + radius - 0.001;
            }
            else {
                location.y = Math.random() * (radius + radius);

                if (Math.random() < 0.5)
                    location.x = 0;
                else
                    location.x = radius + radius - 0.001;
            }

            flowDirection.x = flowDirection.y = 0;
            flow.apply(location.x, location.y, flowDirection, 1);
            flowDirection.normalize();
            location.add(flowDirection);

            if (location.x < 0 ||
                location.y < 0 ||
                location.x >= radius + radius ||
                location.y >= radius + radius)
                continue;

            return location;
        }

        return null;
    };

    const spawn = agent => {
        agents.push(agent);
    };

    this.update = timeStep => {
        flow.update(timeStep);
        grid.update(timeStep);

        if ((spawnTime -= timeStep) < 0) {
            spawnTime += Lens.SPAWN_TIME;

            const position = findSpawnLocation();

            if (position) {
                const agent = new Agent(position, 32);

                flow.apply(agent.position.x, agent.position.y, agent.velocity, Lens.AGENT_SPAWN_BOOST);

                spawn(agent);
            }
        }

        for (let i = agents.length; i-- > 0;) {
            const agent = agents[i];

            flow.apply(agent.position.x, agent.position.y, agent.velocity, timeStep);
            agent.update(timeStep, spawn);

            if (agent.position.x < 0 ||
                agent.position.y < 0 ||
                agent.position.x >= radius + radius ||
                agent.position.y >= radius + radius)
                agents.splice(i, 1);
        }

        grid.populate(agents);
    };

    this.draw = context => {
        grid.draw(context);
        flow.draw(context);

        for (const agent of agents)
            agent.draw(context);
    };
};

Lens.SPAWN_TIME = 3;
Lens.LOCATION_ATTEMPTS = 10;
Lens.AGENT_SPAWN_BOOST = 1;