import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlFeedbackComponent } from './url-feedback.component';

describe('UrlFeedbackComponent', () => {
  let component: UrlFeedbackComponent;
  let fixture: ComponentFixture<UrlFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlFeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
