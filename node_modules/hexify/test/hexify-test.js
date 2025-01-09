var test = require('tape');
var hexify = require('../hexify');

test('byte array to string', function (t) {
    t.plan(1);
    t.equal(hexify.toHexString([0x00, 0xFF, 0x6C, 0x0A]), '00ff6c0a');
});


test('string to byte array', function (t) {
    t.plan(1);
    t.deepEqual(hexify.toByteArray('00ff6c0a'), [0x00, 0xFF, 0x6C, 0x0A]);
});