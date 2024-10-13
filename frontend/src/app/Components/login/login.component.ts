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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email: string
  password: string
  hidePassword: boolean

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
  ) {
    this.email = ""
    this.password = ""
    this.hidePassword = false
  }

  ngOnInit(): void { 
    if(localStorage.getItem("adminList")) {
      localStorage.removeItem("adminList")
    }
    if(localStorage.getItem("email")) {
      localStorage.removeItem("email")
      localStorage.removeItem('userName')
    }
    if(localStorage.getItem("isLogged")) {
      localStorage.removeItem("isLogged")
    }
    if(localStorage.getItem("role")) {
      localStorage.removeItem("role")
    }
    if(localStorage.getItem("token")) {
      localStorage.removeItem("token")
    }

  }

  login() {
    let validate = this.validateFormData()
    if (validate.success) {
      this.userService.doLogin({ email: this.email, password : this.password }).subscribe({
        next: (response: any) => {
          let userDetails = this.userService.parseJwtToken(response.token)
          if (response.success) {
            this.userService.loginUser(
              response.token,
              this.email,
              this.password,
              userDetails.role,
            )
            this.openSnackBar("Logged In Successfully", 'Ok', true)
            this.router.navigate(['panel/url-detector'])
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
    if (this.email.trim().length === 0) {
      return { success: false, "message": "Email is Missing" }
    }
    if (this.password.trim().length === 0) {
      return { success: false, "message": "Password is Missing" }
    }
    return { success: true, "message": "All Good" }
  }

  redirectToRegister() {
    this.router.navigate(['register'])
  }

  redirectToResetPassword() {
    this.router.navigate(['forgot-password'])
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
