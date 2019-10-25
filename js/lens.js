const Lens = function(myr, radius) {
    const bodies = new Bodies(myr, radius + radius, radius + radius);
    const surface = new myr.Surface(radius + radius, radius + radius, 0, true, false);
    const displacement = Lens.makeDisplacement(myr, radius + radius);
    const shader = Lens.makeShader(myr, surface, displacement, radius + radius);
    const x = Math.floor((myr.getWidth() - (radius + radius)) * 0.5);
    const y = Math.floor((myr.getHeight() - (radius + radius)) * 0.5);

    this.update = timeStep => {
        bodies.update(timeStep);
        surface.bind();
        bodies.draw();

        //myr.primitives.drawCircle(Myr.Color.RED, radius, radius, radius);
    };

    this.draw = () => {
        shader.draw(x, y);
    };

    this.free = () => {
        shader.free();
        bodies.free();
        surface.free();
        displacement.free();
    };
};

Lens.makeDisplacement = (myr, diameter) => {
    const surface = new myr.Surface(diameter, diameter, 1, false, false);
    const cutoffCompensation = 1 / (2 - Lens.CUTOFF);
    const powerCompensation = 1 / (1 - Lens.CUTOFF);
    const shader = new myr.Shader(
        "void main() {" +
            "mediump float dx = uv.x - 0.5;" +
            "mediump float dy = uv.y - 0.5;" +
            "mediump float distSquared = dx * dx + dy * dy;" +
            "if (distSquared> 0.25)" +
                "color = vec4(0);" +
            "else {" +
                "mediump float dist = sqrt(distSquared) * 2.0;" +
                "mediump float cutoff = " + Lens.CUTOFF + ";" +
                "if (dist < cutoff)" +
                    "color = vec4(" +
                        "0.5 + dx * " + cutoffCompensation + "," +
                        "0.5 + dy * " + cutoffCompensation + "," +
                        "0, 1);" +
                "else {" +
                    "mediump float factor = " + Lens.CUTOFF + " + (dist - " + Lens.CUTOFF + " + " +
                        powerCompensation + " * (dist - " + Lens.CUTOFF + ") * (dist - " + Lens.CUTOFF + "));" +
                    "color = vec4(" +
                        "0.5 + dx * " + cutoffCompensation + " * factor / dist," +
                        "0.5 + dy * " + cutoffCompensation + " * factor / dist," +
                        "0, 1);" +
                "}" +
            "}" +
        "}",
        [],
        []);

    surface.bind();

    shader.setSize(diameter, diameter);
    shader.draw(0, 0);

    myr.bind();
    shader.free();

    return surface;
};

Lens.makeShader = (myr, surface, displacement) => {
    const shader = new myr.Shader(
        "void main() {" +
            "highp vec4 sourceUV = texture(displacement, uv);" +
            "mediump vec4 sourcePixel = texture(source, sourceUV.rg);" +
            "color = vec4(sourcePixel.rgb, sourcePixel.a * sourceUV.a);" +
        "}",
        [
            "source",
            "displacement"
        ],
        []);

    shader.setSurface("source", surface);
    shader.setSurface("displacement", displacement);

    return shader;
};

Lens.CUTOFF = 0.9;