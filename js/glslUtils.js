const GLSLUtils = {
    colorToVec4: function(color) {
        return "vec4(" +
            color.r.toFixed(2) + "," +
            color.g.toFixed(2) + "," +
            color.b.toFixed(2) + "," +
            color.a.toFixed(2) + ")";
    }
};