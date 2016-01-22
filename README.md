Installation
============

Base:
* BlazeLayout (https://github.com/kadirahq/blaze-layout)
* Backdoor (xolvio:backdoor)
* collection2 (https://atmospherejs.com/aldeed/collection2)
* FlowRouter (https://github.com/kadirahq/flow-router)

Testing:
* Chimp (https://chimp.readme.io)
* Node Inspector (https://github.com/node-inspector/node-inspector)
  for debugging code

To install dev dependencies for testing:

    $ npm install --only=dev


How to test
===========

There are different ways to test. At least, Mocha and Cucumber tests need
before a running meteor server, so do as a first step:

    $ meteor

If you need to run the debugger on the server side, place a `debugger;` line
where you want your program to stop and start the meter server like this
instead:

    $ meteor debug --debug-port 5050

Then open in your browser: http://localhost:7272/debug?port=5050


Mocha tests (unit and integration tests)
----------------------------------------

For a 'one-shot' test (good for CI), execute:

    $ npm run-script mocha

Or to keep the test running waiting for changes:

    $ npm run-script mochawatch

Debug on test client
____________________

It's not possible to debug with console.log() function, as the terminal
doesn't display any message for it, so you need a proper debug using
`debugger;`.

To debug with a Google Chrome debugger, install Node Inspector first. Then:

    $ node-inspector

In other window, execute:

    $ node_modules/chimp/bin/chimp --ddp=http://localhost:3000 --mocha --path=tests --watch --debugMocha

Then open: http://localhost:8080/?ws=localhost:8080&port=5858

If Google Chrome doesn't show any code, reload.


Headless browser tests (end to end)
-----------------------------------

See zombie.js or phantomJS.


Browser tests (end to end)
--------------------------

To keep a window open on the browser inspecting tests changes and running
automatically when something changed:

  $ node_modules/chimp/bin/chimp --cucumber --ddp=http://localhost:3000 --watch --path=tests/features

If you need a 'one-shot' test (for example CI), then execute:

  $ node_modules/chimp/bin/chimp --cucumber --path=tests/features


[NOT USED] TinyTest (unit tests)
--------------------------------

    $ meteor test-packages ./


[NOT USED] Jasmine tests
------------------------

To keep a window open on the browser inspecting tests changes and running
automatically when something changed:

    $ VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:html-reporter ./

If you need a 'one-shot' test (for example CI), then execute:

    $ VELOCITY_TEST_PACKAGES=1 meteor test-packages --driver-package velocity:console-reporter --velocity ./


Troubleshooting
===============

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
