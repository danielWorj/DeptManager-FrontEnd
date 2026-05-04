import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../Core/Service/Auth/auth-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BasicAuthData } from '../../../Core/Model/Utilisateur/BasicAuthData';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  userFb!:FormGroup; 

  @Output() statut = new EventEmitter<boolean>(); 
  authForm !:FormGroup; 
  constructor(private fb:FormBuilder , private authService :AuthService){
    this.authForm = this.fb.group({
      matricule :new FormControl(), 
      password : new FormControl(), 
    }); 
  }

  login():void{

    this.statut.emit(true); 

    // const formData : FormData = new FormData(); 

    // formData.append("auth", JSON.stringify(this.authForm.value)); 


    // this.authService.basicLogin(formData).subscribe({
    //   next:(data:BasicAuthData)=>{
    //     if (data !=null) {
    //       //L'utilisateur a etet troyve
    //       this.statut.emit(true); 

    //       sessionStorage.setItem("id", `${data.id}`);
    //       sessionStorage.setItem("role", `${data.id}`); 
          
    //     }
    //   }
    // })
  }



}
