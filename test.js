"use strict";

var f = require('./nodefile.js');
var zimfile = require('./file.js');

var err = function()
{
    console.log("Error");
    console.log(arguments);
};

var filename = 'tiny.zim';
filename = 'simple.zim'

var iterateUrls = function(zimFile, index)
{
    zimFile.dirEntryByUrlIndex(index).then(function(dirEntry)
    {
        console.log(dirEntry.namespace + '/' + dirEntry.url);
        iterateUrls(zimFile, index + 1);
    }, err);
};

f.open(filename).then(function(abstractFile)
{
    zimfile.fromFile(abstractFile).then(function(zimfile)
    {
        return zimfile.dirEntryByUrlIndex(7).then(function(dirEntry)
        {
            console.log(dirEntry);
            return zimfile.blob(dirEntry.cluster, dirEntry.blob).then(err, err);
        });
    }, err);
}, err);
