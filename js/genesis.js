const Genesis = function(myr, elementDialAngle, elementDialZoom) {
    const lens = new Lens(myr, Math.floor(myr.getWidth() * 0.5), elementDialAngle, elementDialZoom);

    this.update = timeStep => {
        lens.update(timeStep);
    };

    this.draw = () => {
        lens.draw();
    };

    this.free = () => {
        lens.free();
    };
};