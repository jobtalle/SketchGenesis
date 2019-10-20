const Bodies = function(myr, width, height) {
    const surface = new myr.Surface(width, height);
    const shader = Bodies.makeShader(myr, surface);
    const grid = new Grid(width, height);
    const flow = new Flow(width, height);
    const agents = [];
    let spawnTime = 0;

    const findSpawnLocation = () => {
        const flowDirection = new Myr.Vector(0, 0);
        const location = new Myr.Vector(0, 0);

        for (let i = 0; i < Lens.LOCATION_ATTEMPTS; ++i) {
            if (Math.random() < 0.5) {
                location.x = Math.random() * width;

                if (Math.random() < 0.5)
                    location.y = 0;
                else
                    location.y = height - 0.001;
            }
            else {
                location.y = Math.random() * height;

                if (Math.random() < 0.5)
                    location.x = 0;
                else
                    location.x = width - 0.001;
            }

            flowDirection.x = flowDirection.y = 0;
            flow.apply(location.x, location.y, flowDirection, 1);
            flowDirection.normalize();
            location.add(flowDirection);

            if (location.x < 0 ||
                location.y < 0 ||
                location.x >= width ||
                location.y >= height)
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
        }

        grid.populate(agents);

        surface.bind();
        surface.clear();

        //grid.draw(myr);
        //flow.draw(myr);

        for (const agent of agents)
            agent.drawMembrane(myr);
    };

    this.draw = () => {
        shader.draw(0, 0);

        for (const agent of agents)
            agent.drawBody(myr);
    };

    this.free = () => {
        shader.free();
        surface.free();
    };

    spawn(new Agent(new Myr.Vector(width * 0.5, height * 0.5)));
};

Bodies.makeShader = (myr, surface) => {
    const shader = new myr.Shader(
        "void main() {" +
            "mediump vec4 sourcePixel = texture(source, uv);" +
            "if (sourcePixel.a > 0.0) {" +
                "color = vec4(0.4, 0.5, 0.7, 1);" +
                "if (sourcePixel.a < 0.1)" +
                    "color = vec4(0.7, 0.8, 0.9, 1);" +
                "else if (sourcePixel.a > 0.6)" +
                    "color = vec4(0.85);" +
            "}" +
            "else " +
                "color = vec4(0);" +
        "}",
        [
            "source"
        ],
        []);

    shader.setSurface("source", surface);

    return shader;
};