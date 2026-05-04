import { Component, signal } from '@angular/core';
import { ConfigService } from '../../../Core/Service/Config/config-service';
import { Actualite } from '../../../Core/Model/Actualite/Actualite';

@Component({
  selector: 'app-blog',
  imports: [],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {

    constructor(private configService : ConfigService){}

    actualites = signal<Actualite[]>([]);
    getAllActualite(){
        this.configService.getAllActualite().subscribe({
            next : (response:Actualite[])=>{
               this.actualites.set(response);

               //vedette 
               this.getActualiteEnVedette();
            }, 
            error : (err)=>{
                console.log(err);
            }
        });
    }

    actualiteVedette = signal<Actualite | null>(null);
    getActualiteEnVedette(){
      this.actualiteVedette.set(this.actualites().find(a =>a.vedette==true)!); 
    }


}