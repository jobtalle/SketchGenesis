const Genesis = function(width, height) {
    const lens = new Lens(Math.min(
        Math.floor(width * 0.5),
        Math.floor( height * 0.5)));

    this.update = timeStep => {
        lens.update(timeStep);
    };

    this.draw = context => {
        lens.draw(context);
    };
};