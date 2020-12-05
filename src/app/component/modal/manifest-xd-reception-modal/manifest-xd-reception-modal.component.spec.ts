import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestXdReceptionModalComponent } from './manifest-xd-reception-modal.component';

describe('ManifestXdReceptionModalComponent', () => {
  let component: ManifestXdReceptionModalComponent;
  let fixture: ComponentFixture<ManifestXdReceptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManifestXdReceptionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManifestXdReceptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
