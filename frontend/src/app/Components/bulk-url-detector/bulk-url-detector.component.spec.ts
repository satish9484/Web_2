import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkUrlDetectorComponent } from './bulk-url-detector.component';

describe('BulkUrlDetectorComponent', () => {
  let component: BulkUrlDetectorComponent;
  let fixture: ComponentFixture<BulkUrlDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkUrlDetectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUrlDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
