import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-token-expired',
  templateUrl: './token-expired.component.html',
  styleUrls: ['./token-expired.component.css']
})
export class TokenExpiredComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) {

  }

  ngOnInit(): void {
  }

  handleGoBack() {
    this.router.navigate(['auth/login'])
  }
}
