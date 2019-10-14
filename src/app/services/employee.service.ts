import { Injectable } from '@angular/core';
import { from, Observable, pipe, timer } from 'rxjs';
import { data } from '../../data/employeeData.js';
import { Employee } from '../models/employee.js';

import {
  CordovaEngine,
  Database,
  DatabaseConfiguration,
  DataSource,
  IonicCBL,
  Meta,
  MutableDocument,
  Ordering,
  QueryBuilder,
  SelectResult,
  Expression
} from '@ionic-enterprise/offline-storage';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public employees: Employee[] = [];
  private database: Database;
  private readyPromise: Promise<void>;

  constructor() {
    this.readyPromise = this.initializeDatabase();
  }

  /*
    Initialize the database. 
    
    Note about encryption: In a real-world app, the encryption key should not be hardcoded like it is here. 
    One strategy is to auto generate a unique encryption key per user on initial app load, then store it securely in the device's keychain for later retrieval.
    Ionic's Identity Vault (https://ionicframework.com/docs/enterprise/identity-vault) plugin is an option. Using IV’s storage API, you can ensure that the 
    key cannot be read or accessed without the user being authenticated first.
  */
  private async initializeDatabase(): Promise<void> {
    return new Promise(resolve => {
      IonicCBL.onReady(async () => {
        const config = new DatabaseConfiguration();
        config.setEncryptionKey('8e31f8f6-60bd-482a-9c70-69855dd02c38');
        this.database = new Database('employees', config);
        this.database.setEngine(
          new CordovaEngine({
            allResultsChunkSize: 9999
          })
        );
        await this.database.open();

        this.seedInitialData();
        resolve();
      });
    });
  }

  /*
    Import static employee data into a large JSON object (data/employeeData.ts), then load into Offline Storage.
    In a real-world app, an external API could be called or a Couchbase Lite database zip file can be shipped with the app binary,
    then extracted and loaded upon first time app initialization.
  */
  private async seedInitialData() {
    let count = await this.getDatabaseCount();
    if (count === 0) {
        const smallData = data.slice(0, 200);
        for (let emp of smallData) {
          let doc = new MutableDocument()
            .setNumber('id', emp.id)
            .setString('firstName', emp.firstName)
            .setString('lastName', emp.lastName)
            .setString('title', emp.title)
            .setString('office', emp.office)
            .setString('department', emp.department);
          
          this.database.save(doc);
        }
    }
  }

  async filterData(office, department, firstName) {
    await this.readyPromise;

    // Office and Department filters: Despite always passing their values to Couchbase directly as-is, make 
    // them fuzzy so as to support the case when user selects the "Any" filter
    const query = QueryBuilder.select(SelectResult.all())
      .from(DataSource.database(this.database))
      .where(Expression.property("office").like(this.formatWildcardExpression(office))
        .and(Expression.property("department").like(this.formatWildcardExpression(department)))
        .and(Expression.property("firstName").like(this.formatWildcardExpression(firstName)))
        )
      .orderBy(Ordering.property('lastName').ascending());
    
    const results = await (await query.execute()).allResults();

    let filteredEmployees = [];
    for (var key in results) {
      // SelectResult.all() returns all properties, but puts them into a seemingly odd JSON format:
      // [ { "*": { id: "1", firstName: "Matt" } }, { "*": { id: "2", firstName: "Max" } }]
      // Couchbase can query multiple databases at once, so "*" represents just this single database.
      let singleEmp = results[key]["*"];

      filteredEmployees.push(singleEmp);
    }

    return filteredEmployees;
  }

  /*
    Retrieve all unique values in the database for one specific column of data.
    Here, it's used to populate the Office and Department filters. 
  */
  public async getAllUniqueValues(documentPropertyName) {
    const query = QueryBuilder.selectDistinct(
        SelectResult.property(documentPropertyName))
      .from(DataSource.database(this.database))
      .orderBy(Ordering.property(documentPropertyName).ascending());
    
    const results = await (await query.execute()).allResults();
    let uniqueValues = results.map(x => x[documentPropertyName]);
    uniqueValues.unshift("Any");
    return uniqueValues;
  }

  public async getEmployees() {
    await this.readyPromise;

    const query = QueryBuilder.selectDistinct(SelectResult.all())
      .from(DataSource.database(this.database));
    
    const results = await (await query.execute()).allResults();

    for (var key in results) {
      // SelectResult.all() returns all properties, but puts them into a seemingly odd JSON format:
      // [ { "*": { id: "1", firstName: "Matt" } }, { "*": { id: "2", firstName: "Max" } }]
      // Couchbase can query multiple databases at once, so "*" is just this single database.
      let singleEmp = results[key]["*"];

      this.employees.push(singleEmp);
    }

    return this.employees;
  }

  public async getEmployee(id) {
    await this.readyPromise;

    const query = QueryBuilder.select(SelectResult.all())
      .from(DataSource.database(this.database))
      .where(Expression.property("id").equalTo(Expression.number(id)));
    
    const result = await (await query.execute()).allResults();
    return result[0]["*"];
  }

  private async getDatabaseCount() {
    const query = QueryBuilder.select(SelectResult.all())
      .from(DataSource.database(this.database));
    
    const result = await query.execute();
    const count = (await result.allResults()).length;
    return count;
  }

  /*
    Used to format the search queries that get executed against the Couchbase database.
    If "Any" is passed in, meaning no search filter for that parameter, then send empty string - "".
    Otherwise, use the value directly but add percentage signs so we can support fuzzy searches.
  */
  private formatWildcardExpression(propValue) {
    return Expression.string(`%${propValue === "Any" ? "" : propValue}%`);
  }
}