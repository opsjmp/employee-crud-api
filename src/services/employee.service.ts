import * as crypto from 'crypto';
import * as path from 'path';
import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as Memory from 'lowdb/adapters/Memory';
import { injectable } from 'inversify';

import { Employee } from './../models/employee.model';

@injectable()
export class EmployeeService {
    private dbFile = path.join(__dirname, './../data/employees.json');
    db: any;
    employees: Employee[];

    constructor() { }

    init() {
        const fileAdapter = new FileSync(this.dbFile);
        const inMemory = new Memory('employees.json');
        const adapter = (process.env.NODE_ENV === 'test') ? inMemory : fileAdapter;
        this.db = low(adapter);

        // Default db file setup example..
        if (!this.db.has('employees').value()) {
            this.db.defaults({
                employees: [],
            }).write();
        }
    }

    getEmployees(): Employee[] {
        this.employees = this.db.get('employees').value();
        return this.employees;
    }

    addEmployee(employee: Employee) {
        const euid = crypto.randomBytes(3 * 4).toString('base64');
        this.db.get('employees')
            .push({
                uid: euid,
                name: employee.name,
                designation: employee.designation,
                email: employee.email,
                location: employee.location,
                salary: employee.salary,
            }).write();
        return euid;
    }

    updateEmployee(employeeId: string, employee: Employee) {
        this.db.get('employees')
            .find({ uid: employee.uid })
            .assign({
                name: employee.name,
                designation: employee.designation,
                email: employee.email,
                location: employee.location,
                salary: employee.salary,
            }).write();
        return employee;
    }

    deleteEmployee(id: string) {
        this.db.get('employees')
            .remove({ uid: id })
            .write();
        return id;
    }
}