# Maraudrone's Map
### Andreas Hellmich, Annika Knepper - 2022
### [andreas.hellmich@fau.de](mailto:andreas.hellmich@fau.de)

This application is implemented using the observer pattern, where every widget can easily be added or removed.\
Therefore newly added widgets need to implement the `DroneMapWidget` interface and subscribe itself to the injectable `Gobals` object.\
The interface enforces the implementation of three functions, which are called on the following occasions:
* `fileChanged`: the selected file has been changed
* `fileListChanged`: the list of available files has been changed - this will most likely be without any functionality in most cases
* `update`: the current message has been changed

# extending the application
New drone types can be added by specifying them within `getProductNameString` of `FlightInfoComponent`.\
If the new drone type has controller data that is not within (-10000,10000) it should additionally be adjusted in `fileChanged` of `ControllerStatusComponent`.

Adding new DUML Message types (after implementing them within the DROP application) involves adding their definition within `DroneWebGuiDatabase` and defining their saving and loading within `Globals`.

# special marker comments
`//#checkboxNumber`-comment: this must be adapted when the number of checkboxes in Appearance is changed.\
`//colorType`-comment: if another colorType is added, the according info has to be added here

## Development server
### Installation (Windows)
1. Download and install [Node.js](https://nodejs.org/en/download/)
2. Start Nord.js command prompt and enter: `npm install -g @angular/cli`


Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
