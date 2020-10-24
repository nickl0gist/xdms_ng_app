import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TpaRootComponent } from './tpa-root.component';

describe('TpaRootComponent', () => {
  let component: TpaRootComponent;
  let fixture: ComponentFixture<TpaRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TpaRootComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TpaRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
