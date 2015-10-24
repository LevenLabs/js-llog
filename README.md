# levenlabs-log #

A library for logging that follows the Leven Labs Logging Spec.

### Usage ###

```JS
var log = require('levenlabs-log');
```

### Levels ###

* 0 = Debug
* 1 = Info
* 2 = Warn
* 3 = Error
* 4 = Fatal

## Methods ##

### log.setLevel(level) ###

Set the global minimum logging level. `level` can be a string or number. 

### log.log(level, message, keyVals) ###

Log `message` if the current level is less or equal to `level`. `level` can be
a string or number. If `keyVals` is sent, the values keys and values will be
logged as well.

### log.debug(message, keyVals) ###

Helper method for calling `log.log('debug', message, keyVals)`.

### log.info(message, keyVals) ###

Helper method for calling `log.log('info', message, keyVals)`.

### log.warn(message, keyVals) ###

Helper method for calling `log.log('warn', message, keyVals)`.

### log.error(message, keyVals) ###

Helper method for calling `log.log('error', message, keyVals)`.

### log.fatal(message, keyVals) ###

Helper method for calling `log.log('fatal', message, keyVals)`. Except that
after it logs, it calls `process.exit(1)`, if being called in a Node.js
environment.
