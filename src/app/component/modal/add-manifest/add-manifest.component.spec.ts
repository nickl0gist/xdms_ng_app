import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManifestComponent } from './add-manifest.component';

describe('AddManifestComponent', () => {
  let component: AddManifestComponent;
  let fixture: ComponentFixture<AddManifestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddManifestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManifestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
