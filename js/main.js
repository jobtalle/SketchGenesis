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
    genesis = new Genesis(myr, canvas.width, canvas.height);
};

const update = timeStep => {
    myr.setClearColor(Myr.Color.BLACK);
    myr.clear();

    genesis.update(Math.min(timeStep, TIME_STEP_MAX));
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