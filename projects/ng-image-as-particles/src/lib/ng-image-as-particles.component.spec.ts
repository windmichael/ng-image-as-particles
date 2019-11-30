import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgImageAsParticlesComponent } from './ng-image-as-particles.component';

describe('NgImageAsParticlesComponent', () => {
  let component: NgImageAsParticlesComponent;
  let fixture: ComponentFixture<NgImageAsParticlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgImageAsParticlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgImageAsParticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
