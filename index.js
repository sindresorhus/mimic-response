'use strict';

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

/* eslint-disable no-var, prefer-arrow-callback */
module.exports = function (fromStream, toStream) {
	var fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	fromProps.forEach(function (prop) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			return;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	});
};
