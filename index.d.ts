import {IncomingMessage} from 'http';

declare type KnownProperties =
	| 'complete'
	| 'destroy'
	| 'headers'
	| 'httpVersion'
	| 'httpVersionMinor'
	| 'httpVersionMajor'
	| 'method'
	| 'rawHeaders'
	| 'rawTrailers'
	| 'setTimeout'
	| 'socket'
	| 'statusCode'
	| 'statusMessage'
	| 'trailers'
	| 'url';

/** Helper type to flatten nested mapped types */
declare type Identity<T> = {} & {[K in keyof T]: T[K]};

/**
 * Makes `toStream` include the properties from `fromStream`.
 *
 * @param fromStream The stream to copy the properties from.
 * @param toStream The stream to copy the properties to.
 * @return The same object as `toStream`.
 */
declare function mimicResponse<T extends NodeJS.ReadableStream>(
	fromStream: IncomingMessage,
	toStream: T,
): T & Identity<Pick<IncomingMessage, Exclude<KnownProperties, keyof T>>>;

export = mimicResponse;
