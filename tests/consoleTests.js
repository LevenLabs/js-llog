var log = require('../log.js'),
    lastWrite = '';

//only need one test to make sure it calls console.log
exports.consoleLog = function(test) {
    var oldLog = console.log;
    global.LLOG_SKIP_USING_PROCESS = true;
    console.log = function(string) {
        lastWrite = string;
    };
    log.instance = new log('debug');
    log.setLevel('debug');
    log.debug('test');
    //no \n is printed when using console.log
    test.equal(lastWrite, '~ DEBUG -- test');
    console.log = oldLog;
    delete global.LLOG_SKIP_USING_PROCESS;
    test.done();
};
