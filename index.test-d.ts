import {IncomingMessage} from 'node:http';
import {PassThrough as PassThroughStream} from 'node:stream';
import {expectType} from 'tsd';
import mimicResponse from './index.js';

class CustomStream extends PassThroughStream {
	get method() {
		return null;
	}
}

let responseStream!: IncomingMessage;
const myStream = new PassThroughStream();
const myCustomStream = new CustomStream();

expectType<PassThroughStream & IncomingMessage>(mimicResponse(responseStream, myStream));
expectType<CustomStream & IncomingMessage>(mimicResponse(responseStream, myCustomStream));
