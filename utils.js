var q = require('./q.js');

module.exports.readInt = function(buffer, offset, length)
{
    var r = 0;
    for (var i = 0; i < length; i++)
    {
        var c = (buffer[offset + i] + 256) & 0xff;
        r += c << (8 * i);
    }
    return r;
};

module.exports.decodeZeroTerminatedUtf8 = function(data, pos)
{
    var str = '';
    for (; data[pos] !== 0; pos++)
        str += escape(String.fromCharCode(data[pos]));
    return decodeURIComponent(str);
};

module.exports.decodeUtf8 = function(data, pos, length)
{
    var u0, u1, u2, u3, u4, u5;

    var str = '';
    var idx = pos;
    while (idx - pos < length) {
        u0 = data[idx++];
        if (!(u0 & 0x80))
        {
            str += String.fromCharCode(u0);
            continue;
        }
        u1 = data[idx++] & 63;
        if ((u0 & 0xe0) == 0xc0)
        {
            str += String.fromCharCode(((u0 & 31) << 6) | u1);
            continue;
        }
        u2 = data[idx++] & 63;
        if ((u0 & 0xf0) == 0xe0)
            u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        else
        {
            u3 = data[idx++] & 63;
            if ((u0 & 0xF8) == 0xF0)
                u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
            else
            {
                u4 = data[idx++] & 63;
                if ((u0 & 0xFC) == 0xF8)
                    u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
                else
                {
                    u5 = data[idx++] & 63;
                    u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
                }
            }
        }
        if (u0 < 0x10000)
            str += String.fromCharCode(u0);
        else
        {
            var ch = u0 - 0x10000;
            str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
    }
    return str;
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
