import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Matiere } from '../../Model/Scolarite/Matiere';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { DeptManager } from '../../Constant/EndPoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScolariteService {
    constructor(private http:HttpClient){

    }

    //Matiere 
    
    getAllMatiere():Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.all)
    }

    getAllMatiereByFiliere(id:number):Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.allByFiliere+id);
    }

    getAllMatiereByDepartement(id:number):Observable<Matiere[]>{
      return this.http.get<Matiere[]>(DeptManager.Scolarite.Matiere.allByDepartement+id); 
    }
  
    createMatiere(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Matiere.create,request);
    }
  
    updateMatiere(request:any):Observable<ResponseServer>{
      return this.http.post<ResponseServer>(DeptManager.Scolarite.Matiere.update,request);
    }
  
    deleteMatiere(id:number):Observable<ResponseServer>{
      return this.http.get<ResponseServer>(DeptManager.Scolarite.Matiere.delete+id);
    }

    //
    
}
