import { HttpClientModule } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { CollectionFormatService } from './services/CollectionFormatService';
import { ComplexService } from './services/ComplexService';
import { DefaultService } from './services/DefaultService';
import { DefaultsService } from './services/DefaultsService';
import { DuplicateService } from './services/DuplicateService';
import { ErrorService } from './services/ErrorService';
import { HeaderService } from './services/HeaderService';
import { MultipleTags1Service } from './services/MultipleTags1Service';
import { MultipleTags2Service } from './services/MultipleTags2Service';
import { MultipleTags3Service } from './services/MultipleTags3Service';
import { NoContentService } from './services/NoContentService';
import { ParametersService } from './services/ParametersService';
import { ResponseService } from './services/ResponseService';
import { SimpleService } from './services/SimpleService';
import { TypesService } from './services/TypesService';

@Component({
    selector: 'app-root',
    templateUrl: `<div>Angular</div>`,
})
export class AppComponent {}

@NgModule({
    imports: [BrowserModule, HttpClientModule],
    providers: [
        CollectionFormatService,
        ComplexService,
        DefaultService,
        DefaultsService,
        DuplicateService,
        ErrorService,
        HeaderService,
        MultipleTags1Service,
        MultipleTags2Service,
        MultipleTags3Service,
        NoContentService,
        ParametersService,
        ResponseService,
        SimpleService,
        TypesService,
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
