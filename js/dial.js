const Dial = function(element, radius) {
    const build = () => {
        const thickness = radius * Dial.RING_THICKNESS;
        const circumference = Math.PI * 2 * radius;
        const ticks = Math.ceil(circumference / Dial.TICK_SPACING);

        while (element.firstChild)
            element.removeChild(element.firstChild);

        element.appendChild(SVGUtils.drawCircle(0, 0, radius + thickness * 0.5, thickness,"gray"));

        for (let i = 0; i < ticks; ++i) {
            const angle = Math.PI * 2 * i / ticks;
            const c = Math.cos(angle);
            const s = Math.sin(angle);

            element.appendChild(SVGUtils.drawLine(
                c * (radius + thickness),
                s * (radius + thickness),
                c * (radius + thickness * (1 - Dial.TICK_LENGTH)),
                s * (radius + thickness * (1 - Dial.TICK_LENGTH)),
                Dial.TICK_THICKNESS,
                "white"));
        }
    };

    this.setAngle = angle => {
        element.style.transform = "rotate(" + (angle) + "rad)";
    };

    build();
};

Dial.RING_THICKNESS = 0.1;
Dial.ANGLE_FACTOR = 0.1;
Dial.TICK_THICKNESS = 2;
Dial.TICK_LENGTH = 0.7;
Dial.TICK_SPACING = 32;