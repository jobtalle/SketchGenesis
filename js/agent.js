const Agent = function(position, divisions) {
    let divisionTime = divisions === 1 ? -1 : Agent.DIVISION_TIME_MIN + (Agent.DIVISION_TIME_MAX - Agent.DIVISION_TIME_MIN) * Math.random();

    this.velocity = new Vector(0, 0);
    this.radius = 24;
    this.attraction = 8;
    this.position = position;

    const split = spawn => {
        const direction = Math.random();
        const offset = new Vector(
            Math.cos(direction) * Agent.DIVISION_OFFSET,
            Math.sin(direction) * Agent.DIVISION_OFFSET);

        spawn(
            this.position.x,
            this.position.y + 0.5,
            new Agent(position.copy().add(offset), divisions));
    };

    this.collide = (agent, timeStep) => {
        const dx = this.position.x - agent.position.x;
        const dy = this.position.y - agent.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const radii = agent.radius + this.radius;

        if (distanceSquared < radii * radii) {
            let spacing = Math.sqrt(distanceSquared) - radii + this.attraction;

            if (spacing < 0)
                spacing = -Math.pow(-spacing, Agent.REPULSION_POWER);

            const vx = dx * spacing * Agent.ATTRACTION_MULTIPLIER * timeStep;
            const vy = dy * spacing * Agent.ATTRACTION_MULTIPLIER * timeStep;

            this.velocity.x -= vx;
            this.velocity.y -= vy;
            agent.velocity.x += vx;
            agent.velocity.y += vy;
        }
    };

    this.update = (timeStep, spawn) => {
        this.velocity.multiply(0.94);
        this.position.x += this.velocity.x * timeStep;
        this.position.y += this.velocity.y * timeStep;

        if (divisionTime > 0 && (divisionTime -= timeStep) < 0) {
            divisions = Math.ceil(divisions * 0.5);

            split(spawn);

            if (divisions !== 1)
                divisionTime = Agent.DIVISION_TIME_MIN + (Agent.DIVISION_TIME_MAX - Agent.DIVISION_TIME_MIN) * Math.random();
        }
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

Agent.DIVISION_TIME_MIN = 2;
Agent.DIVISION_TIME_MAX = 8;
Agent.DIVISION_OFFSET = 1;
Agent.ATTRACTION_MULTIPLIER = 1.5;
Agent.REPULSION_POWER = 1.3;