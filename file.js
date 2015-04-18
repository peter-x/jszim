"use strict";

var utils = require('./utils.js');
var readInt = utils.readInt;
var xz = require('./xzdec_wrapper.js');
var q = require('./q.js');

function ZIMFile(abstractFile)
{
    this._abstractFile = abstractFile;
}

ZIMFile.prototype._readInteger = function(offset, size)
{
    return this._abstractFile.readSlice(offset, size).then(function(data)
    {
        return readInt(data, 0, size);
    });
};

ZIMFile.prototype.dirEntry = function(offset)
{
    var that = this;
    return this._abstractFile.readSlice(offset, 2048).then(function(data)
    {
        var dirEntry =
        {
            mimetype: readInt(data, 0, 2),
            namespace: String.fromCharCode(data[3]),
            cluster: readInt(data, 8, 4),
            blob: readInt(data, 12, 4),
            url: utils.decodeZeroTerminatedUtf8(data, 16),
            title: ''
        };
        var pos = 16;
        while (data[pos] !== 0)
            pos++;
        dirEntry.title = utils.decodeZeroTerminatedUtf8(data, pos + 1);
        return dirEntry;
    });
};

ZIMFile.prototype.dirEntryByUrlIndex = function(index)
{
    var that = this;
    return this._readInteger(this.urlPtrPos + index * 8, 8).then(function(dirEntryPos)
    {
        return that.dirEntry(dirEntryPos);
    });
};

ZIMFile.prototype.dirEntryByTitleIndex = function(index)
{
    var that = this;
    return this._readInteger(this.titlePtrPos + index * 4, 4).then(function(urlIndex)
    {
        return that.dirEntryByUrlIndex(urlIndex);
    });
};

ZIMFile.prototype.blob = function(cluster, blob)
{
    var that = this;
    //@todo decompress in a streaming way, otherwise we have to "guess" the sizes
    return this._abstractFile.readSlice(this.clusterPtrPos + cluster * 8, 16).then(function(clusterOffsets)
    {
        var clusterOffset = readInt(clusterOffsets, 0, 8);
        var nextCluster = readInt(clusterOffsets, 8, 8);
        console.log([clusterOffset, nextCluster, nextCluster - clusterOffset]);
        var size = nextCluster - clusterOffset;
        size = size * 2;
        console.log("Guessed size: " + size);
        return that._abstractFile.readSlice(clusterOffset, size).then(function(data)
        {
            var isCompressed = data[0];
            //@todo handle uncompressed
            //@todo does slice work everywhere?
            return xz.decompress(data.slice(1)).then(function(data)
            {
                console.log("Decompressed size: " + data.length);
                var blobOffset = readInt(data, blob * 4, 4);
                var nextBlobOffset = readInt(data, blob * 4 + 4, 4);
                return utils.decodeUtf8(data, blobOffset, nextBlobOffset - blobOffset);
            });
        });
    });
};

module.exports.fromFile = function(abstractFile)
{
    return abstractFile.readSlice(0, 80).then(function(header)
    {
        var zf = new ZIMFile(abstractFile);
        zf.articleCount = readInt(header, 24, 4);
        zf.clusterCount = readInt(header, 28, 4);
        zf.urlPtrPos = readInt(header, 32, 8);
        zf.titlePtrPos = readInt(header, 40, 8);
        zf.clusterPtrPos = readInt(header, 48, 8);
        zf.mimeListPos = readInt(header, 56, 8);
        zf.mainPage = readInt(header, 64, 4);
        zf.layoutPage = readInt(header, 68, 4);
        return zf;
    });
};
