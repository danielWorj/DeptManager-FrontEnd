import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', 
        loadComponent : ()=>import('./Components/Admin/dashboard/dashboard').then(d => d.Dashboard)
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
        path: 'admin-note', 
        loadComponent : ()=>import('./Components/Admin/notes/notes').then(n => n.NotesC)
    },
    {
        path: 'admin-repartition', 
        loadComponent : ()=>import('./Components/Admin/repartition/repartition').then(n => n.RepartitionC)
    }
];
