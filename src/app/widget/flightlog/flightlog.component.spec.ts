import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightlogComponent } from './flightlog.component';

describe('FlightlogComponent', () => {
  let component: FlightlogComponent;
  let fixture: ComponentFixture<FlightlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightlogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlightlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
