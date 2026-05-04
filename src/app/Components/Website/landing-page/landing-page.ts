import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Departement, DepartementConstruct } from '../../../Core/Model/Structure/Departement';
import { Actualite } from '../../../Core/Model/Actualite/Actualite';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  constructor(private configService : ConfigService){
    this.getAllDepartement();
  }


  listDepartement = signal<Departement[]>([]);
  getAllDepartement(){
    this.configService.getAllDepartement().subscribe({
      next:(data:Departement[])=>{
        this.listDepartement.set(data); 
        this.constructDepartement(this.listDepartement())
      },
      error:(err)=>console.log('Fecth all departement', err)
    }); 
  }

  resultats : DepartementConstruct[]=[]; 
  listDepartementContruct = signal<DepartementConstruct[]>([]); 

  async constructDepartement(list:Departement[]){
    for(const d of list){
      let medias = await this.configService.getAllMediaByDepartement(d.id).toPromise(); 

      let photoProfil = medias?.find(m => m.profil==true); 
      const departementC : DepartementConstruct = {
        departement : d, 
        profil : photoProfil!, 
        medias : medias!
      }

      this.resultats.push(departementC); 
    }
    
    this.listDepartementContruct.set(this.resultats);
  }

  listActualite = signal<Actualite[]>([]); 
  getLast03(){
    this.configService.getLast03Actualite().subscribe({
      next:(data:Actualite[])=>{
        this.listActualite.set(data); 
      },
      error:(err)=>console.log('Fecth all actualite', err)
    }); 
  }

  selectDepartement(departement:DepartementConstruct){
    sessionStorage.setItem("idDepartement", departement.departement.id.toString()); 
    window.location.href = "/departement";
  }
}
