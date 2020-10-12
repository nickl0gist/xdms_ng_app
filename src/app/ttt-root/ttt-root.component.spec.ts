import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TttRootComponent } from './ttt-root.component';

describe('TttRootComponent', () => {
  let component: TttRootComponent;
  let fixture: ComponentFixture<TttRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TttRootComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TttRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
