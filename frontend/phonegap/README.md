# PhoneGap wrappers

## Core API

`window.pg.restart()`
Restarts the application. On the desktop, this is a browser reload.

`window.pg.onready(fn)`
Calls `fn` the moment PhoneGap is ready to start accepting calls.
On the desktop, this behaves like a setTimeout of 0. The onready API may be
called many times, making all registered functions fire when ready.

`window.pg.onpause(fn)`
Calls `fn` the moment the application is sent to the background. The onpause
API may be called many times, making all registered functions fire when ready.

`window.pg.onresume(fn)`
Calls `fn` the moment the application is resumed from the background. The
onresume API may be called many times, making all registered functions fire
when ready.

`window.pg.simulatePause()` and `window.pg.simulateResume()`
Since WebKit cannot accurately detect pause/resume events, you can call these APIs to
manually test your app's behavior in pause/resume scenarios.

