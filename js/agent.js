const Agent = function(position, divisions, parent = null) {
    let divisionTime = Agent.makeDivisionTime(divisions);

    this.velocity = new Myr.Vector(0, 0);
    this.position = position;
    this.alive = true;

    const split = spawn => {
        const direction = Math.random();
        const offset = new Myr.Vector(
            Math.cos(direction) * Agent.DIVISION_OFFSET,
            Math.sin(direction) * Agent.DIVISION_OFFSET);

        parent = null;

        const childPosition = position.copy();

        childPosition.add(offset);

        spawn(new Agent(childPosition, divisions, this));
    };

    this.collide = (agent, timeStep) => {
        const dx = this.position.x - agent.position.x;
        const dy = this.position.y - agent.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const radii = Agent.RADIUS + Agent.RADIUS;

        if (distanceSquared < radii * radii) {
            let spacing = Math.sqrt(distanceSquared) - radii + Agent.ATTRACTION_RADIUS;

            if (spacing < 0)
                spacing = -Math.pow(-spacing, Agent.REPULSION_POWER);
            else if (!this.alive || !agent.alive)
                return;

            const vx = dx * spacing * Agent.FORCE_MULTIPLIER * timeStep;
            const vy = dy * spacing * Agent.FORCE_MULTIPLIER * timeStep;

            this.velocity.x -= vx;
            this.velocity.y -= vy;
            agent.velocity.x += vx;
            agent.velocity.y += vy;
        }
    };

    this.update = (timeStep, spawn) => {
        if (this.alive) {
            this.velocity.x -= this.velocity.x * Agent.DAMPING_ALIVE;
            this.velocity.y -= this.velocity.y * Agent.DAMPING_ALIVE;
        }
        else {
            this.velocity.x -= this.velocity.x * Agent.DAMPING_DEAD;
            this.velocity.y -= this.velocity.y * Agent.DAMPING_DEAD;
        }

        this.position.x += this.velocity.x * timeStep;
        this.position.y += this.velocity.y * timeStep;

        if (divisionTime > 0 && (divisionTime -= timeStep) < 0) {
            if (divisions === 1) {
                parent = null;

                this.alive = false;
            }
            else {
                divisions = Math.ceil(divisions * 0.5);
                divisionTime = Agent.makeDivisionTime(divisions);

                split(spawn);
            }
        }

        if (parent !== null) {
            const dx = parent.position.x - this.position.x;
            const dy = parent.position.y - this.position.y;
            const dSquared = dx * dx + dy * dy;
            const dMax = Agent.RADIUS + Agent.RADIUS - Agent.ATTRACTION_RADIUS;

            if (dSquared > dMax * dMax) {
                const d = Math.sqrt(dSquared);
                const mx = (d - dMax) * dx / d;
                const my = (d - dMax) * dy / d;

                this.position.x += 0.5 * mx;
                this.position.y += 0.5 * my;
                parent.position.x -= 0.5 * mx;
                parent.position.y -= 0.5 * my;
            }
        }
    };

    this.draw = context => {
        context.save();
        context.translate(position.x, position.y);
        context.strokeStyle = "white";
        context.beginPath();
        context.arc(0, 0, Agent.RADIUS, 0, Math.PI + Math.PI);
        context.stroke();

        if (this.alive)
            context.fillStyle = "cyan";
        else
            context.fillStyle = "black";

        context.beginPath();
        context.arc(0, 0, Agent.RADIUS - Agent.ATTRACTION_RADIUS, 0, Math.PI + Math.PI);
        context.fill();
        context.restore();
    };
};

Agent.DAMPING_ALIVE = 0.05;
Agent.DAMPING_DEAD = 0.02;
Agent.RADIUS = 24;
Agent.ATTRACTION_RADIUS = 9;
Agent.DIVISION_TIME_MIN = 2;
Agent.DIVISION_TIME_MAX = 8;
Agent.DEAD_TIME_MIN = 20;
Agent.DEAD_TIME_MAX = 28;
Agent.DIVISION_OFFSET = 1;
Agent.FORCE_MULTIPLIER = 1.8;
Agent.REPULSION_POWER = 1.4;
Agent.makeDivisionTime = divisions => {
    if (divisions > 1)
        return Agent.DIVISION_TIME_MIN + (Agent.DIVISION_TIME_MAX - Agent.DIVISION_TIME_MIN) * Math.random();
    else
        return Agent.DEAD_TIME_MIN + (Agent.DEAD_TIME_MAX - Agent.DEAD_TIME_MIN) * Math.random();
};