import { DatePipe } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { UserService } from 'src/app/Services/user.service'


interface SelectInput {
  value: string,
  viewValue: string
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [DatePipe] // Make sure to provide DatePipe
})

export class RegisterComponent implements OnInit {
  name: string
  email: string
  password: string
  hidePassword: boolean

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snackBar: MatSnackBar,
    private userService: UserService
  ) {
    this.name = ""
    this.email = ""
    this.password = ""
    this.hidePassword = false
  }

  ngOnInit(): void {

  }

  register() {
    let validate = this.validateFormData()
    if (validate.success) {
      this.userService.register({ full_name: this.name, email: this.email, password: this.password }).subscribe({
        next: (response: any) => {
          
          if (response.success) {
            
            this.openSnackBar(response.message, 'Ok', true)
            this.name = ""
            this.email = ""
            this.password = ""
            // this.router.navigate(['dashboard'])
          } else {
            this.openSnackBar(response.message, 'Ok')
          }
        },
        error: (error) => {
          this.openSnackBar(error.error.message, 'Ok')
        }
      })
    } else {
      this.openSnackBar(validate.message, 'Ok')
    }

  }

  validateFormData() {
    if (this.name.trim().length === 0) {
      return { success: false, "message": "Name is Missing" }
    }
    if (this.email.trim().length === 0) {
      return { success: false, "message": "Email is Missing" }
    }
    if (this.password.trim().length === 0) {
      return { success: false, "message": "Password is Missing" }
    }
    return { success: true, "message": "All Good" }
  }

  redirectToLogin() {
    this.router.navigate(['auth/login'])
  }

  togglePasswordView() {
    this.hidePassword = !this.hidePassword
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    })
  }
}
