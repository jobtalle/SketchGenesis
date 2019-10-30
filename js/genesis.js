const Genesis = function(myr, elementDial) {
    const lens = new Lens(myr, Math.floor(myr.getWidth() * 0.5), elementDial);

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