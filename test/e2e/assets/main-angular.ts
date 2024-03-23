import { HttpClientModule } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { OpenAPI } from './client/core/OpenAPI';
import { CollectionFormatService } from './client/services/CollectionFormatService';
import { ComplexService } from './client/services/ComplexService';
import { DefaultService } from './client/services/DefaultService';
import { DefaultsService } from './client/services/DefaultsService';
import { DuplicateService } from './client/services/DuplicateService';
import { ErrorService } from './client/services/ErrorService';
import { HeaderService } from './client/services/HeaderService';
import { MultipleTags1Service } from './client/services/MultipleTags1Service';
import { MultipleTags2Service } from './client/services/MultipleTags2Service';
import { MultipleTags3Service } from './client/services/MultipleTags3Service';
import { NoContentService } from './client/services/NoContentService';
import { ParametersService } from './client/services/ParametersService';
import { ResponseService } from './client/services/ResponseService';
import { SimpleService } from './client/services/SimpleService';
import { TypesService } from './client/services/TypesService';

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
        // @ts-ignore
        window.api = {
            OpenAPI,
            CollectionFormatService: this.collectionFormatService,
            ComplexService: this.complexService,
            DefaultService: this.defaultService,
            DefaultsService: this.defaultsService,
            DuplicateService: this.duplicateService,
            ErrorService: this.errorService,
            HeaderService: this.headerService,
            MultipleTags1Service: this.multipleTags1Service,
            MultipleTags2Service: this.multipleTags2Service,
            MultipleTags3Service: this.multipleTags3Service,
            NoContentService: this.noContentService,
            ParametersService: this.parametersService,
            ResponseService: this.responseService,
            SimpleService: this.simpleService,
            TypesService: this.typesService,
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
