const Bodies = function(myr, width, height) {
    const voronoi = new Voronoi(myr, width, height, Agent.RADIUS + Agent.MEMBRANE_OFFSET);
    const shader = Bodies.makeShader(myr, width, height);
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
        //grid.draw(myr);

        liquid.draw();
        shader.setSurface("source", voronoi.getSurface());
        shader.draw(0, 0);

        for (const agent of agents)
            agent.drawBody(myr);
    };

    this.free = () => {
        voronoi.free();
        shader.free();
    };

    spawn(new Agent(new Myr.Vector(width * 0.5, height * 0.5)));
};

Bodies.makeShader = (myr, width, height) => {
    return new myr.Shader(
        "void main() {" +
            "const mediump vec2 size = vec2(" + width + ", " + height + ");" +
            "const lowp vec4 colorInner = " + GLSLUtils.colorToVec4(Bodies.COLOR_INNER) + ";" +
            "const lowp vec4 colorOuter = " + GLSLUtils.colorToVec4(Bodies.COLOR_OUTER) + ";" +
            "mediump vec4 sourcePixel = texture(source, uv);" +
            "mediump float distance = length((sourcePixel.rg - uv) * size);" +
            "if (distance < 32.0) {" +
                "if (texture(source, uv - pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(1, -1)).rg != sourcePixel.rg ||" +
                "    texture(source, uv + pixelSize * vec2(-1, 1)).rg != sourcePixel.rg)" +
                    "color = colorOuter * vec4(vec3(1), 0.3);" +
                "else " +
                    "color = vec4(mix(colorInner, colorOuter, distance / 32.0) * vec4(vec3(1), 0.3 + 0.6 * sourcePixel.b));" +
            "}" +
            "else " +
                "color = vec4(0);" +
        "}",
        [
            "source"
        ],
        []);
};

Bodies.SPAWN_TIME = 2;
Bodies.COLOR_INNER = StyleUtils.getColor("--color-membrane-inner");
Bodies.COLOR_OUTER = StyleUtils.getColor("--color-membrane-outer");