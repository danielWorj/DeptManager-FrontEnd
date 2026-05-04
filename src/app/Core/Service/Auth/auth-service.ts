import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeptManager } from '../../Constant/EndPoints';
import { BasicAuthData } from '../../Model/Utilisateur/BasicAuthData';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http:HttpClient){}
  isAuthenticated(): boolean {
    const id = localStorage.getItem('id');
    return !!id; // Returns true if id exists, false otherwise
  }

  
  basicLogin(request :any):Observable<BasicAuthData>{
    return this.http.post<BasicAuthData>(DeptManager.Auth.baslogin, request)
  }
}
