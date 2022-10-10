# Maraudrone's Map

This application is used to forensically visualize DJI drone log data. The logs need to be preprocessed using DROP. 

## Installation (Windows)
1. Download and install [Node.js](https://nodejs.org/en/download/)
2. Start Nord.js command prompt and enter: `npm install -g @angular/cli`
3. Install modules `npm install`
4. Run: `ng serve`

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Extending the application
The application is implemented using the observer pattern, where every widget can easily be added or removed.

Therefore newly added widgets need to implement the `DroneMapWidget` interface and subscribe itself to the injectable `Gobals` object.
The interface enforces the implementation of three functions, which are called on the following occasions:
* `fileChanged`: the selected file has been changed
* `fileListChanged`: the list of available files has been changed - this will most likely be without any functionality in most cases
* `update`: the current message has been changed

Adding new DUML Message types (after implementing them wi
New drone types can be added by specifying them as a member of the `DroneType` enum of `globals.py` and within `getProductNameString` of `FlightInfoComponent`.\
If the new drone type has controller data that is not within (-10000,10000) it should additionally be adjusted in `fileChanged` of `ControllerStatusComponent`.

## Special marker comments
`//#checkboxNumber`-comment: this must be adapted when the number of checkboxes in Appearance is changed.\
`//colorType`-comment: if another colorType is added, the according info has to be added here

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Credits
Andreas Hellmich
Annika Knepper
