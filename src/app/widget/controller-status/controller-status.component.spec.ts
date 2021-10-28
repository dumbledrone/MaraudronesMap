import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControllerStatusComponent } from './controller-status.component';

describe('ControllerStatusComponent', () => {
  let component: ControllerStatusComponent;
  let fixture: ComponentFixture<ControllerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControllerStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
