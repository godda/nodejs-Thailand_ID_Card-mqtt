"use strict";

var hexify = {

    toByteArray: function (hexStr) {
        var hex = [];
        var arr = hexStr.match(/[0-9a-fA-F]{2}/g);
        arr.forEach(function (h) {
            hex.push(parseInt(h, 16));
        });
        return hex;
    },

    toHexString: function (byteArray) {
        var str = '';
        byteArray.forEach(function (b) {
            var hex = (b.toString(16));
            str += (hex.length < 2 ? '0' + hex : hex);
        });
        return str;
    }

};

module.exports = hexify;
