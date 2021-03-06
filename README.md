Installation
============

Install mongodb:

    $ brew install mongodb

DebugOnly:
* msavin:mongol
* avital:mocha

Testing:
* Chimp (https://chimp.readme.io)
* Node Inspector (https://github.com/node-inspector/node-inspector)
  for debugging code

To install dev dependencies for testing:

    $ npm install --only=dev


How to run
==========

On development:

    $ meteor --settings settings-dev.json

First run on will install some fixtures, depending on the env: users, ads.


How to run a shell
==================

    $ meteor shell

It's only valid on local environment. To run a command on the server, you need
to use instead the console.


How to test
===========

Mocha tests (unit tests)
------------------------

Or to keep the test running waiting for changes:

    $ meteor test --driver-package practicalmeteor:mocha --settings=settings-dev.json

Then visit http://localhost:3000

After running, if you want to run E2E tests or want to use it normally, then
stop the server window and execute: `$ meteor reset`.


Browser tests (end to end)
--------------------------

Initialize server
_________________

There are different ways to test. At least, Mocha and Cucumber tests need
before a running meteor server, so do as a first step:

    $ MONGO_URL=mongodb://localhost:27017/launchy_test npm run-script start_dev

If you need to run the debugger on the server side, place a `debugger;` line
where you want your program to stop and start the meter server like this
instead:

    $ MONGO_URL=mongodb://localhost:27017/launchy_test npm run-script start_dev_debug

Then open in your browser: http://localhost:7272/debug?port=5050


Client (test)
_____________

To keep a window open on the browser inspecting tests changes and running
automatically when something changed:

  $ npm run-script cucumberwatch

If you need a 'one-shot' test (for example CI), then execute:

  $ npm run-script cucumber


Headless browser tests (end to end)
-----------------------------------

See zombie.js or phantomJS.


See the application how Google sees it
======================================

Add at the end of the URLs:

`?_escaped_fragment_=`


How to debug
============

Debug on test client
____________________

It's not possible to debug with console.log() function, as the terminal
doesn't display any message for it, so you need a proper debug using
`debugger;`.

To debug with a Google Chrome debugger, install Node Inspector first. Then:

    $ node-inspector

In other window, execute:

    $ node_modules/chimp/bin/chimp.js --ddp=http://localhost:3000 --mocha --path=tests --watch --debugMocha

Then open: http://localhost:8080/?ws=localhost:8080&port=5858

If Google Chrome doesn't show any code, reload.

Also, press ctrl+m and you will have a Mongol window to debug.


Deployment
==========

Development:

    $ DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy launchy-dev.meteorapp.com --settings settings-dev.json

Staging:

    $ DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy launchy-staging.meteorapp.com --settings settings-staging.json

Live:

    $ DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy www.launchcontrol.es --settings settings-production.json


Troubleshooting
===============

Deployment fails
----------------

If when deploying appears an error like:

    Deploying your app...

    Errors prevented deploying:
    While linking the program:
    error: this app is not compatible with architecture 'os.linux.x86_64'

Then do:

    $ meteor reset

And finally:

    $ rm -rf node_modules


npm install fails
-----------------

if `npm install --only=dev` is giving you errors like: "WARN package.json Dependency
exists in both dependencies and devDependencies", then follow this thread:

https://github.com/npm/npm/issues/7741


Meteor refuses to start webserver
---------------------------------

If it hangs, then we can do:
* `meteor reset` and then try again
* Make a copy of the project and then try again in the new copy
