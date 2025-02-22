import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontendAuthComponent } from './frontend-auth.component';

describe('FrontendAuthComponent', () => {
  let component: FrontendAuthComponent;
  let fixture: ComponentFixture<FrontendAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontendAuthComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrontendAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
