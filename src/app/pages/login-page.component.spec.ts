import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AdminConfigStore } from '../core/admin-config.store';
import { LoginPageComponent } from './login-page.component';
import { vi } from 'vitest';

describe('LoginPageComponent', () => {
  function jwtWithRoles(roles: string[]): string {
    const base64Url = (value: string) =>
      btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return [
      base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
      base64Url(JSON.stringify({ roles })),
      'signature'
    ].join('.');
  }

  let httpMock: HttpTestingController;
  let router: Router;
  let mockConfig: {
    baseUrl: () => string;
    token: () => string;
    preferredRoute: () => string;
    setBaseUrl: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    setEmail: ReturnType<typeof vi.fn>;
    clearToken: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockConfig = {
      baseUrl: () => 'http://localhost:9999',
      token: () => '',
      preferredRoute: () => '/feedback',
      setBaseUrl: vi.fn(),
      setToken: vi.fn(),
      setEmail: vi.fn(),
      clearToken: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AdminConfigStore, useValue: mockConfig }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpMock.verify());

  it('should create without redirect when no token', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.error).toBe('');
  });

  it('should redirect to /reports when already logged in', () => {
    mockConfig.token = () => 'existing-token';
    mockConfig.preferredRoute = () => '/book-submissions';
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    TestBed.createComponent(LoginPageComponent);
    expect(navigateSpy).toHaveBeenCalledWith('/book-submissions');
  });

  it('should set error without calling API when fields are empty', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;
    comp.baseUrl = 'http://localhost:9999';
    comp.email = '';
    comp.password = '';
    comp.login();
    expect(comp.error).toBeTruthy();
  });

  it('should call login API, store token, and navigate on success', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;

    comp.baseUrl = 'http://localhost:9999';
    comp.email = 'admin@test.com';
    comp.password = 'secret';
    comp.login();

    const req = httpMock.expectOne('http://localhost:9999/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@test.com', password: 'secret' });
    req.flush({ accessToken: jwtWithRoles(['GOVERNANCE_ADMIN']) });

    expect(mockConfig.setToken).toHaveBeenCalledWith(jwtWithRoles(['GOVERNANCE_ADMIN']));
    expect(mockConfig.setEmail).toHaveBeenCalledWith('admin@test.com');
    expect(navigateSpy).toHaveBeenCalledWith('/feedback');
    expect(comp.error).toBe('');
  });

  it('should set error and not store token on login failure', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;

    comp.baseUrl = 'http://localhost:9999';
    comp.email = 'admin@test.com';
    comp.password = 'wrong';
    comp.login();

    const req = httpMock.expectOne('http://localhost:9999/api/v1/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(comp.error).toBeTruthy();
    expect(mockConfig.setToken).not.toHaveBeenCalled();
  });

  it('should set error when response contains no accessToken', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;

    comp.baseUrl = 'http://localhost:9999';
    comp.email = 'admin@test.com';
    comp.password = 'secret';
    comp.login();

    const req = httpMock.expectOne('http://localhost:9999/api/v1/auth/login');
    req.flush({});

    expect(comp.error).toBeTruthy();
    expect(mockConfig.setToken).not.toHaveBeenCalled();
  });
});
