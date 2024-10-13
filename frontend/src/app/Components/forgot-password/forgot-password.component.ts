import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email: string

  constructor(private http: HttpClient, private router: Router) {
    this.email = ""
  }

  ngOnInit(): void {
  }

  forgotPasswordAction() {
    
  }

  redirectToLogin() {
    this.router.navigate(["auth/login"])
  }

}
