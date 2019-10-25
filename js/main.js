const TIME_STEP_MAX = 0.1;

const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let myr = new Myr(canvas, false);
let lastDate = new Date();
let genesis = null;

const resize = () => {
    if (genesis)
        genesis.free();

    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    myr = new Myr(canvas, false);
    genesis = new Genesis(myr, canvas.width * 0.76, canvas.height * 0.76);
};

const update = timeStep => {
    genesis.update(Math.min(timeStep, TIME_STEP_MAX));

    myr.setClearColor(Myr.Color.BLACK);
    myr.bind();
    myr.clear();

    genesis.draw();

    myr.flush();
};

const loopFunction = () => {
    const date = new Date();

    update((date - lastDate) * 0.001);
    requestAnimationFrame(loopFunction);

    lastDate = date;
};

window.onresize = resize;

resize();
requestAnimationFrame(loopFunction);