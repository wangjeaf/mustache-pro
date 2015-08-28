var modules = [
    'if', 
    'array_index',
    'renderer',
    'filter',
    'together'
];
modules.map(function(ele, index) {
    return $('<script src="./cases/' + ele + '.js"></script>').appendTo('head');
});
