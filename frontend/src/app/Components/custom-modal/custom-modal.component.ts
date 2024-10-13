import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.css']
})
export class CustomModalComponent implements OnInit {
  data: any ={}
  constructor() { }

  @Input() openModal = false
  @Input() individualProfileData = {}

  ngOnInit(): void {

  }

  closeModal() {
    this.openModal = false
  }

}
