const Voronoi = function(myr, width, height) {
    const color = new Myr.Color(0, 0, 1, 1);
    const shader = Voronoi.makeShader(myr);
    const surfaces = [
        new myr.Surface(width, height, 1, false, false),
        new myr.Surface(width, height, 1, false, false)];
    let front = 0;
    let maxStep = 1;

    this.prime = () => {
        surfaces[1 - front].bind();
        surfaces[1 - front].clear();
        surfaces[front].bind();
        surfaces[front].clear();
    };

    this.addSeed = position => {
        color.r = position.x / width;
        color.g = position.y / height;

        myr.primitives.drawPoint(color, position.x, position.y);
    };

    this.apply = () => {
        let step = maxStep;

        while (step !== 0.5) {
            shader.setSurface("source", surfaces[front]);
            shader.setVariable("step", step);

            front = 1 - front;

            surfaces[front].bind();
            shader.draw(0, 0);

            step *= 0.5;
        }
    };

    this.getSurface = () => {
        return surfaces[front];
    };

    this.free = () => {
        for (const surface of surfaces)
            surface.free();

        shader.free();
    };

    for (const surface of surfaces)
        surface.setClearColor(Voronoi.CLEAR_COLOR);

    while (maxStep < width || maxStep < height)
        maxStep <<= 1;

    maxStep >>= 1;
};

Voronoi.makeShader = myr => {
    return new myr.Shader(
        "void main() {" +
            "mediump float bestDistance = 10000.0;" +
            "mediump vec4 bestSample = vec4(0);" +
            "for (int y = -1; y < 2; ++y) {" +
                "for (int x = -1; x < 2; ++x) {" +
                    "mediump vec4 pixel = texture(source, uv + vec2(x, y) * step * pixelSize);" +
                    "mediump float distance = length(pixel.xy - uv);" +
                    "if (pixel.a != 0.0 && distance < bestDistance) {" +
                        "bestDistance = distance;" +
                        "bestSample = pixel;" +
                    "}" +
                "}" +
            "}" +
            "if (bestSample.a != 0.0)" +
                "color = bestSample;" +
            "else " +
                "color = vec4(0);" +
        "}",
        [
            "source"
        ],
        [
            "step"
        ]);
};

Voronoi.CLEAR_COLOR = new Myr.Color(0, 0, 0, 0);