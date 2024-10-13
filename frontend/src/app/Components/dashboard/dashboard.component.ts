import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/Services/user.service';

interface SelectInput {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  isModalOpen: boolean;
  email: string;
  dataSource: {}[] = [];
  modalDataSource: {}[] = [];

  displayedColumns: string[] = [
    's_no',
    'name',
    'email',
    'url',
    'result',
    'model',
    'view_more',
  ];

  modalColumns: string[] = ['key', 'value'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.email = '';
    this.isModalOpen = false;
  }

  ngOnInit(): void {
    this.getUsersData();
  }

  getUsersData(filterEmail: string = '') {
    this.http.get('http://localhost:80/admin/users').subscribe({
      next: (response: any) => {
        if (response.success) {
          let temp: {}[] = [];
          let countIndex = 1;
          response.user_data.map((item: any, index: number) => {
            if (filterEmail === '' || item.email.includes(filterEmail)) {
              if (item.user_activities.length) {
                item.user_activities.map((val: any) => {
                  temp.push({
                    s_no: countIndex,
                    name: item.full_name,
                    email: item.email,
                    user_id: item.id,
                    url: val.url ?? 'NA',
                    result: val.result ?? 'NA',
                    model: val.model ?? 'NA',
                    view_more: val.details,
                  });
                  countIndex++;
                });
              } else {
                temp.push({
                  s_no: countIndex,
                  name: item.full_name,
                  email: item.email,
                  user_id: item.id,
                  url: 'NA',
                  result: 'NA',
                  model: 'NA',
                  view_more: item,
                });
                countIndex++;
              }
            }
          });
          console.log('temp', temp);

          this.dataSource = temp;
        } else {
          this.openSnackBar(response.message, 'Ok');
        }
      },
      error: (error) => {
        this.openSnackBar('Failed to get Data', 'Ok');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  searchUser(res: any) {
    if (res.code === 'Enter') {
      this.getUsersData(this.email);
    }
  }

  clearTextField() {
    this.email = '';
  }

  viewMoreAction(item: any) {
    this.openModal();
    this.modalDataSource = this.flattenObject(item);
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalOpen = false;
    this.modalDataSource = [];
  }

  flattenObject(obj: any, parentKey = '', result: any = []) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}_${key}` : key; // Concatenate parent key with current key using an underscore

        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          // Recursively flatten the nested object
          this.flattenObject(obj[key], newKey, result);
        } else {
          // Assign the value to the result object
          result.push({ key: newKey, value: obj[key] });
        }
      }
    }
    return result;
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    });
  }
}
