import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Filiere } from '../../../../Core/Model/Structure/Filiere';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';
import { Departement } from '../../../../Core/Model/Structure/Departement';

@Component({
  selector: 'app-filiere-c',
  imports: [ReactiveFormsModule],
  templateUrl: './filiere-c.html',
  styleUrl: './filiere-c.css',
})
export class FiliereC {
  filiereForm!:FormGroup; 
  constructor(private fb : FormBuilder , private configService : ConfigService){
    this.filiereForm = this.fb.group({
      id : new FormControl(),
      abreviation : new FormControl(),
      intitule : new FormControl(),
      departement : new FormControl()
    }); 

    this.loadPage(); 
  }

  loadPage(){
    this.getAllFiliere(); 
    this.getAllDepartement(); 
  }
  listFiliere = signal<Filiere[]>([]);
  getAllFiliere(){
    this.configService.getAllFiliere().subscribe({
      next : (data : Filiere[])=>{
        this.listFiliere.set(data); 
        
        this.filiereForm.reset(); 
      }, 
      error :()=>{
        console.log('fecth Filiere : failed'); 
      }
    })
    console.log('get filiere'); 
  }

  listDepartement = signal<Departement[]>([]);
  getAllDepartement(){
    this.configService.getAllDepartement().subscribe({
      next : (data : Departement[])=>{
        this.listDepartement.set(data); 
      }, 
      error :()=>{
        console.log('fecth departement : failed'); 
      }
    })
  }

  createFiliere(){
    const formData : FormData = new FormData(); 

    formData.append("filiere", JSON.stringify(this.filiereForm.value)); 
    this.configService.createFiliere(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data) {
          console.log('creation Filiere ')
        }
      }, 
      error:()=>{
        console.log('creation console : failed'); 
      }
    })
  }
}
