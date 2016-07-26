# rollodeqc-gh-user-event-logger
[![Build Status](https://travis-ci.org/millette/rollodeqc-gh-user-event-logger.svg?branch=master)](https://travis-ci.org/millette/rollodeqc-gh-user-event-logger)
[![Coverage Status](https://coveralls.io/repos/github/millette/rollodeqc-gh-user-event-logger/badge.svg?branch=master)](https://coveralls.io/github/millette/rollodeqc-gh-user-event-logger?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/millette/rollodeqc-gh-user-event-logger.svg)](https://gemnasium.com/github.com/millette/rollodeqc-gh-user-event-logger)
> Log Github user events to CouchDB.

## Install
```
$ npm install --save rollodeqc-gh-user-event-logger
```

## Now with update-notifier
The cli now uses [update-notifier][] to let the user know about updates to this program.

Users have the ability to opt-out of the update notifier by changing
the optOut property to true in ~/.config/configstore/update-notifier-rollodeqc-gh-user-streak.json.
The path is available in notifier.config.path.

Users can also opt-out by setting the environment variable NO_UPDATE_NOTIFIER
with any value or by using the --no-update-notifier flag on a per run basis.

## Usage
```js
const rollodeqcGhUserEventLogger = require('rollodeqc-gh-user-event-logger')

rollodeqcGhUserEventLogger('unicorns')
//=> 'unicorns & rainbows'
```

## API
### rollodeqcGhUserEventLogger(input, [options])
#### input
Type: `string`

Lorem ipsum.

#### options
##### foo
Type: `boolean`<br>
Default: `false`

Lorem ipsum.

## CLI
```
$ npm install --global rollodeqc-gh-user-event-logger
```

```
$ rollodeqc-gh-user-event-logger --help

  Usage
    rollodeqc-gh-user-event-logger [input]

  Options
    --foo  Lorem ipsum. [Default: false]

  Examples
    $ rollodeqc-gh-user-event-logger
    unicorns & rainbows
    $ rollodeqc-gh-user-event-logger ponies
    ponies & rainbows
```


## License
AGPL-v3 © [Robin Millette](http://robin.millette.info)

[update-notifier]: <https://github.com/yeoman/update-notifier>
