# mimic-response

> Mimic a [Node.js HTTP response stream](https://nodejs.org/api/http.html#http_class_http_incomingmessage)

## Install

```sh
npm install mimic-response
```

## Usage

```js
import {PassThrough as PassThroughStream} from 'node:stream';
import mimicResponse from 'mimic-response';

const responseStream = getHttpResponseStream();
const myStream = new PassThroughStream();

mimicResponse(responseStream, myStream);

console.log(myStream.statusCode);
//=> 200
```

## API

### mimicResponse(from, to)

**Note #1:** The `from.destroy(error)` function is not proxied. You have to call it manually:

```js
import {PassThrough as PassThroughStream} from 'node:stream';
import mimicResponse from 'mimic-response';

const responseStream = getHttpResponseStream();

const myStream = new PassThroughStream({
	destroy(error, callback) {
		responseStream.destroy();

		callback(error);
	}
});

myStream.destroy();
```

Please note that `myStream` and `responseStream` never throw. The error is passed to the request instead.

#### from

Type: `Stream`

[Node.js HTTP response stream.](https://nodejs.org/api/http.html#http_class_http_incomingmessage)

#### to

Type: `Stream`

Any stream.

## Related

- [clone-response](https://github.com/lukechilds/clone-response) - Clone a Node.js response stream
- [mimic-function](https://github.com/sindresorhus/mimic-function) - Make a function mimic another one
