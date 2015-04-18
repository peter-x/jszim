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
//        loadRandom(zimfile, 500);
        return zimfile.dirEntryByUrlIndex(10100).then(function(dirEntry)
        {
            return zimfile.blob(dirEntry.cluster, dirEntry.blob).then(err, err);
        });
    }, err);
}, err);

var loadRandom = function(zimfile, counter)
{
    console.log(counter);
    if (counter <= 0) return;

    var index = Math.floor(Math.random() * 100000);
    zimfile.dirEntryByUrlIndex(index).then(function(dirEntry)
    {
        zimfile.blob(dirEntry.cluster, dirEntry.blob).then(function() {
            loadRandom(zimfile, counter - 1);
        }, err);
    });
}
