const Dial = function(element, radius, thickness, innerShade) {
    const build = () => {
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
                Dial.TICK_COLOR,
                "round"));
        }

        if (innerShade)
            element.appendChild(SVGUtils.drawCircle(
                0,
                0,
                radius + Dial.SHADE_THICKNESS * 0.5,
                Dial.SHADE_THICKNESS,
                Dial.SHADE_COLOR));
        element.appendChild(SVGUtils.drawCircle(
            0,
            0,
            radius + thickness + Dial.BORDER_THICKNESS * 0.5 - 1,
            Dial.BORDER_THICKNESS,
            Dial.BORDER_COLOR));
    };

    this.getSize = () => radius * Dial.RING_THICKNESS + Dial.BORDER_THICKNESS;

    this.setAngle = angle => {
        element.style.transform = "rotate(" + angle + "rad)";
    };

    build();
};

Dial.RING_THICKNESS = 0.12;
Dial.RING_COLOR = StyleUtils.getVariable("--color-dial-ring");
Dial.BORDER_COLOR = StyleUtils.getVariable("--color-dial-ring-border");
Dial.BORDER_THICKNESS = 6;
Dial.SHADE_COLOR = StyleUtils.getVariable("--color-dial-shade");
Dial.SHADE_THICKNESS = 1.5;
Dial.TICK_THICKNESS = Dial.BORDER_THICKNESS;
Dial.TICK_LENGTH = 0.3;
Dial.TICK_SPACING = 28;
Dial.TICK_COLOR = StyleUtils.getVariable("--color-dial-tick");