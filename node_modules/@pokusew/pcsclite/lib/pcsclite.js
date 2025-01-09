"use strict";

const EventEmitter = require('events');
const pcsclite = require('bindings')('pcsclite');
const { PCSCLite, CardReader } = pcsclite;


inherits(PCSCLite, EventEmitter);
inherits(CardReader, EventEmitter);

function parseReadersString(buffer) {

	try {

		const string = buffer.toString().slice(0, -1);

		// it looks like
		// ACS ACR122U PICC Interface\u0000ACS ACR122U PICC Interface 01\u0000\u0000
		// [reader_name]\u0000[reader_name]\u0000\u0000
		//              ^separator         ^separator^end_separator

		// returns readers in array
		// like [ 'ACS ACR122U PICC Interface', 'ACS ACR122U PICC Interface 01' ]

		return string.split('\u0000').slice(0, -1);

	} catch (e) {
		return [];
	}

}

/*
 * It returns an array with the elements contained in a that aren't contained in b
 */
function diff(a, b) {

	return a.filter(i => b.indexOf(i) === -1);

}

module.exports = function () {

	const readers = {};

	const p = new PCSCLite();

	p.readers = readers;

	process.nextTick(function () {

		p.start(function (err, data) {

			if (err) {
				return p.emit('error', err);
			}

			const names = parseReadersString(data);

			const currentNames = Object.keys(readers);
			const newNames = diff(names, currentNames);
			const removedNames = diff(currentNames, names);

			newNames.forEach(function (name) {

				const r = new CardReader(name);

				r.on('_end', function () {
					r.removeAllListeners('status');
					delete readers[name];
					r.emit('end');
				});

				readers[name] = r;

				r.get_status(function (err, state, atr) {

					if (err) {
						return r.emit('error', err);
					}

					const status = { state: state };

					if (atr) {
						status.atr = atr;
					}

					r.emit('status', status);

					r.state = state;

				});

				p.emit('reader', r);

			});

			removedNames.forEach(function (name) {
				readers[name].close();
			});

		});

	});

	return p;
};

CardReader.prototype.connect = function (options, cb) {

	if (typeof options === 'function') {
		cb = options;
		options = undefined;
	}

	options = options || {};
	options.share_mode = options.share_mode || this.SCARD_SHARE_EXCLUSIVE;

	if (typeof options.protocol === 'undefined' || options.protocol === null) {
		options.protocol = this.SCARD_PROTOCOL_T0 | this.SCARD_PROTOCOL_T1;
	}

	if (!this.connected) {
		this._connect(options.share_mode, options.protocol, cb);
	} else {
		cb();
	}

};

CardReader.prototype.disconnect = function (disposition, cb) {

	if (typeof disposition === 'function') {
		cb = disposition;
		disposition = undefined;
	}

	if (typeof disposition !== 'number') {
		disposition = this.SCARD_UNPOWER_CARD;
	}

	if (this.connected) {
		this._disconnect(disposition, cb);
	} else {
		cb();
	}

};

CardReader.prototype.transmit = function (data, res_len, protocol, cb) {

	if (!this.connected) {
		return cb(new Error('Card Reader not connected'));
	}

	this._transmit(data, res_len, protocol, cb);

};

CardReader.prototype.control = function (data, control_code, res_len, cb) {

	if (!this.connected) {
		return cb(new Error('Card Reader not connected'));
	}

	const output = new Buffer(res_len);

	this._control(data, control_code, output, function (err, len) {
		if (err) {
			return cb(err);
		}

		cb(err, output.slice(0, len));
	});

};

CardReader.prototype.SCARD_CTL_CODE = function (code) {

	const isWin = /^win/.test(process.platform);

	if (isWin) {
		return (0x31 << 16 | (code) << 2);
	} else {
		return 0x42000000 + (code);
	}

};

// extend prototype
function inherits(target, source) {

	for (const k in source.prototype) {
		target.prototype[k] = source.prototype[k];
	}

}
