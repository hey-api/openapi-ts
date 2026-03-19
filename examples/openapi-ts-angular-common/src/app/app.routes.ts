import type { Routes } from '@angular/router';

import { Demo } from './demo/demo';

export const routes: Routes = [
  {
    component: Demo,
    path: '',
    pathMatch: 'full',
  },
];
