import { TestBed } from '@angular/core/testing';

import { NivelExperiencia } from './nivel-experiencia';

describe('NivelExperiencia', () => {
  let service: NivelExperiencia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NivelExperiencia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
