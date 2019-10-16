const Pressure = function(width, height) {
    const grid = new Grid(width, height);

    this.update = timeStep => {

    };

    this.draw = context => {
        grid.draw(context);
    };
};