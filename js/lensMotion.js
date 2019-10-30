const LensMotion = function(size, padding, radius, resolution, transform, grid) {
    const State = function(focus, zoom, angle) {
        this.focus = focus;
        this.zoom = zoom;
        this.angle = angle;
        this.apply = (radius, transform) => {
            transform.identity();
            transform.scale(resolution, resolution);
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

            if (this.angle > Math.PI + Math.PI)
                this.angle -= Math.PI + Math.PI;
            else if (this.angle < 0)
                this.angle += Math.PI + Math.PI;
        };
    };

    const Operation = {
        Focus: function(delta) {
            const length = delta.length();
            const direction = delta.copy();

            direction.normalize();

            this.getTime = () => length / Operation.TRANSLATE_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined) {
                    target.focus.x = base.focus.x + delta.x;
                    target.focus.y = base.focus.y + delta.y;
                }
                else {
                    target.focus.x = base.focus.x + time * Operation.TRANSLATE_SPEED * direction.x;
                    target.focus.y = base.focus.y + time * Operation.TRANSLATE_SPEED * direction.y;
                }
            };
        },
        Rotate: function(delta) {
            this.getTime = () => Math.abs(delta) / Operation.ROTATE_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined)
                    target.angle = base.angle + delta;
                else
                    target.angle = base.angle + time * Operation.ROTATE_SPEED * Math.sign(delta);
            };
        },
        Zoom: function(delta) {
            this.getTime = () => Math.abs(delta) / Operation.ZOOM_SPEED;
            this.apply = (base, target, time) => {
                if (time === undefined)
                    target.zoom = base.zoom + delta;
                else
                    target.zoom = base.zoom + time * Operation.ZOOM_SPEED * Math.sign(delta);
            };
        }
    };

    Operation.TRANSLATE_SPEED = 500;
    Operation.ROTATE_SPEED = 2;
    Operation.ZOOM_SPEED = 1;

    const operations = [];
    const stateBase = new State(new Myr.Vector(size * 0.5, size * 0.5), 1, 0);
    const state = stateBase.copy();
    let operationTime = 0;
    let operationDelay = LensMotion.OPERATION_DELAY_INITIAL;

    const addOperationRefocus = () => {
        const angleDelta = LensMotion.ANGLE_DELTA_MIN + (LensMotion.ANGLE_DELTA_MAX - LensMotion.ANGLE_DELTA_MIN) * Math.random();
        const focusDelta = new Myr.Vector(0, 0);
        let zoomDelta = LensMotion.ZOOM_DELTA_MIN + (LensMotion.ZOOM_DELTA_MAX - LensMotion.ZOOM_DELTA_MIN) * Math.random();

        if (stateBase.zoom + zoomDelta < LensMotion.ZOOM_MIN ||
            stateBase.zoom + zoomDelta > LensMotion.ZOOM_MAX)
            zoomDelta = -zoomDelta;

        const focusPadding = padding + radius / (stateBase.zoom + zoomDelta);
        const centroids = grid.getCentroids();
        let focusX, focusY;

        for (let i = centroids.length; i-- > 0;) {
            const centroid = centroids[i];

            if (centroid.x < focusPadding ||
                centroid.y < focusPadding ||
                centroid.x > size - focusPadding * 2 ||
                centroid.y > size - focusPadding * 2)
                centroids.splice(i, 1);
        }

        if (centroids.length === 0) {
            focusX = focusPadding + (size - focusPadding - focusPadding) * Math.random();
            focusY = focusPadding + (size - focusPadding - focusPadding) * Math.random();
        }
        else {
            focusX = centroids[0].x;
            focusY = centroids[0].y;
        }

        focusDelta.x = focusX - stateBase.focus.x;
        focusDelta.y = focusY - stateBase.focus.y;

        if (zoomDelta < 0) {
            operations.push(new Operation.Focus(focusDelta));
            operations.push(new Operation.Zoom(zoomDelta));
        }
        else {
            operations.push(new Operation.Zoom(zoomDelta));
            operations.push(new Operation.Focus(focusDelta));
        }

        operations.push(new Operation.Rotate(angleDelta));
    };

    const addOperations = () => {
        if (operations.length !== 0)
            return;

        addOperationRefocus();
    };

    this.getZoom = () => state.zoom;

    this.update = timeStep => {
        state.apply(radius, transform);

        if ((operationDelay -= timeStep) < 0) {
            operationDelay = LensMotion.OPERATION_DELAY_MIN + (LensMotion.OPERATION_DELAY_MAX - LensMotion.OPERATION_DELAY_MIN) * Math.random();

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

LensMotion.ZOOM_MIN = 0.75;
LensMotion.ZOOM_MAX = 1.5;
LensMotion.ZOOM_DELTA_MIN = -0.5;
LensMotion.ZOOM_DELTA_MAX = 0.5;
LensMotion.ANGLE_DELTA_MIN = -1.3;
LensMotion.ANGLE_DELTA_MAX = 1.3;
LensMotion.OPERATION_DELAY_INITIAL = 1;
LensMotion.OPERATION_DELAY_MIN = 3;
LensMotion.OPERATION_DELAY_MAX = 10;