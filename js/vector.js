const Vector = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);
};

Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;

    return this;
};

Vector.prototype.multiply = function(scalar) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
};