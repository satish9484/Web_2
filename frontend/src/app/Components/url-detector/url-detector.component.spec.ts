import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlDetectorComponent } from './url-detector.component';

describe('UrlDetectorComponent', () => {
  let component: UrlDetectorComponent;
  let fixture: ComponentFixture<UrlDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlDetectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
