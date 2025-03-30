import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { Interceptors } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';

import { CollectionFormatService } from './sdk.gen';
import { ComplexService } from './sdk.gen';
import { DefaultService } from './sdk.gen';
import { DefaultsService } from './sdk.gen';
import { DeprecatedService } from './sdk.gen';
import { DescriptionsService } from './sdk.gen';
import { DuplicateService } from './sdk.gen';
import { ErrorService } from './sdk.gen';
import { FileResponseService } from './sdk.gen';
import { FormDataService } from './sdk.gen';
import { HeaderService } from './sdk.gen';
import { MultipartService } from './sdk.gen';
import { MultipleTags1Service } from './sdk.gen';
import { MultipleTags2Service } from './sdk.gen';
import { MultipleTags3Service } from './sdk.gen';
import { NoContentService } from './sdk.gen';
import { NonAsciiÆøåÆøÅöôêÊService } from './sdk.gen';
import { ParametersService } from './sdk.gen';
import { RequestBodyService } from './sdk.gen';
import { ResponseService } from './sdk.gen';
import { SimpleService } from './sdk.gen';
import { TypesService } from './sdk.gen';
import { UploadService } from './sdk.gen';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class ApiClient {

	public readonly collectionFormat: CollectionFormatService;
	public readonly complex: ComplexService;
	public readonly default: DefaultService;
	public readonly defaults: DefaultsService;
	public readonly deprecated: DeprecatedService;
	public readonly descriptions: DescriptionsService;
	public readonly duplicate: DuplicateService;
	public readonly error: ErrorService;
	public readonly fileResponse: FileResponseService;
	public readonly formData: FormDataService;
	public readonly header: HeaderService;
	public readonly multipart: MultipartService;
	public readonly multipleTags1: MultipleTags1Service;
	public readonly multipleTags2: MultipleTags2Service;
	public readonly multipleTags3: MultipleTags3Service;
	public readonly noContent: NoContentService;
	public readonly nonAsciiÆøåÆøÅöôêÊ: NonAsciiÆøåÆøÅöôêÊService;
	public readonly parameters: ParametersService;
	public readonly requestBody: RequestBodyService;
	public readonly response: ResponseService;
	public readonly simple: SimpleService;
	public readonly types: TypesService;
	public readonly upload: UploadService;

	public readonly request: BaseHttpRequest;

	constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
		this.request = new HttpRequest({
			BASE: config?.BASE ?? 'http://localhost:3000/base',
			VERSION: config?.VERSION ?? '1.0',
			WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
			CREDENTIALS: config?.CREDENTIALS ?? 'include',
			TOKEN: config?.TOKEN,
			USERNAME: config?.USERNAME,
			PASSWORD: config?.PASSWORD,
			HEADERS: config?.HEADERS,
			ENCODE_PATH: config?.ENCODE_PATH,
			interceptors: {
				request: config?.interceptors?.request ?? new Interceptors(),
				response: config?.interceptors?.response ?? new Interceptors(),
      },
		});

		this.collectionFormat = new CollectionFormatService(this.request);
		this.complex = new ComplexService(this.request);
		this.default = new DefaultService(this.request);
		this.defaults = new DefaultsService(this.request);
		this.deprecated = new DeprecatedService(this.request);
		this.descriptions = new DescriptionsService(this.request);
		this.duplicate = new DuplicateService(this.request);
		this.error = new ErrorService(this.request);
		this.fileResponse = new FileResponseService(this.request);
		this.formData = new FormDataService(this.request);
		this.header = new HeaderService(this.request);
		this.multipart = new MultipartService(this.request);
		this.multipleTags1 = new MultipleTags1Service(this.request);
		this.multipleTags2 = new MultipleTags2Service(this.request);
		this.multipleTags3 = new MultipleTags3Service(this.request);
		this.noContent = new NoContentService(this.request);
		this.nonAsciiÆøåÆøÅöôêÊ = new NonAsciiÆøåÆøÅöôêÊService(this.request);
		this.parameters = new ParametersService(this.request);
		this.requestBody = new RequestBodyService(this.request);
		this.response = new ResponseService(this.request);
		this.simple = new SimpleService(this.request);
		this.types = new TypesService(this.request);
		this.upload = new UploadService(this.request);
	}
}
