import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitReferenceComponent } from './split-reference.component';

describe('SplitReferenceComponent', () => {
  let component: SplitReferenceComponent;
  let fixture: ComponentFixture<SplitReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitReferenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
