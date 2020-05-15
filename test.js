import stream from 'stream';
import http from 'http';
import test from 'ava';
import createTestServer from 'create-test-server';
import pify from 'pify';
import pEvent from 'p-event';
import mimicResponse from '.';

const nodejsMajorVersion = process.versions.node.split('.')[0];
let server;

test.before(async () => {
	server = await createTestServer();

	server.get('/', (_request, response) => {
		response.write('a');

		setTimeout(() => {
			response.end('sdf');
		}, 2);
	});

	server.get('/aborted', (_request, response) => {
		response.write('a');

		setTimeout(() => {
			response.socket.destroy();
		}, 2);
	});
});

test('normal', async t => {
	const response = await pify(http.get, {errorFirst: false})(server.url);
	response.unicorn = '🦄';
	response.getContext = function () {
		return this;
	};

	const toStream = new stream.PassThrough({autoDestroy: false});
	mimicResponse(response, toStream);

	t.is(toStream.statusCode, 200);
	t.is(toStream.unicorn, '🦄');
	t.is(toStream.getContext(), response.getContext());

	response.resume();
	await pEvent(response, 'end');

	t.true(toStream.complete);
	t.not(response._readableState, toStream._readableState);
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

	const toStream = new stream.PassThrough({autoDestroy: false});
	mimicResponse(response, toStream);

	t.false(Object.keys(toStream).includes('on'));
	t.is(toStream.statusCode, 200);
	t.is(toStream.unicorn, '🦄');
	t.is(toStream.getContext(), response.getContext());
	t.false(toStream.complete);

	response.resume();
	await pEvent(response, 'end');

	await new Promise(resolve => setImmediate(resolve));

	t.true(toStream.complete);
});

test('`aborted` event', async t => {
	const response = await pify(http.get, {errorFirst: false})(`${server.url}/aborted`);

	const toStream = new stream.PassThrough({autoDestroy: false});
	mimicResponse(response, toStream);

	await pEvent(toStream, 'aborted');

	t.true(toStream.destroyed);
});

test('autoDestroy must be false', async t => {
	const response = await pify(http.get, {errorFirst: false})(`${server.url}/aborted`);

	const toStream = new stream.PassThrough({autoDestroy: true});

	t.throws(() => mimicResponse(response, toStream), {
		message: 'The second stream must have the `autoDestroy` option set to `false`'
	});
});

test('`close` event', async t => {
	{
		const response = await pify(http.get, {errorFirst: false})(server.url);

		const toStream = new stream.PassThrough({autoDestroy: false});
		mimicResponse(response, toStream);

		t.true(response.readable);

		if (nodejsMajorVersion > 11) {
			t.false(response.readableEnded);
		}

		response.pipe(toStream);
		toStream.resume();

		await pEvent(toStream, 'close');

		t.false(response.readable);
		t.false(toStream.readable);

		if (nodejsMajorVersion > 11) {
			t.true(response.readableEnded);
			t.true(toStream.readableEnded);
		}
	}

	{
		const response = await pify(http.get, {errorFirst: false})(`${server.url}/aborted`);

		const toStream = new stream.PassThrough({autoDestroy: false});
		mimicResponse(response, toStream);

		t.true(response.readable);

		if (nodejsMajorVersion > 11) {
			t.false(response.readableEnded);
		}

		response.pipe(toStream);
		toStream.resume();

		await pEvent(toStream, 'close');

		if (nodejsMajorVersion < 12) {
			t.false(response.readable);
			t.true(toStream.readable);
		} else if (nodejsMajorVersion < 13) {
			t.true(response.readableEnded);
			t.false(toStream.readableEnded);
		} else {
			t.false(response.readableEnded);
			t.false(toStream.readableEnded);
		}
	}
});
