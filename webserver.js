var http = require('http');
var fs = require('fs');

var f = require('./nodefile.js');
var zimfile = require('./file.js');
var search = require('./search.js');

var filename = 'simple.zim'

var err = function()
{
    console.log("Error");
    console.log(arguments);
};

f.open(filename).then(function(abstractFile)
{
    zimfile.fromFile(abstractFile).then(function(zimfile)
    {
        startServer(zimfile);
    }, err);
}, err);

var errorResponse = function(res)
{
    return function()
    {
        console.log("Error: ");
        console.log(arguments);
        res.end();
    };
};

var startServer = function(zimfile)
{
    http.createServer(function(req, res)
    {
        console.log("Requested " + req.url);
        var url = req.url;
        if (url[0] === '/')
            url = url.slice(1);
        search.searchUrl(zimfile, url).then(function(dirEntry)
        {
            if (dirEntry === null)
            {
                res.writeHead(404);
                res.end();
                return;
            }
            console.log(dirEntry);
            dirEntry.readData().then(function(data)
            {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            }, errorResponse(res));
        }, errorResponse(res));
    }).listen(9615);
};
