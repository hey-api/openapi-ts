# Angular support

This tool allows you to generate a client based on the Angular [`HttpClient`](https://angular.io/guide/http).
The generated services are fully injectable and make use of the [RxJS](https://rxjs.dev/) Observer pattern.
If you want to generate the Angular based client then you can specify `--client angular` in the openapi call:

`openapi --input ./spec.json --output ./generated --client angular`

The Angular client has been tested with the following versions:

```
"@angular/common": "16.0.x",
"@angular/core": "16.0.x",
"rxjs": "7.5.x",
```

## Example

In the AppModule you can import the services and add them to the list of injectable services:

```typescript
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { OrganizationService } from './generated/services/OrganizationService';

@NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
    ],
    providers: [
        OrganizationService,
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
```

Inside the component you can inject the service and just use it as you would with any observable:

```typescript
import { Component } from '@angular/core';
import { throwError} from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

import type { OrganizationService } from './generated/services/OrganizationService';

@Component({
    selector: 'app-root',
    template: `<div>Angular is ready</div>`,
})
export class AppComponent {
    constructor(private readonly organizationService: OrganizationService) {

        // Supports making a simple call
        this.organizationService
            .createOrganization({
                name: 'OrgName',
                description: 'OrgDescription',
            })
            .subscribe(organization => {
                console.log(organization);
            });

        // Or creating flows with rety(), catchError() and map()
        this.organizationService
            .getOrganizations()
            .pipe(
                retry(3),
                catchError(error =>
                    throwError(error)
                ),
                map(organizations => organizations[0]),
            )
            .subscribe(organization => {
                console.log(organization);
            });
    }
}
```
