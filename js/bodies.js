const Bodies = function(myr, width, height, workingWidth, workingHeight) {
    const ramp = Bodies.makeRamp(myr);
    const voronoi = new Voronoi(myr, width, height, Agent.RADIUS + Agent.MEMBRANE_OFFSET);
    const shader = Bodies.makeShader(myr, width, height, ramp);
    const grid = new Grid(workingWidth, workingHeight);
    const liquid = new Liquid(myr, width, height, grid);
    const agents = [];
    let spawnTime = 0;

    let t; // TODO: Debug matrix for rendering

    const spawn = agent => {
        agents.push(agent);
    };

    this.update = (timeStep, transform) => {
        t = transform;
        grid.update(timeStep);
        liquid.update(timeStep, transform);

        if ((spawnTime -= timeStep) < 0) {
            spawnTime += Bodies.SPAWN_TIME;

            const position = grid.findSpawnLocation();

            if (position)
                spawn(new Agent(position, 32));
        }

        for (let i = agents.length; i-- > 0;)
            agents[i].update(timeStep, spawn);

        grid.populate(agents);

        voronoi.prime(transform);

        for (const agent of agents)
            voronoi.addSeed(agent.position, agent.getLife());

        voronoi.apply();
    };

    this.draw = () => {
        liquid.draw();

        myr.push();
        myr.transform(t);
        grid.draw(myr);
        myr.pop();

        shader.setSurface("source", voronoi.getSurface());
        shader.draw(0, 0);
    };

    this.free = () => {
        voronoi.free();
        shader.free();
        ramp.free();
        liquid.free();
    };

    spawn(new Agent(new Myr.Vector(workingWidth * 0.5, workingHeight * 0.5)));
};

Bodies.makeRamp = myr => {
    const surface = new myr.Surface(Bodies.RAMP_SIZE_U, Bodies.RAMP_SIZE_V);
    const xCore = surface.getWidth() * Bodies.RADIUS_CORE / (Agent.RADIUS + Agent.MEMBRANE_OFFSET);
    const xBorder = surface.getWidth() * (1 - Bodies.RADIUS_BORDER / (Agent.RADIUS + Agent.MEMBRANE_OFFSET));

    surface.bind();

    myr.primitives.fillRectangleGradient(
        Bodies.COLOR_CORE_DEAD,
        Bodies.COLOR_CORE_DEAD,
        Bodies.COLOR_CORE,
        Bodies.COLOR_CORE,
        0,
        0,
        xCore,
        surface.getHeight());
    myr.primitives.fillRectangleGradient(
        Bodies.COLOR_INNER_DEAD,
        Bodies.COLOR_OUTER_DEAD,
        Bodies.COLOR_INNER,
        Bodies.COLOR_OUTER,
        xCore,
        0,
        xBorder - xCore,
        surface.getHeight());
    myr.primitives.fillRectangleGradient(
        Bodies.COLOR_BORDER_DEAD,
        Bodies.COLOR_BORDER_DEAD,
        Bodies.COLOR_BORDER,
        Bodies.COLOR_BORDER,
        xBorder,
        0,
        surface.getWidth() - xBorder,
        surface.getHeight());

    return surface;
};

Bodies.makeShader = (myr, width, height, ramp) => {
    const shader = new myr.Shader(
        "void main() {" +
            "const mediump vec2 size = vec2(" + width + ", " + height + ");" +
            "const mediump float radius = " + (Agent.RADIUS + Agent.MEMBRANE_OFFSET).toFixed(2) + ";" +
            "lowp vec4 sourcePixel = texture(source, uv);" +
            "mediump float distance = length((sourcePixel.rg - uv) * size);" +
            "if (distance < radius) {" +
                "lowp float u;" +
                "if (texture(source, uv - pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(1, -1)).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(-1, 1)).rg != sourcePixel.rg)" +
                    "u = 1.0;" +
                "else " +
                    "u = distance / radius;" +
                "color = texture(colorRamp, vec2(u, sourcePixel.b));" +
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
Bodies.RADIUS_CORE = 2;
Bodies.RADIUS_BORDER = 2.5;
Bodies.COLOR_CORE = StyleUtils.getColor("--color-core");
Bodies.COLOR_CORE_DEAD = StyleUtils.getColor("--color-core-dead");
Bodies.COLOR_BORDER = StyleUtils.getColor("--color-membrane-border");
Bodies.COLOR_BORDER_DEAD = StyleUtils.getColor("--color-membrane-border-dead");
Bodies.COLOR_INNER = StyleUtils.getColor("--color-membrane-inner");
Bodies.COLOR_INNER_DEAD = StyleUtils.getColor("--color-membrane-inner-dead");
Bodies.COLOR_OUTER = StyleUtils.getColor("--color-membrane-outer");
Bodies.COLOR_OUTER_DEAD = StyleUtils.getColor("--color-membrane-outer-dead");