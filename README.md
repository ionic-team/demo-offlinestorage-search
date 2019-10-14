# Demo App: Ionic Offline Storage - Advanced Search

This is a reference app that demonstrates how to build advanced search into an Ionic app using the [Offline Storage](https://ionicframework.com/offline-storage) solution from [Ionic Native](https://ionicframework.com/docs/enterprise).

> Note: This demo app is for reference purposes only. Specs: `@ionic/angular` 4.7.1, Angular 8.

## What Does the App Do?

Demo video 👇

[![Offline Storage video](http://img.youtube.com/vi/x3vMFKof7JE/0.jpg)](http://www.youtube.com/watch?v=x3vMFKof7JE "Ionic Offline Storage demo: Adding complex search to an employee directory app
")

It demonstrates the usage of [Offline Storage](https://ionicframework.com/offline-storage) to implement an advanced search experience in an Ionic app that works on iOS and Android. 
The app consists of an Employee Directory, listing company information such as title, office, and other details. Users can search employees by name or use a variety of filters (office, location) to find the desired employee.
Under the hood, the Offline Storage plugin is used to store employee data in a Couchbase Lite database and cover all advanced search functionality.

Either native app runtime (Cordova or Capacitor) can be used to deploy the app to a mobile device.

## Implementation Details

This is a modified version of the Ionic `blank` starter project. There are 3 major components:

* The Employee List page (`src/app/employee-list`). Displays a list of all employees in the directory. Users can search for employees by first name or launch the filter modal to refine the results.
* The Employee Detail page (`src/app/employee-detail`). Tap on an Employee to load a page that displays their details.
* The Employee Filter page (`src/app/employee-filter`). Uses Offline Storage to execute search queries based on selected filters.
* The EmployeeService class (`src/app/services/employee.service.ts`). The advanced search implementation powered by Offline Storage.

While of course there is more work involved to build the complete advanced search experience (creating the UI, etc.), the following shows
how easy it is to create powerful queries in just a few lines of code:

```
const query = 
  QueryBuilder.select(SelectResult.all())
    .from(DataSource.database(this.database))
    .where(Expression.property("office").like(this.formatWildcardExpression(office))
      .and(Expression.property("department").like(this.formatWildcardExpression(department)))
      .and(Expression.property("firstName").like(this.formatWildcardExpression(firstName))))
    .orderBy(Ordering.property('lastName').ascending());
    
const results = await (await query.execute()).allResults();
```

## How to Run

NOTE: This app requires an [Ionic Native](https://ionicframework.com/docs/enterprise) key in order to install and use the Ionic Auth Connect plugin. Ionic Native includes a reliable set of Native APIs & functionality that you can use in your Ionic app, quality controlled and maintained by the Ionic Team.
If you are interested in acquiring a key or learning more, please [contact us here](https://ionicframework.com/enterprise/contact).

1) Clone this repository.
2) Run `npm install`.
3) Follow the Offline Storage plugin installation instructions [here](https://ionicframework.com/docs/enterprise/offline-storage).
4) Build and Deploy to an [Android](https://ionicframework.com/docs/building/android) or [iOS](https://ionicframework.com/docs/building/ios) device.

## Resources

* [Offline Storage documentation](https://ionicframework.com/docs/enterprise/offline-storage)
* [Ionic Framework](https://ionicframework.com)
