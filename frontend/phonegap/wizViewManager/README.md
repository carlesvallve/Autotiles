# wizViewManager

The wizViewManager wrapper wraps around the wizViewManager PhoneGap plugin,
and exposes a much enriched and more object oriented API. It can be found as
`window.pg.wizViewManager` and depends on the existance of the
`window.EventEmitter` library.

For the phonegap plugin, please refer to:
[wizViewManager github repo](https://github.com/Wizcorp/phonegap-plugin-wizViewManager)

## API

`wizViewManager.create(name, [options, cb])`
Creates a webview with a given name and options. The options for creation are
described by the PhoneGap plugin specification. After creation, or after
loading if you provided an `src` option, your callback (arguments:
`error, view`) is called and passed an object that represents the webview.

`wizViewManager.get(name)`
Returns an object representing the webview with the given name. This object
will always be returned, even if this webview does not exist. The reason for
this is that webviews cannot detect each others' existence.

`wizViewManager.scrollTo(x, y)`
Scrolls the current webview to the given position.

`View#setLayout(options, [cb])`
Calls setLayout on the webview in order to resize and reposition it. The
options are described in the PhoneGap plugin specification.

`View#load(src, [cb])`
Loads the file with the given URL and calls `cb` when loading has finished.

`View#clear()` (beta!)
Clears the webview. This function is not yet supported in PhoneGap.

`View#show([options, cb])`
Shows the webview, optionally with animation. The callback is called once the
webview is completely visible (so after an animation has ended).

`View#hide([options, cb])`
Hides the webview, optionally with animation. The callback is called once the
webview is completely hidden (so after an animation has ended).

`View#destroy([cb])`
Completely destroys a webview.

`View#emit(eventName, [data, cb])`
Emits an event to the given webview and passes it the given data. If a callback
is passed, the other webview is requested to always call this callback at some
point (if it doesn't, memory will leak, so be careful).

`View#postMessage(data)`
An alias for: `View#emit('message', data);`, so that backwards compatibility
is maintained (`on('message', cb)`).

`wizViewManager.on(evtName, cb)`
Whenever the event identified by evtName was emitted by another webview,
targetted at this webview, cb will be called and passed:
`senderView, data, cb`.

