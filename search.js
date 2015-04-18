

var binarySearch = function(begin, end, query)
{
    if (end <= begin)
        return null;
    var mid = Math.floor((begin + end) / 2);
    return query(mid).then(function(decision)
    {
        if (decision < 0)
            return binarySearch(begin, mid, query);
        else if (decision > 0)
            return binarySearch(mid + 1, end, query);
        else
            return mid;
    });
};

module.exports.searchUrl = function(file, url)
{
    return binarySearch(0, file.articleCount /*@todo is that the number of urls? */, function(i)
    {
        return file.dirEntryByUrlIndex(i).then(function(entry)
        {
            if (url < entry.url)
                return -1;
            else if (url > entry.url)
                return 1;
            else
                return 0;
        });
    }).then(function(index)
    {
        return index === null ? null : file.dirEntryByUrlIndex(index);
    });
};
