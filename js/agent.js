const Agent = function(position) {
    this.velocity = new Vector(0, 0);
    this.radius = 24;
    this.attraction = 8;
    this.position = position;

    this.collide = (agent, timeStep) => {
        const dx = this.position.x - agent.position.x;
        const dy = this.position.y - agent.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const radii = agent.radius + this.radius;

        if (distanceSquared < radii * radii) {
            const force = 2;
            let spacing = Math.sqrt(distanceSquared) - radii + this.attraction;

            if (spacing < 0)
                spacing = -Math.pow(-spacing, Agent.REPULSION_POWER);

            const vx = dx * spacing * timeStep * force;
            const vy = dy * spacing * timeStep * force;

            this.velocity.x -= vx;
            this.velocity.y -= vy;
            agent.velocity.x += vx;
            agent.velocity.y += vy;
        }
    };

    this.update = timeStep => {
        this.velocity.multiply(0.94);
        this.position.x += this.velocity.x * timeStep;
        this.position.y += this.velocity.y * timeStep;
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

Agent.REPULSION_POWER = 1.4;