import { HttpClientModule } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { OpenAPI } from './core/OpenAPI';
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
    template: `<div>Angular is ready</div>`,
})
export class AppComponent {
    constructor(
        private readonly collectionFormatService: CollectionFormatService,
        private readonly complexService: ComplexService,
        private readonly defaultService: DefaultService,
        private readonly defaultsService: DefaultsService,
        private readonly duplicateService: DuplicateService,
        private readonly errorService: ErrorService,
        private readonly headerService: HeaderService,
        private readonly multipleTags1Service: MultipleTags1Service,
        private readonly multipleTags2Service: MultipleTags2Service,
        private readonly multipleTags3Service: MultipleTags3Service,
        private readonly noContentService: NoContentService,
        private readonly parametersService: ParametersService,
        private readonly responseService: ResponseService,
        private readonly simpleService: SimpleService,
        private readonly typesService: TypesService
    ) {
        (window as any).api = {
            OpenAPI,
            CollectionFormatService: collectionFormatService,
            ComplexService: complexService,
            DefaultService: defaultService,
            DefaultsService: defaultsService,
            DuplicateService: duplicateService,
            ErrorService: errorService,
            HeaderService: headerService,
            MultipleTags1Service: multipleTags1Service,
            MultipleTags2Service: multipleTags2Service,
            MultipleTags3Service: multipleTags3Service,
            NoContentService: noContentService,
            ParametersService: parametersService,
            ResponseService: responseService,
            SimpleService: simpleService,
            TypesService: typesService,
        };
    }
}

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
    bootstrap: [AppComponent],
})
export class AppModule {}

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(err => console.error(err));
