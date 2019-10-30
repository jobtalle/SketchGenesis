const Genesis = function(myr) {
    const lens = new Lens(myr, Math.floor(myr.getWidth() * 0.5));

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