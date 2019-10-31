const Lens = function(myr, radius, elementDialAngle, elementDialZoom) {
    const areaSize = (radius + radius) * Lens.WORKING_AREA_MULTIPLIER + (Agent.RADIUS + Agent.MEMBRANE_OFFSET) * 2;
    const renderSize = (radius + radius) * Lens.RESOLUTION;
    const projectionPadding = Math.ceil((Agent.RADIUS + Agent.MEMBRANE_OFFSET) * LensMotion.ZOOM_MAX);
    const bodies = new Bodies(myr, renderSize, renderSize, Lens.RESOLUTION, projectionPadding, areaSize, areaSize);
    const surface = new myr.Surface(renderSize, renderSize, 0, true, false);
    const displacement = Lens.makeDisplacement(myr, radius + radius);
    const overlay = Lens.makeOverlay(myr, radius + radius);
    const shader = Lens.makeShader(myr, surface, displacement, radius + radius);
    const x = Math.floor((myr.getWidth() - (radius + radius)) * 0.5);
    const y = Math.floor((myr.getHeight() - (radius + radius)) * 0.5);
    const transform = new Myr.Transform();
    const dialAngle = new Dial(
        elementDialAngle,
        radius,
        Math.ceil(Lens.DIAL_THICKNESS * radius),
        true);
    const dialZoom = new Dial(
        elementDialZoom,
        radius + dialAngle.getSize() - 1,
        Math.ceil(Lens.DIAL_THICKNESS * radius),
        false);
    const motion = new LensMotion(
        areaSize,
        Agent.RADIUS + Agent.MEMBRANE_OFFSET,
        radius,
        Lens.RESOLUTION,
        transform,
        bodies.getGrid(),
        dialAngle,
        dialZoom);

    this.update = timeStep => {
        motion.update(timeStep);
        bodies.update(timeStep, transform);

        surface.bind();
        bodies.draw(motion.getZoom());
    };

    this.draw = () => {
        shader.draw(x, y);
        overlay.draw(x, y);
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
            "const lowp float cutoff = " + Lens.CUTOFF.toFixed(2) + ";" +
            "lowp float dx = uv.x - 0.5;" +
            "lowp float dy = uv.y - 0.5;" +
            "lowp float distSquared = dx * dx + dy * dy;" +
            "if (distSquared> 0.25)" +
                "color = vec4(0);" +
            "else {" +
                "lowp float dist = sqrt(distSquared) * 2.0;" +
                "if (dist < cutoff)" +
                    "color = vec4(" +
                        "0.5 + dx * " + cutoffCompensation + "," +
                        "0.5 + dy * " + cutoffCompensation + "," +
                        "0, 1);" +
                "else {" +
                    "lowp float factor = cutoff + (dist - cutoff) + " +
                        powerCompensation + " * (dist - cutoff) * (dist - cutoff);" +
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
    shader.free();

    return surface;
};

Lens.makeOverlay = (myr, diameter) => {
    const surface = new myr.Surface(diameter, diameter);
    const shader = new myr.Shader(
        "void main() {" +
            "const lowp float cutoff = " + Lens.CUTOFF.toFixed(2) + ";" +
            "const lowp vec4 backgroundColor = " + GLSLUtils.colorToVec4(Lens.COLOR_BACKGROUND) + ";" +
            "const lowp float flareThreshold = " + Lens.FLARE_THRESHOLD.toFixed(2) + ";" +
            "const lowp float flarePower = " + Lens.FLARE_POWER.toFixed(2) + ";" +
            "const lowp vec4 flareColor = " + GLSLUtils.colorToVec4(Lens.FLARE_COLOR) + ";" +
            "const lowp float borderPower = " + Lens.BORDER_POWER.toFixed(2) + ";" +
            "const lowp float borderInfluence = " + Lens.BORDER_INFLUENCE.toFixed(2) + ";" +
            "lowp vec3 light = normalize(vec3(-0.3, 0.3, -0.5));" +
            "lowp vec2 xy = 2.0 * (uv - 0.5);" +
            "lowp float radius = length(xy);" +
            "lowp vec3 n = normalize(vec3(xy, sqrt(1.0 - dot(xy, xy)) * " +
                Lens.FLATNESS.toFixed(2) + "));" +
            "lowp float dotLight = dot(light, -n);" +
            "color = vec4(0);" +
            "if (radius > cutoff) {" +
                "if (radius > 1.0)" +
                    "color = vec4(0);" +
                "else {" +
                    "lowp float cutoffFactor = (1.0 / (1.0 - cutoff)) * (radius - cutoff);" +
                    "color = vec4(backgroundColor.rgb, pow(cutoffFactor, borderPower) * borderInfluence);" +
                "}" +
            "}" +
            "if (dotLight > flareThreshold) {" +
                "lowp float flareFactor =  (1.0 / (1.0 - flareThreshold)) * (dotLight - flareThreshold);" +
                "color = mix(color, flareColor, pow(flareFactor, flarePower));" +
            "}" +
        "}",
        [],
        []);

    surface.bind();
    shader.setSize(diameter, diameter);
    shader.draw(0, 0);
    shader.free();

    return surface;
};

Lens.makeShader = (myr, surface, displacement) => {
    const shader = new myr.Shader(
        "void main() {" +
            "mediump vec4 sourceUV = texture(displacement, uv);" +
            "lowp vec4 sourcePixel = texture(source, sourceUV.rg);" +
            "color = vec4(sourcePixel.rgb, sourcePixel.a * sourceUV.a);" +
        "}",
        [
            "source",
            "displacement"
        ],
        []);

    shader.setSurface("source", surface);
    shader.setSurface("displacement", displacement);
    shader.setSize(
        shader.getWidth() / Lens.RESOLUTION,
        shader.getHeight() / Lens.RESOLUTION);

    return shader;
};

Lens.DIAL_THICKNESS = 0.12;
Lens.RESOLUTION = 0.7;
Lens.CUTOFF = 0.85;
Lens.WORKING_AREA_MULTIPLIER = 2;
Lens.COLOR_BACKGROUND = StyleUtils.getColor("--color-background");
Lens.FLATNESS = 1;
Lens.FLARE_THRESHOLD = 0.5;
Lens.FLARE_POWER = 6;
Lens.FLARE_COLOR = StyleUtils.getColor("--color-flare");
Lens.BORDER_POWER = 1.7;
Lens.BORDER_INFLUENCE = 0.9;