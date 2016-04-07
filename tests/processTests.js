var log = require('../log.js'),
    lastWrite = '';

//only need one test to make sure it calls console.log
exports.processStdout = function(test) {
    var oldStdoutWrite = process.stdout.write;
    process.stdout.write = function(string) {
        lastWrite = string;
    };
    log.instance = new log('debug');
    log.setLevel('debug');
    log.debug('test');
    test.equal(lastWrite, '~ DEBUG -- test\n');
    process.stdout.write = oldStdoutWrite;
    test.done();
};
