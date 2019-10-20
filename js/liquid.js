const Liquid = function(myr, grid) {
    const Particle = function() {
        this.position = new Myr.Vector(grid.getWidth() * Math.random(), grid.getHeight() * Math.random());
        this.velocity = new Myr.Vector(0, 0);
        this.damping = Particle.DAMPING_MIN + (Particle.DAMPING_MAX - Particle.DAMPING_MIN) * Math.random();
        this.life = Particle.LIFE_MIN + (Particle.LIFE_MAX - Particle.LIFE_MIN) * Math.random();
    };

    Particle.prototype.update = function(timeStep) {
        this.position.x += this.velocity.x * timeStep;
        this.position.y += this.velocity.y * timeStep;
        this.velocity.x -= this.velocity.x * this.damping;
        this.velocity.y -= this.velocity.y * this.damping;

        if (this.position.x < 0 ||
            this.position.x >= grid.getWidth())
            this.position.x = grid.getWidth() * Math.random();

        if (this.position.y < 0 ||
            this.position.y > grid.getHeight())
            this.position.y = grid.getHeight() * Math.random();
    };

    Particle.LIFE_MIN = 2;
    Particle.LIFE_MAX = 5;
    Particle.DAMPING_MIN = 0.01;
    Particle.DAMPING_MAX = 0.03;

    const particles = new Array(Math.ceil(grid.getWidth() * grid.getHeight() * Liquid.PARTICLES_PER_PIXEL));
    const surfaces = [
        new myr.Surface(grid.getWidth(), grid.getHeight()),
        new myr.Surface(grid.getWidth(), grid.getHeight())];
    let surface = 0;

    this.update = timeStep => {
        surfaces[surface].bind();
        surfaces[surface].clear();

        for (const particle of particles) {
            grid.getFlow().apply(particle.position.x, particle.position.y, particle.velocity, timeStep * 0.1);
            particle.update(timeStep);

            myr.primitives.fillCircle(
                Myr.Color.GREEN,
                particle.position.x,
                particle.position.y,
                3);
        }
    };

    this.draw = () => {
        surfaces[surface].draw(0, 0);
    };

    this.free = () => {
        for (const surface of surfaces)
            surface.free();
    };

    for (const surface of surfaces)
        surface.setClearColor(Liquid.CLEAR_COLOR);

    for (let i = 0; i < particles.length; ++i)
        particles[i] = new Particle();
};

Liquid.PARTICLES_PER_PIXEL = 0.001;
Liquid.CLEAR_COLOR = new Myr.Color(0.2, 0.4, 0.2);