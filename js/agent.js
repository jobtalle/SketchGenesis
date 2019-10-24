const Agent = function(position, divisions = Agent.makeDivisionCount(), parent = null) {
    const membraneColor = new Myr.Color(0, 0, 0, 1);
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

        if ((divisionTime -= timeStep) < 0 && this.alive) {
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

    this.drawMembrane = myr => {
        if (!this.alive)
            membraneColor.a = Math.max(0, 1 + divisionTime / Agent.DEATH_FADE);

        myr.primitives.fillCircleGradient(
            membraneColor,
            Agent.COLOR_MEMBRANE_LOW,
            position.x,
            position.y,
            Agent.RADIUS + Agent.MEMBRANE_OFFSET);
    };

    this.drawBody = myr => {
        myr.primitives.fillCircle(
            Myr.Color.BLACK,
            position.x,
            position.y,
            2);
    };
};

Agent.makeDivisionCount = () => {
    return Math.round(Agent.DIVISIONS_MIN + (Agent.DIVISIONS_MAX - Agent.DIVISIONS_MIN) * Math.pow(Math.random(), Agent.DIVISIONS_POWER));
};

Agent.makeDivisionTime = divisions => {
    if (divisions > 1)
        return Agent.DIVISION_TIME_MIN + (Agent.DIVISION_TIME_MAX - Agent.DIVISION_TIME_MIN) * Math.random();
    else
        return Agent.DEAD_TIME_MIN + (Agent.DEAD_TIME_MAX - Agent.DEAD_TIME_MIN) * Math.random();
};

Agent.COLOR_MEMBRANE_LOW = new Myr.Color(0, 0, 0, 0);
Agent.MEMBRANE_OFFSET = 14;
Agent.DEATH_FADE = 5;
Agent.DIVISIONS_MIN = 32;
Agent.DIVISIONS_MAX = 128;
Agent.DIVISIONS_POWER = 2;
Agent.DAMPING_ALIVE = 0.05;
Agent.DAMPING_DEAD = 0.015;
Agent.RADIUS = 24;
Agent.ATTRACTION_RADIUS = 9;
Agent.DIVISION_TIME_MIN = 2;
Agent.DIVISION_TIME_MAX = 8;
Agent.DEAD_TIME_MIN = 30;
Agent.DEAD_TIME_MAX = 35;
Agent.DIVISION_OFFSET = 1;
Agent.FORCE_MULTIPLIER = 1.8;
Agent.REPULSION_POWER = 1.4;