import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import { Error } from './components/error/error';
import {Login} from './components/login/login';
import { Role } from './components/role/role';
import { Register } from './components/register/register';
import { routeGuard } from './core/guards/routes.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    {path:'',component:Home},
    {path:'home',component:Home},
    {path:'login',component:Login, canActivate:[guestGuard]},
    {path:'register',component:Register},
    { path: 'role', component: Role, canActivate: [routeGuard, adminGuard] },

    {path:'**',component:Error},
];
