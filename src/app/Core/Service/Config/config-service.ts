import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Matiere } from '../../Model/Structure/Matiere';
import { DepartementC } from '../../../Components/Admin/Config/departement-c/departement-c';
import { DeptManager } from '../../Constant/EndPoints';
import { ResponseServer } from '../../Model/Server/ResponseServer';
import { Departement } from '../../Model/Structure/Departement';
import { Filiere } from '../../Model/Structure/Filiere';
import { Salle } from '../../Model/Structure/Salle';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private http:HttpClient){

  }
  //Departement 
  
  getAllDepartement():Observable<Departement[]>{
    return this.http.get<Departement[]>(DeptManager.Config.Departement.all)
  }

  createDepartement(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Departement.create,request);
  }

  updateDepartement(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Departement.update,request);
  }

  deleteDepartement(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Departement.delete+id);
  }
  
  //Filiere
  
  getAllFiliere():Observable<Filiere[]>{
    return this.http.get<Filiere[]>(DeptManager.Config.Filiere.all)
  }

  createFiliere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Filiere.create,request);
  }

  updateFiliere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Filiere.update,request);
  }

  deleteFiliere(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Filiere.delete+id);
  }
  //Matiere 

  getAllMatiere():Observable<Matiere[]>{
    return this.http.get<Matiere[]>(DeptManager.Config.Matiere.all)
  }

  createMatiere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Matiere.create,request);
  }

  updateMatiere(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Matiere.update,request);
  }

  deleteMatiere(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Matiere.delete+id);
  }

  //Salle 
  
  getAllSalle():Observable<Salle[]>{
    return this.http.get<Salle[]>(DeptManager.Config.Salle.all)
  }

  createSalle(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Salle.create,request);
  }

  updateSalle(request:any):Observable<ResponseServer>{
    return this.http.post<ResponseServer>(DeptManager.Config.Salle.update,request);
  }

  deleteSalle(id:number):Observable<ResponseServer>{
    return this.http.get<ResponseServer>(DeptManager.Config.Salle.delete+id);
  }

}
