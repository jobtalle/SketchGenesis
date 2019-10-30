const Dial = function(element, radius) {
    const build = () => {
        const thickness = radius * Dial.RING_THICKNESS;
        const circumference = Math.PI * 2 * radius;
        const ticks = Math.ceil(circumference / Dial.TICK_SPACING);

        while (element.firstChild)
            element.removeChild(element.firstChild);

        element.appendChild(SVGUtils.drawCircle(
            0,
            0,
            radius + thickness * 0.5,
            thickness,
            Dial.RING_COLOR));

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
                Dial.TICK_COLOR));
        }

        element.appendChild(SVGUtils.drawCircle(
            0,
            0,
            radius + thickness + Dial.BORDER_THICKNESS * 0.5 - 1,
            Dial.BORDER_THICKNESS,
            Dial.BORDER_COLOR));
    };

    this.setAngle = angle => {
        element.style.transform = "rotate(" + (angle) + "rad)";
    };

    build();
};

Dial.ANGLE_FACTOR = 0.1;
Dial.RING_THICKNESS = 0.15;
Dial.RING_COLOR = StyleUtils.getVariable("--color-dial-ring");
Dial.BORDER_COLOR = StyleUtils.getVariable("--color-dial-ring-border");
Dial.BORDER_THICKNESS = 8;
Dial.TICK_THICKNESS = 2;
Dial.TICK_LENGTH = 0.65;
Dial.TICK_SPACING = 32;
Dial.TICK_COLOR = StyleUtils.getVariable("--color-dial-tick");