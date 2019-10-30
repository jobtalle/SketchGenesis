const SVGUtils = {
    drawCircle: function(x, y, radius, thickness, color) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        element.setAttribute("cx", x);
        element.setAttribute("cy", y);
        element.setAttribute("r", radius);
        element.setAttribute("stroke", color);
        element.setAttribute("stroke-width", thickness);
        element.setAttribute("fill", "none");

        return element;
    },
    drawLine: function(x1, y1, x2, y2, thickness, color, linecap) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", "path");

        element.setAttribute("stroke", color);
        element.setAttribute("stroke-width", thickness);
        element.setAttributeNS(null, "d", "M" + x1 + " " + y1 + " L" + x2 + " " + y2);

        if (linecap)
            element.setAttribute("stroke-linecap", linecap);

        return element;
    }
};