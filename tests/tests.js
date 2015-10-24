var log = require('../log.js'),
    lastWrite = '';

exports.setupStdout = function(test) {
    log.instance = new log('debug', {
        write: function(str) {
            lastWrite = str;
        }
    });
    log.instance.getDateString = function() {
        return 'date';
    };
    test.done();
};

exports.debug = function(test) {
    log.setLevel('debug');
    log.debug('test');
    test.equal(lastWrite, '~ [date] DEBUG -- test');
    test.done();
};
exports.debugIgnore = function(test) {
    log.setLevel('info');
    lastWrite = 'skip';
    log.debug('test');
    test.equal(lastWrite, 'skip');
    test.done();
};

exports.info = function(test) {
    log.setLevel('info');
    log.info('test');
    test.equal(lastWrite, '~ [date] INFO -- test');
    test.done();
};
exports.infoIgnore = function(test) {
    log.setLevel('warn');
    lastWrite = 'skip';
    log.info('test');
    test.equal(lastWrite, 'skip');
    test.done();
};

exports.warn = function(test) {
    log.setLevel('warn');
    log.warn('test');
    test.equal(lastWrite, '~ [date] WARN -- test');
    test.done();
};
exports.warnIgnore = function(test) {
    log.setLevel('error');
    lastWrite = 'skip';
    log.warn('test');
    test.equal(lastWrite, 'skip');
    test.done();
};

exports.error = function(test) {
    log.setLevel('error');
    log.error('test');
    test.equal(lastWrite, '~ [date] ERROR -- test');
    test.done();
};

exports.errorIgnore = function(test) {
    log.setLevel('fatal');
    lastWrite = 'skip';
    log.error('test');
    test.equal(lastWrite, 'skip');
    test.done();
};

exports.fatal = function(test) {
    test.expect(2);
    log.setLevel('fatal');
    log.instance.exit = function() {
        test.ok(true);
    };
    log.fatal('test');
    test.equal(lastWrite, '~ [date] FATAL -- test');
    test.done();
};

exports.booleanKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: true});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="true"');
    log.debug('', {test: false});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="false"');
    log.debug('', {test: new Boolean(false)});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="false"');
    test.done();
};

exports.numericKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: 1});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="1"');
    log.debug('', {test: '1'});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="1"');
    log.debug('', {test: new Number(1)});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="1"');
    test.done();
};

exports.stringKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: ''});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test=""');
    log.debug('', {test: 'val'});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="val"');
    log.debug('', {test: new String('str')});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="str"');
    test.done();
};

exports.functionKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: test.done});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="function"');
    test.done();
};

exports.undefinedKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: undefined});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="undefined"');
    test.done();
};

exports.nullKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: null});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="null"');
    test.done();
};

exports.jsonObjKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: {k: 'v'}});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="{\\"k\\":\\"v\\"}"');
    test.done();
};

exports.toJSONKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {test: {toJSON: function() { return 'testJSON'; }}});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="testJSON"');
    log.debug('', {test: {toJSON: function() { return {k: 'v'}; }}});
    test.equal(lastWrite, '~ [date] DEBUG --  -- test="{\\"k\\":\\"v\\"}"');
    test.done();
};

exports.miscKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', 'test');
    test.equal(lastWrite, '~ [date] DEBUG --  -- string="test"');
    log.debug('', 1);
    test.equal(lastWrite, '~ [date] DEBUG --  -- number="1"');
    test.done();
};

exports.unicodeEscape = function(test) {
    log.setLevel('debug');
    log.debug('\u2665', {k: '\u2665'});
    test.equal(lastWrite, '~ [date] DEBUG -- \\u2665 -- k="\\u2665"');
    test.done();
};

exports.errorKeyVal = function(test) {
    log.setLevel('debug');
    log.debug('', {error: new Error('test')});
    test.equal(lastWrite, '~ [date] DEBUG --  -- error="test"');
    //test the shorthand
    log.debug('', new Error('test'));
    test.equal(lastWrite, '~ [date] DEBUG --  -- error="test"');
    log.debug('', {error: {message: 'test', code: 1}});
    test.equal(lastWrite, '~ [date] DEBUG --  -- error="test (Code: 1)"');
    test.done();
};

exports.date = function(test) {
    log.setLevel('debug');
    var oldDateFn = log.instance.getDateString;
    log.instance.getDateString = log.prototype.getDateString;
    //this depends on debug running within 1 second
    var date = (new Date()).toLocaleString();
    log.debug('');
    test.equal(lastWrite, '~ [' + date + '] DEBUG -- ');
    log.instance.getDateString = oldDateFn;
    test.done();
};
