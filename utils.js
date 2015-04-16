var q = require('./q.js');

module.exports.readInt = function(buffer, offset, length)
{
    var r = 0;
    for (var i = 0; i < length; i++)
        r += buffer[offset + i] << (8 * i);
    return r;
};

module.exports.decodeZeroTerminatedUtf8 = function(data, pos)
{
    var str = '';
    for (; data[pos] !== 0; pos++)
        str += escape(String.fromCharCode(data[pos]));
    return decodeURIComponent(str);
};

module.exports.promisify = function(nodeAsyncFn, context)
{
    return function()
    {
        var defer = q.defer(),
            args = Array.prototype.slice.call(arguments);

        args.push(function(err, val)
        {
            if (err !== null)
                return defer.reject(err);
            else
                return defer.resolve(val);
        });

        nodeAsyncFn.apply(context || {}, args);

        return defer.promise;
    };
};
