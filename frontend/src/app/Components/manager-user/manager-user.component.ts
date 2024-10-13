import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-manager-user',
  templateUrl: './manager-user.component.html',
  styleUrls: ['./manager-user.component.css'],
})
export class ManagerUserComponent implements OnInit {
  loading: boolean;
  isModalOpen = false;
  formData: {
    name: string;
    email: string;
    password: string;
    user_id: string;
  };
  hidePassword: boolean;
  isCreateOpen: boolean;
  dataSource: {}[] = [];
  displayedColumns: string[] = ['s_no', 'name', 'email', 'user_id', 'action'];

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private _snackBar: MatSnackBar
  ) {
    this.loading = false;
    this.isCreateOpen = false;
    this.formData = {
      name: '',
      email: '',
      password: '',
      user_id: '',
    };
    this.hidePassword = false;
  }

  ngOnInit(): void {
    this.getUsersData();
  }

  togglePasswordView() {
    this.hidePassword = !this.hidePassword;
  }

  getUsersData() {
    this.http.get('http://localhost:80/admin/users').subscribe({
      next: (response: any) => {
        if (response.success) {
          let temp: {}[] = [];

          response.user_data.map((item: any, index: number) => {
            temp.push({
              s_no: index + 1,
              name: item.full_name,
              email: item.email,
              user_id: item.id,
            });
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

  registerUser() {
    let validate = this.validateFormData();
    if (validate.success) {
      this.userService
        .register({
          full_name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password,
        })
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.openSnackBar(response.message, 'Ok', true);
              this.closeModal();
              this.getUsersData();
            } else {
              this.openSnackBar(response.message, 'Ok');
            }
          },
          error: (error) => {
            console.log('errr', error);

            this.openSnackBar(
              error?.error?.message ?? 'Failed to create user',
              'Ok'
            );
          },
        });
    } else {
      this.openSnackBar(validate.message, 'Ok');
    }
  }

  validateFormData() {
    if (this.formData.name.trim().length === 0) {
      return { success: false, message: 'Name is Missing' };
    }
    if (this.formData.email.trim().length === 0) {
      return { success: false, message: 'Email is Missing' };
    }
    if (this.formData.password.trim().length === 0) {
      return { success: false, message: 'Password is Missing' };
    }
    return { success: true, message: 'All Good' };
  }

  createUser() {
    this.isCreateOpen = true;
    this.openModal();
  }

  editUser(user_details: any) {
    this.formData = {
      name: user_details.name,
      email: user_details.email,
      password: '',
      user_id: user_details.user_id,
    };
    this.openModal();
  }

  deleteUser(user_details: any) {
    this.loading = true;
    this.http
      .delete('http://localhost:80/admin/user/' + user_details.user_id)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.openSnackBar(response.message, 'Ok', true);
            this.getUsersData();
            this.closeModal();
          } else {
            this.openSnackBar(response.message, 'Ok');
          }
        },
        error: () => {
          this.openSnackBar('Failed to delete user', 'Ok');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  updateUser() {
    let validate = this.validateFormData();
    if (validate.success) {
      this.loading = true;
      this.http
        .put('http://localhost:80/admin/user/' + this.formData.user_id, {
          full_name: this.formData.name,
          email: this.formData.email,
          password: this.formData.password,
        })
        .subscribe({
          next: (response: any) => {
            if (response.success) {
              this.openSnackBar(response.message, 'Ok', true);
              this.getUsersData();
              this.closeModal();
            } else {
              this.openSnackBar(response.message, 'Ok');
            }
          },
          error: () => {
            this.openSnackBar('Failed to delete user', 'Ok');
          },
          complete: () => {
            this.loading = false;
          },
        });
    } else {
      this.openSnackBar(validate.message, 'Ok');
    }
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  // Method to close the modal
  closeModal(): void {
    this.isModalOpen = false;
    this.isCreateOpen = false;
    this.formData = {
      name: '',
      email: '',
      password: '',
      user_id: '',
    };
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    });
  }
}
