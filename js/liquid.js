const Liquid = function(myr, grid) {
    const Particle = function() {
        this.position = new Myr.Vector(grid.getWidth() * Math.random(), grid.getHeight() * Math.random());
        this.velocity = new Myr.Vector(0, 0);
        this.life = 1;
        this.lifeSpeed = 1 / (Liquid.PARTICLE_LIFE_MIN + (Liquid.PARTICLE_LIFE_MAX - Liquid.PARTICLE_LIFE_MIN) * Math.random());
    };

    const particleColorInner = Liquid.COLOR_INNER.copy();
    const particles = new Array(Math.ceil(grid.getWidth() * grid.getHeight() * Liquid.PARTICLES_PER_PIXEL));
    const surface = new myr.Surface(grid.getWidth(), grid.getHeight());

    this.update = timeStep => {
        surface.bind();
        surface.clear();

        for (const particle of particles) {
            particle.position.add(particle.velocity);

            if ((particle.life += timeStep * particle.lifeSpeed) > 1) {
                particle.life = 0;
                particle.position.x = Math.random() * grid.getWidth();
                particle.position.y = Math.random() * grid.getHeight();
                particle.velocity.x = particle.velocity.y = 0;
                grid.getFlow().apply(
                    particle.position.x,
                    particle.position.y,
                    particle.velocity,
                    Liquid.VELOCITY_MULTIPLIER);
            }

            particleColorInner.a = Liquid.COLOR_INNER.a * (0.5 * Math.cos((particle.life - 0.5) * Math.PI * 2) + 0.5);

            myr.primitives.fillCircleGradient(
                particleColorInner,
                Liquid.COLOR_OUTER,
                particle.position.x,
                particle.position.y,
                5);
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

Liquid.PARTICLE_LIFE_MIN = 2;
Liquid.PARTICLE_LIFE_MAX = 5;
Liquid.VELOCITY_MULTIPLIER = 0.002;
Liquid.COLOR_INNER = new Myr.Color(0.7, 0.6, 0.8, 0.5);
Liquid.COLOR_OUTER = new Myr.Color(Liquid.COLOR_INNER.r, Liquid.COLOR_INNER.g, Liquid.COLOR_INNER.b, 0);
Liquid.PARTICLES_PER_PIXEL = 0.0005;