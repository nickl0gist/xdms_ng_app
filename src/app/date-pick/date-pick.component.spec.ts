import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickComponent } from './date-pick.component';

describe('DatePickComponent', () => {
  let component: DatePickComponent;
  let fixture: ComponentFixture<DatePickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatePickComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatePickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
