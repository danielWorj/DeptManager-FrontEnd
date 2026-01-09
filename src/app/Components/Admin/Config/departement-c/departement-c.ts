import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Departement } from '../../../../Core/Model/Structure/Departement';
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-departement-c',
  imports: [ReactiveFormsModule],
  templateUrl: './departement-c.html',
  styleUrl: './departement-c.css',
})
export class DepartementC {
  departementForm!:FormGroup; 
  constructor(private fb : FormBuilder , private configService : ConfigService){
    this.departementForm = this.fb.group({
      id : new FormControl(),
      abreviation : new FormControl(),
      intitule : new FormControl(),
    }); 

    this.loadPage(); 
  }

  loadPage(){
    this.getAllDepartement();
  }
  listDepartement = signal<Departement[]>([]);
  getAllDepartement(){
    this.configService.getAllDepartement().subscribe({
      next : (data : Departement[])=>{
        this.listDepartement.set(data); 
        console.log('list des departements')

      }, 
      error :()=>{
        console.log('fecth departement : failed'); 
      }
    })
  }

  createDepartement(){
    const formData : FormData = new FormData(); 

    formData.append("departement", JSON.stringify(this.departementForm.value)); 
    this.configService.createDepartement(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data) {
          console.log('creation departement '); 
          this.getAllDepartement(); 
          this.departementForm.reset(); 
        }
      }, 
      error:()=>{
        console.log('creation console : failed'); 
      }
    })
  }

  
}
