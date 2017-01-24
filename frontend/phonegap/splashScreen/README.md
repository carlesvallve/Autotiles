# SplashScreen

For splash screen control, this is the "splashScreen" wrapper. On the desktop,
it will display a grey overlay, with the simple text "SPLASH SCREEN". Grey,
because that will allow the spinner text (white / black) to always be visible.
Since the actual splash images are in the app bundles, the wrapper won't be
able to display this image here. The splash is instantly visible the moment
your application starts, mimicking the behavior of our games on your mobile
device. The wrapper also exposes a few APIs:

## API

`window.pg.splashScreen.showOnPause()`
This call will prepare PhoneGap to always display the splash screen when the
app is put in the background.

`window.pg.splashScreen.hideOnResume()`
This will tell the splashScreen wrapper that the splash should hide instantly
when the application resumes and JavaScript is active again.

`window.pg.splashScreen.show()`
This shows the splash screen.

`window.pg.splashScreen.hide()`
This hides the splash screen.

## Example

It's probably advisable to configure the pause/resume logic the moment you
hide your splash screen for the first time after startup, like in this example:

`function displayLandingPage() {
	mithril.loader.displayPage('landing');


	window.setTimeout(function () {
		// hide the spinner

		window.pg.wizSpinner.hide();

		// hide the splash

		window.pg.splashScreen.hide();

		// from now on, when going into background, we will want to display
		// the splash, which should hide when JavaScript is active again.

		window.pg.splashScreen.showOnPause();
		window.pg.splashScreen.hideOnResume();
	}, 0);
}`

