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
import { FormDataService } from './services/FormDataService';
import { HeaderService } from './services/HeaderService';
import { MultipartService } from './services/MultipartService';
import { MultipleTags1Service } from './services/MultipleTags1Service';
import { MultipleTags2Service } from './services/MultipleTags2Service';
import { MultipleTags3Service } from './services/MultipleTags3Service';
import { NoContentService } from './services/NoContentService';
import { ParametersService } from './services/ParametersService';
import { RequestBodyService } from './services/RequestBodyService';
import { ResponseService } from './services/ResponseService';
import { SimpleService } from './services/SimpleService';
import { TypesService } from './services/TypesService';
import { UploadService } from './services/UploadService';

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
        FormDataService,
        HeaderService,
        MultipartService,
        MultipleTags1Service,
        MultipleTags2Service,
        MultipleTags3Service,
        NoContentService,
        ParametersService,
        RequestBodyService,
        ResponseService,
        SimpleService,
        TypesService,
        UploadService,
    ],
})
export class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
