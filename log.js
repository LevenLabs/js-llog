if (typeof require === 'function') {
    var jsesc = require('jsesc');
} else {
    jsesc = function(val) {
        return val.replace(/\n/g, '\\n').replace('"', '\"');
    };
}

var LEVEL_DEBUG = 0,
    LEVEL_INFO = 1,
    LEVEL_WARN = 2,
    LEVEL_ERROR = 3,
    LEVEL_FATAL = 4,
    stringToLevel = {
        debug: LEVEL_DEBUG,
        info: LEVEL_INFO,
        warn: LEVEL_WARN,
        error: LEVEL_ERROR,
        fatal: LEVEL_FATAL
    },
    levelToString = {};
levelToString[LEVEL_DEBUG] = 'debug';
levelToString[LEVEL_INFO] = 'info';
levelToString[LEVEL_WARN] = 'warn';
levelToString[LEVEL_ERROR] = 'error';
levelToString[LEVEL_FATAL] = 'fatal';

function handleLevel(lvl) {
    return typeof lvl === 'string' ? stringToLevel[lvl.toLowerCase()] : lvl;
}

function LLog(level, stdout) {
    this.level = handleLevel(level) || LEVEL_DEBUG;
    if (stdout) {
        this.stdout = stdout;
    } else if (typeof process !== 'undefined' && process.stdout) {
        this.stdout = process.stdout;
    } else {
        this.stdout = {
            write: function(string) {
                console.log(string);
            }
        };
    }
}

LLog.prototype.getDateString = function() {
    return new Date().toLocaleString();
};

LLog.prototype.exit = function() {
    if (typeof process !== 'undefined' && typeof process.exit === 'function') {
        process.exit(1);
    }
};

function toString(val) {
    var str;
    switch (typeof val) {
        case 'string':
            return val;
        case 'boolean':
            return val ? 'true' : 'false';
        case 'number':
            return String(val);
        case 'function':
            return 'function';
        case 'undefined':
            return 'undefined';
        case 'object':
            if (val === null) {
                return 'null';
            }
            if (val instanceof Date) {
                return Math.floor(val.getTime() / 1000);
            }
            if (val instanceof String) {
                return val;
            }
            if (val instanceof Number) {
                return String(val);
            }
            if (val instanceof Boolean) {
                return val.valueOf() ? 'true' : 'false';
            }
            if (typeof val.toJSON === 'function') {
                str = val.toJSON();
                //apparently toJSON prepares an object for stringify() doesn't convert to string
                if (typeof str === 'string' || str instanceof String) {
                    return str;
                }
                try {
                    //stringify automatically calls toJSON() so we'll let it handle that
                    return JSON.stringify(val);
                } catch (e) {
                    LLog.warn('failed JSON.stringify after toJSON in llog', e);
                    //lets continue on and see if we can do something else?
                }
            }
            //if its an error and has a message, otherwise just fallback to toString()
            if (val.hasOwnProperty('message')) {
                if (val.hasOwnProperty('code')) {
                    return val.message + ' (Code: ' + val.code + ')';
                }
                return val.message;
            }
            if (typeof val.toString === 'function') {
                str = val.toString();
                if (str === '[object Object]') {
                    //might as well json it since its a plain object
                    try {
                        str = JSON.stringify(val);
                    } catch (e) {
                        LLog.warn('failed JSON.stringify in toString in llog', e);
                        str = 'object';
                    }
                }
                return str;
            }
            return 'object';
    }
}

function escapeValue(val) {
    return jsesc(val);
}

//also wraps in quotes
function escapeQuoteValue(val) {
    return jsesc(val, {
        quotes: 'double',
        wrap: true
    });
}

LLog.prototype.log = function(lvl, message, kv) {
    var level = handleLevel(lvl);
    if (level < this.level) {
        return;
    }
    var parts = [
            '~',
            '[' + this.getDateString() + ']',
            (levelToString[level] || 'DEBUG').toUpperCase(),
            '--',
            'no log message provided',
            '--'
        ],
        k, v;
    if (typeof message === 'string') {
        parts[4] = escapeValue(message);
    } else if (typeof message === 'object' && kv === undefined) {
        kv = message;
    }
    //shorthand for the common case of log.error('message', err)
    if (kv instanceof Error) {
        kv = {error: kv};
    } else if (typeof kv === 'string' || kv instanceof String) {
        kv = {string: kv};
    } else if (typeof kv === 'number' || kv instanceof Number) {
        kv = {number: kv};
    }
    for (k in kv) {
        if (kv.hasOwnProperty(k)) {
            v = toString(kv[k]);
            parts.push(k + '=' + escapeQuoteValue(toString(kv[k])) + '');
        }
    }
    //if there were no kv's then just remove the trailing separator
    if (parts[parts.length - 1] === '--') {
        parts.pop();
    }
    this.stdout.write(parts.join(' '));
};

LLog.instance = null;

LLog.log = function() {
    if (!LLog.instance) {
        LLog.instance = new LLog();
    }
    LLog.instance.log.apply(LLog.instance, Array.prototype.slice.call(arguments));
};

LLog.setLevel = function(level) {
    if (!LLog.instance) {
        LLog.instance = new LLog();
    }
    switch (typeof level) {
        case 'string':
            LLog.instance.level = stringToLevel[level.toLowerCase()] || 0;
            break;
        case 'number':
            LLog.instance.level = level;
            break;
        default:
            throw new Error('level sent to LLog.setLevel must be a string/number');
    }
};

LLog.debug = function() {
    //for some reason we need to call slice first to convert arguments to an array since concat is dumb
    LLog.log.apply(LLog.log, [LEVEL_DEBUG].concat(Array.prototype.slice.call(arguments)));
};

LLog.info = function() {
    LLog.log.apply(LLog.log, [LEVEL_INFO].concat(Array.prototype.slice.call(arguments)));
};

LLog.warn = function() {
    LLog.log.apply(LLog.log, [LEVEL_WARN].concat(Array.prototype.slice.call(arguments)));
};

LLog.error = function() {
    LLog.log.apply(LLog.log, [LEVEL_ERROR].concat(Array.prototype.slice.call(arguments)));
};

LLog.fatal = function() {
    LLog.log.apply(LLog.log, [LEVEL_FATAL].concat(Array.prototype.slice.call(arguments)));
    LLog.instance.exit();
};

module.exports = LLog;
