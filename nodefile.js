"use strict";

var fs = require('fs');
var utils = require('./utils.js');

function NodeFile(fd)
{
    this._fd = fd;
}

NodeFile.prototype.readSlice = function(offset, length)
{
    var b = new Buffer(length);
    return utils.promisify(fs.read)(this._fd, b, 0, length, offset).then(function(bytesRead)
    {
        //@todo cope with bytesRead != length
        return b;
    });
};

module.exports.open = function(fileName)
{
    return utils.promisify(fs.open)(fileName, 'r').then(function(fd)
    {
        return new NodeFile(fd);
    });
};
