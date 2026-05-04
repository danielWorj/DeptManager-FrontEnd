import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./Layout/sidebar/sidebar";
import { Auth } from "./Components/Auth/auth/auth";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StructureLayoutAdmin } from "./Components/LayoutAdmin/structure-layout-admin/structure-layout-admin";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Auth, ReactiveFormsModule, StructureLayoutAdmin],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('deptwebapp');

  // Signal réactif : true = mode site web, false = mode admin
  isPlatform = signal<boolean>(true);

  // Signal réactif : true = utilisateur connecté à l'admin
  isConnected = false;

  // Appelé par <app-auth> après une connexion réussie :
  // on bascule isConnected à true et isPlatform à false pour afficher l'admin
  changeConnectionStatut(e: any) {

    this.isConnected = true;

    if (e) {
      this.isPlatform.set(false);
      console.log('IS CONNECTED :', e);
    }
  }

  login():void{

    //this.statut.emit(true); 

    this.isConnected = true; 
    this.isPlatform.set(false); 

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