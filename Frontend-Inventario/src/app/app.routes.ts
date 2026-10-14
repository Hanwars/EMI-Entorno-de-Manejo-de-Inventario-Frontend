import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import { Error } from './components/error/error';
import { Login } from './components/login/login';


import { routeGuard } from './core/guards/routes.guard';
import { adminGuard } from './core/guards/admin.guard';
export const routes: Routes = [
    {path:'',component:Home},
    {path:'home',component:Home},
    { path: 'login', component: Login },
    {path:'**',component:Error},
];
