import { TestBed } from '@angular/core/testing';

import { ScolariteService } from './scolarite-service';

describe('ScolariteService', () => {
  let service: ScolariteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScolariteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
