import { Routes } from '@angular/router';
import {Home} from './components/home/home';
import { Error } from './components/error/error';
import {Login} from './components/login/login';
import { Register } from './components/register/register';

import { routeGuard } from './core/guards/routes.guard';
import { adminGuard } from './core/guards/admin.guard';
export const routes: Routes = [
    {path:'',component:Home},
    {path:'home',component:Home},
    {path:'login',component:Login},
    {path:'register',component:Register},

    {path:'**',component:Error},
];
