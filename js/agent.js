const Agent = function(position) {
    this.velocity = new Vector(0, 0);
    this.radius = 32;
    this.attraction = 10;

    this.collide = (agent, timeStep) => {
        const dx = position.x - agent.getPosition().x;
        const dy = position.y - agent.getPosition().y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < (agent.radius + this.radius) * (agent.radius + this.radius)) {
            const force = 1;
            let spacing = Math.sqrt(distanceSquared) - agent.radius - this.radius + this.attraction;

            if (spacing < 0)
                spacing = -Math.pow(-spacing, 1.3);

            const vx = dx * spacing * timeStep * force;
            const vy = dy * spacing * timeStep * force;

            this.velocity.x -= vx;
            this.velocity.y -= vy;
            agent.velocity.x += vx;
            agent.velocity.y += vy;
        }
    };

    this.getPosition = () => position;

    this.update = timeStep => {
        this.velocity.multiply(0.93);

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
        context.fillStyle = "cyan";
        context.beginPath();
        context.arc(0, 0, this.radius - this.attraction, 0, Math.PI + Math.PI);
        context.fill();
        context.restore();
    };
};

Agent.SEPARATION_SPEED = 50;