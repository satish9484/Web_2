import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-feedback',
  templateUrl: './user-feedback.component.html',
  styleUrls: ['./user-feedback.component.css'],
})

// interface feedbackType
export class UserFeedbackComponent implements OnInit {
  dataSource: {
    _id: string;
    url: string;
    user_id: string;
    created_at: string;
    predicted_flag: string;
    updated_at: string;
    user_feedback: string; // safe or unsafe
    reason: string; // mention the reason for not agreering
  }[] = [];
  loader: boolean;
  isModalOpen: boolean;
  url: string;
  reason: string;

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.loader = false;
    this.isModalOpen = false;
    this.url = '';
    this.reason = '';
  }

  ngOnInit(): void {
    this.getFeedbackData();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  openModal(feedback: any) {
    this.isModalOpen = true;
    this.url = feedback.url;
    this.reason = feedback.reason;
  }

  updateUrlFlag(value: boolean) {
    this.http.post('http://localhost:80/admin/flag-url', {}).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.openSnackBar(
            response.message ?? 'Flag raised successfully',
            'OK',
            true
          );
          this.closeModal();
        } else {
          this.openSnackBar(response.message ?? 'Failed to get data', 'OK');
        }
      },
      error: () => {
        this.openSnackBar('Failed to get data', 'OK');
      },
      complete: () => {
        this.loader = false;
      },
    });
  }

  getFeedbackData() {
    this.loader = true;
    this.http.get('http://localhost:80/admin/get-all-feedback').subscribe({
      next: (response: any) => {
        if (response.success) {
          let temp: any = [];
          response.feedbacks.map((item: any) => {
            temp.push({
              _id: item._id,
              url: item.url,
              user_id: item.user_id,
              created_at: item.created_at,
              predicted_flag: item.predicted_flag,
              updated_at: item.updated_at,
              user_feedback: item.user_feedback,
              reason: item.reason,
            });
          });
          this.dataSource = temp;
        } else {
          this.openSnackBar(response.message ?? 'Failed to get data', 'OK');
        }
      },
      error: () => {
        this.openSnackBar('Failed to get data', 'OK');
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
