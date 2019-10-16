const Agent = function(position) {
    const velocity = new Vector(0, 0);

    this.getPosition = () => position;

    this.getPressure = () => 10;

    this.update = (timeStep, grid) => {
        velocity.add(grid.get(position.x, position.y).multiply(timeStep * 50));
        velocity.multiply(0.95);

        position.x += velocity.x * timeStep;
        position.y += velocity.y * timeStep;
    };

    this.draw = context => {
        context.save();
        context.translate(position.x, position.y);
        context.strokeStyle = "white";
        context.beginPath();
        context.arc(0, 0, 16, 0, Math.PI + Math.PI);
        context.stroke();
        context.restore();
    };
};