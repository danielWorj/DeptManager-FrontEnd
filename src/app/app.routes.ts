import { Routes, CanActivateFn } from '@angular/router';
import { AuthGuard } from './Core/Guards/AuthGuard';

export const routes: Routes = [
    {
        path: 'login', 
        loadComponent : ()=>import('./Components/Auth/auth/auth').then(d => d.Auth)
    },
    {
        path : 'admin',
        loadComponent: ()=>import('./Components/LayoutAdmin/structure-layout-admin/structure-layout-admin').then(d=>d.StructureLayoutAdmin),
        canActivate : [AuthGuard],
        data: { prerender: false },
        children : [
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


        ]
    },
    //WEBSITE 

    {
        path : '',
        loadComponent: ()=>import('./Components/Website/layout/structure/structure').then(a=>a.Structure),
        children : [
                {
                    path : '', 
                    loadComponent: ()=>import('./Components/Website/landing-page/landing-page').then(l=>l.LandingPage)
                },
                {
                    path : 'landing-page', 
                    loadComponent: ()=>import('./Components/Website/landing-page/landing-page').then(l=>l.LandingPage)
                },
                {
                    path : 'contact', 
                    loadComponent: ()=>import('./Components/Website/page-contact/page-contact').then(l=>l.PageContact)
                },
                {
                    path : 'blog', 
                    loadComponent: ()=>import('./Components/Website/blog/blog').then(l=>l.Blog)
                },  
                {
                    path : 'brochure', 
                    loadComponent: ()=>import('./Components/Website/page-brochure/page-brochure').then(l=>l.PageBrochure)
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
                    path : 'llm', 
                    loadComponent: ()=>import('./Components/Website/page-llm/page-llm').then(r=>r.PageLlm)
                },
                {
                    path : 'pole-formation', 
                    loadComponent: ()=>import('./Components/Website/pole-formation/pole-formation').then(r=>r.PoleFormation)
                },
                {
                    path : 'documentation', 
                    loadComponent: ()=>import('./Components/Website/documentation/documentation').then(r=>r.DocumentationC)
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



        ]
    }, 
   
    //

];
