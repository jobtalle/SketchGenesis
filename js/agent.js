const Agent = function(position) {
    this.velocity = new Vector(0, 0);
    this.radius = 24;

    this.collide = (agent, timeStep) => {
        const dx = position.x - agent.getPosition().x;
        const dy = position.y - agent.getPosition().y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < (agent.radius + this.radius) * (agent.radius + this.radius)) {
            const spacing = Math.sqrt(distanceSquared) - agent.radius - this.radius + 5;
            const vx = dx * spacing * timeStep;
            const vy = dy * spacing * timeStep;

            this.velocity.x -= vx;
            this.velocity.y -= vy;
            agent.velocity.x += vx;
            agent.velocity.y += vy;
        }
    };

    this.getPosition = () => position;

    this.update = (timeStep, grid) => {
        this.velocity.multiply(0.95);

        position.x += this.velocity.x * timeStep;
        position.y += this.velocity.y * timeStep;
    };

    this.draw = context => {
        context.save();
        context.translate(position.x, position.y);
        context.strokeStyle = "white";
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI + Math.PI);
        context.stroke();
        context.restore();
    };
};