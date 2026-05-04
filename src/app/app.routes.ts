import { Routes } from '@angular/router';
import { RenderMode } from '@angular/ssr';

export const routes: Routes = [
    {
        path : '', 
        loadComponent: ()=>import('./Components/Website/landing-page/landing-page').then(l=>l.LandingPage)
    },
    {
        path: 'admin-dashboard', 
        loadComponent : ()=>import('./Components/Admin/dashboard/dashboard').then(d => d.Dashboard)
    },
    {
        path: 'admin-time', 
        loadComponent : ()=>import('./Components/Admin/time/time').then(t => t.Time)
    },
     {
        path: 'admin-etudiants', 
        loadComponent : ()=>import('./Components/Admin/etudiant-c/etudiant-c').then(e => e.EtudiantC)
    },
    {
        path: 'admin-enseignants', 
        loadComponent : ()=>import('./Components/Admin/enseignants-c/enseignants-c').then(e => e.EnseignantsC)
    },
    {
        path: 'admin-documentation', 
        loadComponent : ()=>import('./Components/Admin/documentation/documentation').then(d => d.DocumentationC)
    },
    {
        path: 'config', 
        loadComponent : ()=>import('./Components/Admin/Config/configuration/configuration').then(d => d.Configuration)
    },
    {
        path: 'admin-requete', 
        loadComponent : ()=>import('./Components/Admin/requete/requete').then(r => r.RequeteC)
    },
    
    {
        path: 'admin-actualite', 
        loadComponent : ()=>import('./Components/Admin/actualite/actualite').then(a => a.ActualiteE)
    },
    {
        path: 'admin-note', 
        loadComponent : ()=>import('./Components/Admin/notes/notes').then(n => n.NotesC)
    },
    {
        path: 'admin-repartition', 
        loadComponent : ()=>import('./Components/Admin/repartition/repartition').then(n => n.RepartitionC)
    }, 



    //WEBSITE 


    {
        path : 'landing-page', 
        loadComponent: ()=>import('./Components/Website/landing-page/landing-page').then(l=>l.LandingPage)
    }, 
    {
        path : 'dept-page', 
        loadComponent: ()=>import('./Components/Website/page-departement/page-departement').then(d=>d.PageDepartement)
    },
    
    {
        path : 'filiere-page', 
        loadComponent: ()=>import('./Components/Website/page-filiere/page-filiere').then(f=>f.PageFiliere)
    },
    {
        path : 'recherche', 
        loadComponent: ()=>import('./Components/Website/page-llm/page-llm').then(r=>r.PageLlm)
    },
    // {
    //     path : 'departements/:id', 
    //     loadComponent: ()=>import('./Components/Website/page-departement/page-departement').then(c=>c.PageDepartement)
    // },
    {
        path : 'departements', 
        loadComponent: ()=>import('./Components/Website/departements/departements').then(c=>c.Departements)
    },
    // {
    //     path : 'filieres/:id', 
    //     modeRender : RenderMode.Prerender,
    //     async getPrerenderParams() {
    //         return [{ id: '1' }, { id: '2' }]; // tes IDs réels
    //     },

    //     loadComponent: ()=>import('./Components/Website/page-filiere/page-filiere').then(c=>c.PageFiliere)
    // },
    {
        path : 'filieres', 
        loadComponent: ()=>import('./Components/Website/filieres/filieres').then(c=>c.Filieres)
    },



    //ETUDIANT 

    {
        path : 'etudiant-note', 
        loadComponent: ()=>import('./Components/Etudiant/notes-e/notes-e').then(n=>n.NotesE)
    },
    {
        path : 'etudiant-time', 
        loadComponent: ()=>import('./Components/Etudiant/time-e/time-e').then(t=>t.TimeE)
    },
    {
        path : 'etudiant-requete', 
        loadComponent: ()=>import('./Components/Etudiant/requete/requete').then(r=>r.RequeteE)
    },

    //

];
