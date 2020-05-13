import {expectType} from 'tsd';
import http = require('http');
import stream = require('stream');
import mimicResponse = require('.');

class CustomStream extends stream.PassThrough {
	get method() {
		return null;
	}
}

let responseStream!: http.IncomingMessage;
const myStream = new stream.PassThrough();
const myCustomStream = new CustomStream();

expectType<stream.PassThrough & http.IncomingMessage>(mimicResponse(responseStream, myStream));
expectType<CustomStream & http.IncomingMessage>(mimicResponse(responseStream, myCustomStream));
