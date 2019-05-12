import {expectType} from 'tsd';
import http = require('http');
import stream = require('stream');
import mimicResponse = require('.');

type KnownProperties =
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

type Omit<T, U> = Pick<T, Exclude<keyof T, U>>;
type ExpectedTypeBase = Pick<http.IncomingMessage, KnownProperties>;

class CustomStream extends stream.PassThrough {
	readonly method = null;
}

let responseStream!: http.IncomingMessage;
const myStream = new stream.PassThrough();
const myCustomStream = new CustomStream();

expectType<stream.PassThrough & ExpectedTypeBase>(mimicResponse(responseStream, myStream));
expectType<CustomStream & Omit<ExpectedTypeBase, 'method'>>(mimicResponse(responseStream, myCustomStream));
