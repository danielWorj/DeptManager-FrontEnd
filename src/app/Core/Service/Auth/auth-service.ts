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
  basicLogin(request :any):Observable<BasicAuthData>{
    return this.http.post<BasicAuthData>(DeptManager.Auth.baslogin, request)
  }
}
