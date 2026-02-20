import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Horaire } from '../../Model/Horaire/Horaire';
import { Observable } from 'rxjs';
import { DeptManager } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';

@Injectable({
  providedIn: 'root',
})
export class HoraireService {
  constructor(private http :HttpClient){}
  
  //Horaire
  getAllHoraireByFiliereAndNiveau(idF :number , idN:number):Observable<Horaire[]>{
    return this.http.get<Horaire[]>(DeptManager.Horaire.allByFiliereAndNiveau+idF+'/'+idN);
  }

  getAllHoraireByEnseignant(id:number):Observable<Horaire[]>{
    return this.http.get<Horaire[]>(DeptManager.Horaire.allByEnseignant+'/'+id);
  }

  createHoraire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.create,request);
  }

  updateHoraire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.update,request);
  }
}
