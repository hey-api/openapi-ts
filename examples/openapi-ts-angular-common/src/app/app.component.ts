import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Demo } from './demo/demo';

@Component({
  host: { ngSkipHydration: 'true' },
  imports: [RouterOutlet, Demo],
  selector: 'app-root',
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = '@hey-api/openapi-ts 🤝 Angular Resource API';
}
