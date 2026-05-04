import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../../Core/Service/Config/config-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Salle } from '../../../../Core/Model/Structure/Salle';
import { ResponseServer } from '../../../../Core/Model/Server/ResponseServer';

@Component({
  selector: 'app-salle-c',
  imports: [ReactiveFormsModule],
  templateUrl: './salle-c.html',
  styleUrl: './salle-c.css',
})
export class SalleC {
   salleForm!:FormGroup; 
  constructor(private fb : FormBuilder , private configService : ConfigService){
    this.salleForm = this.fb.group({
      id : new FormControl(),
      intitule : new FormControl(),
    }); 

    this.loadPage(); 
  }

  loadPage(){
    this.getAllSalle(); 
  }

  listSalle = signal<Salle[]>([]);
  getAllSalle(){
    this.configService.getAllSalle().subscribe({
      next : (data : Salle[])=>{
        this.listSalle.set(data); 
      }, 
      error :()=>{
        console.log('fecth Salle : failed'); 
      }
    })
  }

  createSalle(){
    const formData : FormData = new FormData(); 

    formData.append("salle", JSON.stringify(this.salleForm.value)); 

    this.configService.createSalle(formData).subscribe({
      next:(data:ResponseServer)=>{
        if (data) {
          console.log('creation Salle '); 
          this.getAllSalle(); 
          this.salleForm.reset(); 
        }
      }, 
      error:()=>{
        console.log('creation console : failed'); 
      }
    })
  }
}
