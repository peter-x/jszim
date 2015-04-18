var dec = require('./xzdec.js');
dec._init();

var utils = require('./utils.js');
var memsize = 500000;
var mem = dec._malloc(memsize);

module.exports.decompress = utils.promisify(function(data, callback)
{
    dec.writeArrayToMemory(data, mem);
    var err = dec._uncompress(mem, memsize);
    var ptr = dec._getUncompressedBuffer();
    var length = dec._getUncompressedLength();
    //@todo make use of "err"
    //@todo we should probably copy that
    callback(null, dec.HEAP8.subarray(ptr, ptr + length));
});
