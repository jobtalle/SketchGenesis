const Liquid = function(myr, grid) {
    const Particle = function() {
        this.position = new Myr.Vector(grid.getWidth() * Math.random(), grid.getHeight() * Math.random());
        this.velocity = new Myr.Vector(0, 0);
        this.damping = Particle.DAMPING_MIN + (Particle.DAMPING_MAX - Particle.DAMPING_MIN) * Math.random();
        this.alpha = 1;
    };

    Particle.prototype.update = function(timeStep) {
        this.position.x += this.velocity.x * timeStep;
        this.position.y += this.velocity.y * timeStep;
        this.velocity.x -= this.velocity.x * this.damping;
        this.velocity.y -= this.velocity.y * this.damping;

        if (this.position.x < 0 ||
            this.position.x >= grid.getWidth() ||
            this.position.y < 0 ||
            this.position.y > grid.getHeight()) {
            this.position.x = grid.getWidth() * Math.random();
            this.position.y = grid.getHeight() * Math.random();
            this.alpha = 0;
        }
        else if (this.alpha !== 1)
            if ((this.alpha += timeStep * Particle.ALPHA_INCREASE) > 1)
                this.alpha = 1;
    };

    Particle.LIFE_MIN = 2;
    Particle.LIFE_MAX = 5;
    Particle.DAMPING_MIN = 0.005;
    Particle.DAMPING_MAX = 0.02;
    Particle.ALPHA_INCREASE = 0.2;

    const particleColorInner = Liquid.COLOR_INNER.copy();
    const particles = new Array(Math.ceil(grid.getWidth() * grid.getHeight() * Liquid.PARTICLES_PER_PIXEL));
    const surface = new myr.Surface(grid.getWidth(), grid.getHeight());

    this.update = timeStep => {
        surface.bind();
        surface.clear();

        for (const particle of particles) {
            grid.getFlow().apply(particle.position.x, particle.position.y, particle.velocity, timeStep * 0.1);
            particle.update(timeStep);
            particleColorInner.a = particle.alpha * Liquid.COLOR_INNER.a;

            myr.primitives.fillCircleGradient(
                particleColorInner,
                Liquid.COLOR_OUTER,
                particle.position.x,
                particle.position.y,
                Liquid.RADIUS);
        }
    };

    this.draw = () => {
        surface.draw(0, 0);
    };

    this.free = () => {
        surface.free();
    };

    for (let i = 0; i < particles.length; ++i)
        particles[i] = new Particle();
};

Liquid.RADIUS = 80;
Liquid.COLOR_INNER = new Myr.Color(0.4, 0.8, 0.4, 0.05);
Liquid.COLOR_OUTER = new Myr.Color(Liquid.COLOR_INNER.r, Liquid.COLOR_INNER.g, Liquid.COLOR_INNER.b, 0);
Liquid.PARTICLES_PER_PIXEL = 0.0005;