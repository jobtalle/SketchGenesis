const LensMotion = function(areaSize, radius, transform) {
    const State = function(focus, zoom, angle) {
        this.focus = focus;
        this.zoom = zoom;
        this.angle = angle;
        this.apply = (radius, transform) => {
            transform.identity();
            transform.translate(radius, radius);
            transform.scale(this.zoom, this.zoom);
            transform.rotate(this.angle);
            transform.translate(-this.focus.x, -this.focus.y);
        };

        this.copy = () => {
            return new State(this.focus.copy(), this.zoom, this.angle);
        };

        this.set = other => {
            this.focus.x = other.focus.x;
            this.focus.y = other.focus.y;
            this.zoom = other.zoom;
            this.angle = other.angle;
        };
    };

    const Operation = {
        Translate: function(delta) {
            const length = delta.length();

            this.getTime = () => length / Operation.TRANSLATE_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined)
                    time = this.getTime();

                target.focus = base.focus;
                target.zoom = base.zoom;
                target.angle = base.angle;
            };
        },
        Rotate: function(delta) {
            this.getTime = () => delta / Operation.ROTATE_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined)
                    time = this.getTime();

                target.focus = base.focus;
                target.zoom = base.zoom;
                target.angle = base.angle + time * Operation.ROTATE_SPEED * delta;
            };
        },
        Zoom: function(delta) {
            this.getTime = () => delta / Operation.ZOOM_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined)
                    time = this.getTime();

                target.focus = base.focus;
                target.zoom = base.zoom;
                target.angle = base.angle;
            };
        }
    };

    Operation.TRANSLATE_SPEED = 500;
    Operation.ROTATE_SPEED = 2;
    Operation.ZOOM_SPEED = 1;

    const operations = [];
    const stateBase = new State(new Myr.Vector(areaSize * 0.5, areaSize * 0.5), 1, 1);
    const state = stateBase.copy();
    let operationTime = 0;
    let operationDelay = LensMotion.OPERATION_DELAY_INITIAL;

    const addOperations = () => {
        if (operations.length !== 0)
            return;

        operations.push(new Operation.Rotate(1));
    };

    this.update = timeStep => {
        state.apply(radius, transform);

        if ((operationDelay -= timeStep) < 0) {
            operationDelay = Lens.OPERATION_DELAY_MIN + (Lens.OPERATION_DELAY_MAX - Lens.OPERATION_DELAY_MIN) * Math.random();

            addOperations();
        }

        if (operations.length !== 0) {
            if ((operationTime += timeStep) > operations[0].getTime()) {
                const operation = operations.shift();

                operationTime -= operation.getTime();
                operation.apply(stateBase, stateBase);
                state.set(stateBase);
            }
            else
                operations[0].apply(stateBase, state, operationTime);
        }
    };
};

LensMotion.OPERATION_DELAY_INITIAL = 1;
LensMotion.OPERATION_DELAY_MIN = 5;
LensMotion.OPERATION_DELAY_MAX = 16;