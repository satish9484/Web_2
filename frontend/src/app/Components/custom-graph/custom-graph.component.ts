import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-graph',
  templateUrl: './custom-graph.component.html',
  styleUrls: ['./custom-graph.component.css'],
})
export class CustomGraphComponent implements OnInit {
  htmlContent: string;
  loader: boolean;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.htmlContent = '';
    this.loader = true;
  }

  ngOnInit(): void {
    this.getGraphData();
  }

  getGraphData() {
    // http://localhost:80/admin/get-report?report_type=Train
    this.http
      .get('http://localhost:80/admin/get-report?report_type=Train', {
        responseType: 'text',
      })
      .subscribe({
        next: (response: string) => {
          // if(response.success) {
          this.htmlContent = response.slice(1, response.length - 1);
          console.log('this ', this.htmlContent);

          // } else {
          //   this.openSnackBar(response.message, "Ok")
          // }
        },
        error: () => {
          this.openSnackBar('Failed to get Data', 'Ok');
        },
        complete: () => {
          this.loader = false;
        },
      });
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 2000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    });
  }
}
