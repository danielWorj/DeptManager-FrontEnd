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
    //console.log(DeptManager.Horaire.allByFiliereAndNiveau+idF+'/'+idN); 

    return this.http.get<Horaire[]>(DeptManager.Horaire.allByFiliereAndNiveau+idF+'/'+idN);
  }

  getAllHoraireByEnseignant(id:number):Observable<Horaire[]>{
    return this.http.get<Horaire[]>(DeptManager.Horaire.allByEnseignant+id);
  }

  getHoraireByRepartition(id:number):Observable<Horaire>{
    //console.log(DeptManager.Horaire.allByRepartition+id); 
    return this.http.get<Horaire>(DeptManager.Horaire.allByRepartition+id);
  }

   getHoraireBySalleJourAndPeriode(idS:number, idJ:number , idP:number):Observable<Horaire>{
    //console.log(DeptManager.Horaire.allBySalleJourAndPeriode+idS+'/'+idJ+'/'+idP)
    return this.http.get<Horaire>(DeptManager.Horaire.allBySalleJourAndPeriode+idS+'/'+idJ+'/'+idP);
  }
  createHoraire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.create,request);
  }

  updateHoraire(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Horaire.update,request);
  }

  // Telecharger emploi du temps
  telechargementByFiliereAndNiveau(idF :number , idN:number):Observable<Blob>{
    return this.http.get(DeptManager.Horaire.impression+idF+'/'+idN, { responseType: 'blob' });
  }
}
