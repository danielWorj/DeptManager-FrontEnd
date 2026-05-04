import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationC } from './documentation';

describe('DocumentationC', () => {
  let component: DocumentationC;
  let fixture: ComponentFixture<DocumentationC>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentationC]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentationC);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
