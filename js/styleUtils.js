const StyleUtils = {
    getVariable: function(name) {
        return getComputedStyle(document.body).getPropertyValue(name);
    },

    getColor: function(name) {
        return Myr.Color.fromHex(
            StyleUtils.getVariable(name).toUpperCase().replace("#", ""));
    }
};