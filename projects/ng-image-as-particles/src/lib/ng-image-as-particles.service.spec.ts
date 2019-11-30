import { TestBed } from '@angular/core/testing';

import { NgImageAsParticlesService } from './ng-image-as-particles.service';

describe('NgImageAsParticlesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgImageAsParticlesService = TestBed.get(NgImageAsParticlesService);
    expect(service).toBeTruthy();
  });
});
