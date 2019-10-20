const TIME_STEP_MAX = 0.1;

const wrapper = document.getElementById("wrapper");
const canvas = document.getElementById("renderer");
let lastDate = new Date();
let genesis = null;

const resize = () => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    genesis = new Genesis(canvas.width, canvas.height);
    canvas.addEventListener("click", event => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    });
};

const update = timeStep => {
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);

    genesis.update(Math.min(timeStep, TIME_STEP_MAX));
    genesis.draw(context);
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