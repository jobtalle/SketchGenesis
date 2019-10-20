const Bodies = function(myr, width, height) {
    const surface = new myr.Surface(width, height);
    const shader = Bodies.makeShader(myr, surface);
    const grid = new Grid(width, height);
    const liquid = new Liquid(myr, grid);
    const agents = [];
    let spawnTime = 0;

    const spawn = agent => {
        agents.push(agent);
    };

    this.update = timeStep => {
        grid.update(timeStep);
        liquid.update(timeStep);

        if ((spawnTime -= timeStep) < 0) {
            spawnTime += Bodies.SPAWN_TIME;

            const position = grid.findSpawnLocation();

            if (position)
                spawn(new Agent(position, 32));
        }

        for (let i = agents.length; i-- > 0;)
            agents[i].update(timeStep, spawn);

        grid.populate(agents);

        surface.bind();
        surface.clear();

        for (const agent of agents)
            agent.drawMembrane(myr);
    };

    this.draw = () => {
        //grid.draw(myr);

        liquid.draw();
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
                "color = vec4(0.4, 0.5, 0.7, 0.8);" +
                "if (sourcePixel.a < 0.25)" +
                    "color = vec4(0.7, 0.8, 0.9, sourcePixel.a);" +
                "else if (sourcePixel.a > 0.5)" +
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

Bodies.SPAWN_TIME = 2;