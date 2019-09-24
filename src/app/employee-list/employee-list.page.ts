import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Employee } from '../models/employee';
import { EmployeeService } from '../services/employee.service';
import { EmployeeFilterPage } from '../employee-filter/employee-filter.page';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
})
export class EmployeeListPage implements OnInit {
  employees = [];
  currentSearchQuery: string = "";

  constructor(private employeeService: EmployeeService, public modalController: ModalController) { }

  async ngOnInit() {
    this.employees = await this.employeeService.getEmployees();
  }

  async openSearchFilter() {
    const modal = await this.modalController.create({
      component: EmployeeFilterPage,
      componentProps: { }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    const { office, department } = data;

    this.employees = await this.employeeService.filterData(office, department, this.currentSearchQuery);
  }

  async searchQueryChanged(newQuery) {
    this.employees = await this.employeeService.filterData(
      localStorage.office || "Any", localStorage.department || "Any", newQuery);
  }

}
