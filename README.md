Installation
============

* BlazeLayout (https://github.com/kadirahq/blaze-layout)
* Backdoor (xolvio:backdoor)
* collection2 (https://atmospherejs.com/aldeed/collection2)
* FlowRouter (https://github.com/kadirahq/flow-router)

Testing:

    $ npm install

* Chimp (https://chimp.readme.io)
* Node Inspector (https://github.com/node-inspector/node-inspector)
  for debugging code


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

To debug with a Google Chrome debugger, install Node Inspector first. Then:

    $ node-inspector

In other window, execute:

    $ chimp --ddp=http://localhost:3000 --mocha --path=tests --watch --debugMocha

Then open: http://localhost:8080/?ws=localhost:8080&port=5858

If Google Chrome doesn't show any code, reload.


Cucumber tests (end to end)
---------------------------

To keep a window open on the browser inspecting tests changes and running
automatically when something changed:

  $ chimp --cucumber --ddp=http://localhost:3000 --watch --path=tests/features

If you need a 'one-shot' test (for example CI), then execute:

  $ chimp --cucumber --path=tests/features


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
