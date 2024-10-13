import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-url-feedback',
  templateUrl: './url-feedback.component.html',
  styleUrls: ['./url-feedback.component.css']
})
export class UrlFeedbackComponent implements OnInit {
  url: string;
  loader: boolean
  constructor(
    private http: HttpClient,
    private _snackBar: MatSnackBar,
  ) { 
    this.url = ""
    this.loader = false
  }

  ngOnInit(): void {
  }

  blackListUrl() {
    if(this.url.trim().length) {
      this.http.post("",{}).subscribe({
        next: () => {
  
        },
        error : () => {
  
        },
        complete : () => {
  
        }
      })
    }
  }

  whiteListUrl() {
    if(this.url.trim().length) {
      this.http.post("",{}).subscribe({
        next: () => {
  
        },
        error : () => {
  
        },
        complete : () => {
  
        }
      })
    }
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    })
  }
}
