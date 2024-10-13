import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bulk-url-detector',
  templateUrl: './bulk-url-detector.component.html',
  styleUrls: ['./bulk-url-detector.component.css'],
})
export class BulkUrlDetectorComponent implements OnInit {
  file: any;
  loader: boolean;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.loader = false;
  } // Inject HttpClient

  ngOnInit(): void {}

  uploadFile(): void {
    // Create an input element to select the file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // fileInput.accept = '.txt,.xls,.xlsx,.csv';
    fileInput.accept = '.csv';
    fileInput.click();

    // Handle file selection
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];

      // Allowed file types and max size (5MB)
      const allowedTypes = [
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        // this.openSnackBar('Invalid file type. Supported formats: Text, XL, or CSV.', 'Ok')
        this.openSnackBar('Invalid file type. Supported formats: CSV', 'Ok');
        return;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        this.openSnackBar(
          'File is too large. Maximum size allowed is 5MB.',
          'Ok'
        );
        return;
      }

      this.file = file;
    };
  }

  submitFile() {
    // Prepare the form data
    if (this.file && this.file.name) {
      this.loader = true;
      const formData = new FormData();
      formData.append('file', this.file);
      this.http.post('http://localhost:80/ml/predict-csv', formData).subscribe({
        next: (response: any) => {
          this.openSnackBar(
            response.message ??
              'Uploaded Successfully, we will send you email once file is ready',
            'Ok',
            true
          );
          this.clearFile();
        },
        error: (error: HttpErrorResponse) => {
          this.openSnackBar('Upload failed', 'Ok');
        },
        complete: () => {
          this.loader = false;
        },
      });
    } else {
    }
  }

  clearFile() {
    this.file = null;
    this.loader = false;
  }

  openSnackBar(message: string, action: string, isSuccess: boolean = false) {
    this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: isSuccess ? ['green-snackbar'] : ['red-snackbar'],
    });
  }
}
