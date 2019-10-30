const TIME_STEP_MAX = 0.1;
const COLOR_CLEAR = StyleUtils.getColor("--color-background");
const SIZE_FACTOR = 0.75;

const wrapper = document.getElementById("wrapper");
const centered = document.getElementById("centered");
const canvas = document.getElementById("renderer");
let myr = new Myr(canvas, false);
let lastDate = new Date();
let genesis = null;

const resize = () => {
    if (genesis)
        genesis.free();

    const radius = Math.ceil(Math.min(wrapper.offsetWidth, wrapper.offsetHeight) * 0.5 * SIZE_FACTOR);
    const diameter = radius + radius;

    centered.style.left = Math.round(0.5 * (wrapper.offsetWidth - diameter)) + "px";
    centered.style.top = Math.round(0.5 * (wrapper.offsetHeight - diameter)) + "px";
    canvas.width = radius + radius;
    canvas.height = radius + radius;
    myr = new Myr(canvas, false);
    genesis = new Genesis(myr);
};

const update = timeStep => {
    genesis.update(Math.min(timeStep, TIME_STEP_MAX));

    myr.setClearColor(COLOR_CLEAR);
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