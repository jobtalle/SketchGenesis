const Bodies = function(myr, width, height, resolution, padding, workingWidth, workingHeight) {
    const ramp = Bodies.makeRamp(myr);
    const voronoi = new Voronoi(myr, width, height, padding * resolution);
    const shader = Bodies.makeShader(myr, width, height, ramp);
    const grid = new Grid(workingWidth, workingHeight);
    const liquid = new Liquid(myr, width, height, grid);
    const agents = [];
    let spawnTime = 0;

    const initialize = () => {
        const agentCount = Math.ceil(Bodies.INITIAL_AGENTS_PER_PIXEL * workingWidth * workingHeight);

        for (let i = 0; i < agentCount; ++i)
            spawn(new Agent(new Myr.Vector(workingWidth * Math.random(), workingHeight * Math.random())));

        spawn(new Agent(new Myr.Vector(workingWidth * 0.5, workingHeight * 0.5)));
    };

    const spawn = agent => {
        agents.push(agent);
    };

    const findSpawnLocation = transform => {
        const radius = Math.max(width, height) * 0.5 + padding;
        const vector = new Myr.Vector(0, 0);
        const transformed = new Myr.Vector(0, 0);

        for (let i = 0; i < Bodies.SPAWN_ATTEMPTS; ++i) {
            transformed.x = vector.x = Math.random() * workingWidth;
            transformed.y = vector.y = Math.random() * workingHeight;

            transform.apply(transformed);

            transformed.x -= radius;
            transformed.y -= radius;

            if (transformed.length() > radius)
                return vector;
        }

        return null;
    };

    this.getGrid = () => grid;

    this.update = (timeStep, transform) => {
        grid.update(timeStep);
        liquid.update(timeStep, transform);

        if ((spawnTime -= timeStep) < 0) {
            spawnTime += Bodies.SPAWN_TIME;

            const position = findSpawnLocation(transform);

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

    this.draw = zoom => {
        liquid.draw();
        shader.setSurface("source", voronoi.getSurface());
        shader.setVariable("zoom", zoom * resolution);
        shader.draw(-voronoi.getMaxDistance(), -voronoi.getMaxDistance());
    };

    this.free = () => {
        voronoi.free();
        shader.free();
        ramp.free();
        liquid.free();
    };

    initialize();
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
            "mediump float radius = " + (Agent.RADIUS + Agent.MEMBRANE_OFFSET).toFixed(2) + " * zoom;" +
            "lowp vec4 sourcePixel = texture(source, uv);" +
            "mediump float distance = length((sourcePixel.rg - uv) * size);" +
            "if (distance < radius) {" +
                "lowp float u;" +
                "if (texture(source, uv + pixelSize * vec2(-1, -1)).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(1, -1)).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(1, 1)).rg != sourcePixel.rg ||" +
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
        [
            "zoom"
        ]);

    shader.setSurface("colorRamp", ramp);

    return shader;
};

Bodies.INITIAL_AGENTS_PER_PIXEL = 1 / 300000;
Bodies.SPAWN_ATTEMPTS = 10;
Bodies.RAMP_SIZE_U = 128;
Bodies.RAMP_SIZE_V = 32;
Bodies.SPAWN_TIME = 2.5;
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