import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppearenceDialogueComponent } from './appearence-dialogue.component';

describe('AppearenceDialogueComponent', () => {
  let component: AppearenceDialogueComponent;
  let fixture: ComponentFixture<AppearenceDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppearenceDialogueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppearenceDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
