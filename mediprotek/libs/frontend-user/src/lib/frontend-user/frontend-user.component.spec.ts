import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontendUserComponent } from './frontend-user.component';

describe('FrontendUserComponent', () => {
  let component: FrontendUserComponent;
  let fixture: ComponentFixture<FrontendUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrontendUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FrontendUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
