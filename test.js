import stream from 'stream';
import http from 'http';
import test from 'ava';
import createTestServer from 'create-test-server';
import pify from 'pify';
import mimicResponse from '.';

let server;

test.before(async () => {
	server = await createTestServer();

	server.get('/', (request, response) => {
		response.send('');
	});
});

test('normal', async t => {
	const response = await pify(http.get, {errorFirst: false})(server.url);
	response.unicorn = '🦄';
	response.getContext = function () {
		return this;
	};

	const toStream = new stream.PassThrough();
	mimicResponse(response, toStream);

	t.is(toStream.statusCode, 200);
	t.is(toStream.unicorn, '🦄');
	t.is(toStream.getContext(), response.getContext());
});

test('do not overwrite prototype properties', async t => {
	const response = await pify(http.get, {errorFirst: false})(server.url);
	response.unicorn = '🦄';
	response.getContext = function () {
		return this;
	};

	const origOn = response.on;
	response.on = function (name, handler) {
		return origOn.call(this, name, handler);
	};

	const toStream = new stream.PassThrough();
	mimicResponse(response, toStream);

	t.false(Object.keys(toStream).includes('on'));
	t.is(toStream.statusCode, 200);
	t.is(toStream.unicorn, '🦄');
	t.is(toStream.getContext(), response.getContext());
});
