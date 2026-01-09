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
        path: 'config', 
        loadComponent : ()=>import('./Components/Admin/Config/configuration/configuration').then(d => d.Configuration)
    }
];
