const Bodies = function(myr, width, height) {
    const ramp = Bodies.makeRamp(myr);
    const voronoi = new Voronoi(myr, width, height, Agent.RADIUS + Agent.MEMBRANE_OFFSET);
    const shader = Bodies.makeShader(myr, width, height, ramp);
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

        voronoi.prime();

        for (const agent of agents)
            voronoi.addSeed(agent.position, agent.getLife());

        voronoi.apply();
    };

    this.draw = () => {
        liquid.draw();
        shader.setSurface("source", voronoi.getSurface());
        shader.draw(0, 0);
    };

    this.free = () => {
        voronoi.free();
        shader.free();
        ramp.free();
    };

    spawn(new Agent(new Myr.Vector(width * 0.5, height * 0.5)));
};

Bodies.makeRamp = myr => {
    const surface = new myr.Surface(Bodies.RAMP_SIZE_U, Bodies.RAMP_SIZE_V, 0, true, false);

    surface.bind();

    myr.primitives.fillRectangleGradient(
        Bodies.COLOR_INNER_DEAD,
        Bodies.COLOR_OUTER_DEAD,
        Bodies.COLOR_INNER,
        Bodies.COLOR_OUTER,
        0,
        0,
        surface.getWidth(),
        surface.getHeight());
    myr.primitives.fillRectangleGradient(
        Bodies.COLOR_CORE_DEAD,
        Bodies.COLOR_CORE_DEAD,
        Bodies.COLOR_CORE,
        Bodies.COLOR_CORE,
        0,
        0,
        8,
        surface.getHeight());

    return surface;
};

Bodies.makeShader = (myr, width, height, ramp) => {
    const shader = new myr.Shader(
        "void main() {" +
            "const mediump vec2 size = vec2(" + width + ", " + height + ");" +
            "lowp vec4 sourcePixel = texture(source, uv);" +
            "mediump float distance = length((sourcePixel.rg - uv) * size);" +
            "if (distance < 32.0) {" +
                "mediump float sampleAt;" +
                "if (texture(source, uv - pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(1, -1)).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(-1, 1)).rg != sourcePixel.rg)" +
                    "sampleAt = 1.0;" +
                "else " +
                    "sampleAt = distance / 32.0;" +
                "color = texture(colorRamp, vec2(sampleAt, sourcePixel.b));" +
            "}" +
            "else " +
                "color = vec4(0);" +
        "}",
        [
            "source",
            "colorRamp"
        ],
        []);

    shader.setSurface("colorRamp", ramp);

    return shader;
};

Bodies.RAMP_SIZE_U = 128;
Bodies.RAMP_SIZE_V = 32;
Bodies.SPAWN_TIME = 2;
Bodies.COLOR_CORE = Myr.Color.BLACK;
Bodies.COLOR_CORE_DEAD = new Myr.Color(0, 0, 0, 0);
Bodies.COLOR_INNER = StyleUtils.getColor("--color-membrane-inner");
Bodies.COLOR_INNER_DEAD = StyleUtils.getColor("--color-membrane-inner-dead");
Bodies.COLOR_OUTER = StyleUtils.getColor("--color-membrane-outer");
Bodies.COLOR_OUTER_DEAD = StyleUtils.getColor("--color-membrane-outer-dead");