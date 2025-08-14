import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { EquipmentsComponent } from './components/equipments/equipments.component';
import { HelmetsComponent } from './components/helmets/helmets.component';
import { MinersComponent } from './components/miners/miners.component';
import { SupervisorsComponent } from './components/supervisors/supervisors.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EquipmentDetailComponent } from './components/equipment-detail/equipment-detail.component';
import { EquipmentEditComponent } from './components/equipment-edit/equipment-edit.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { MyHelmetComponent } from './components/my-helmet/my-helmet.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { 
    path: '', 
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'equipments', pathMatch: 'full' },
      { path: 'equipments', component: EquipmentsComponent, canActivate: [authGuard], data: { roles: ['admin', 'supervisor'] } },
      { path: 'helmets', component: HelmetsComponent, canActivate: [authGuard], data: { roles: ['admin', 'supervisor'] } },
      { path: 'my-helmet', component: MyHelmetComponent, canActivate: [authGuard], data: { roles: ['minero'] } },
      { path: 'miners', component: MinersComponent, canActivate: [authGuard] },
      { path: 'supervisors', component: SupervisorsComponent, canActivate: [authGuard], data: { roles: ['admin'] } },
      // Alerts/Reports removidos
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'equipment-detail/:id', component: EquipmentDetailComponent, canActivate: [authGuard] },
      { path: 'equipment-edit/:id', component: EquipmentEditComponent, canActivate: [authGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];
