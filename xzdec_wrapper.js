var dec = require('./xzdec.js');
dec._init();

var utils = require('./utils.js');
var memsize = 2 * 1024 * 1024;
var mem = dec._malloc(memsize);

module.exports.decompress = utils.promisify(function(data, callback)
{
    dec.writeArrayToMemory(data, mem);
    var err = dec._uncompress(mem, memsize);
    if (err !== 1)
        callback(err);
    else
    {
        var ptr = dec._getUncompressedBuffer();
        var length = dec._getUncompressedLength();
        callback(null, dec.HEAP8.subarray(ptr, ptr + length));
    }
});
