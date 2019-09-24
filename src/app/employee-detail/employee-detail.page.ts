import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../models/employee';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.page.html',
  styleUrls: ['./employee-detail.page.scss']
})
export class EmployeeDetailPage implements OnInit {
  id: number;
  fullName = '';
  avatarExpanded = false;
  employee: Employee | undefined;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  async ngOnInit() {
    this.id = parseInt(this.route.snapshot.params['id'], 10);
    
    this.employee = await this.employeeService.getEmployee(this.id);
    this.fullName = `${this.employee.firstName} ${this.employee.lastName}`;
  }

  expandAvatar(event) {
    event.stopPropagation();
    this.avatarExpanded = !this.avatarExpanded;
  }
}