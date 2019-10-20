const Genesis = function(myr, width, height) {
    const lens = new Lens(myr, Math.min(
        Math.floor(width * 0.5),
        Math.floor( height * 0.5)));

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