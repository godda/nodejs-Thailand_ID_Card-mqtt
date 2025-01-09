const { describe, it } = require('mocha');
const should = require('should');
const sinon = require('sinon');

const pcsc = require('../lib/pcsclite');


describe('Testing PCSCLite private', function () {

	describe('#start()', function () {
		it('#start() stub', function (done) {

			const p = pcsc();

			try {

				const stub = sinon.stub(p, 'start').callsFake(function (startCb) {
					startCb(undefined, Buffer.from("ACS ACR122U PICC Interface\u0000ACS ACR122U PICC Interface 01\u0000\u0000"));
				});

				let readerHit = 0;

				p.on('reader', function (reader) {

					reader.close();

					switch (++readerHit) {
						case 1:
							reader.name.should.equal("ACS ACR122U PICC Interface");
							break;
						case 2:
							reader.name.should.equal("ACS ACR122U PICC Interface 01");
							done();
							break;
					}

				});

			} finally {
				p.close();
			}

		});
	});

});

describe('Testing CardReader private', function () {

	const get_reader = function () {
		const p = pcsc();
		const stub = sinon.stub(p, 'start').callsFake(function (my_cb) {
			/* "MyReader\0" */
			my_cb(undefined, Buffer.from("MyReader\u0000\u0000"));
		});

		return p;
	};

	describe('#_connect()', function () {

		it('#_connect() success', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				const connect_stub = sinon.stub(reader, '_connect').callsFake(function (share_mode, protocol, connect_cb) {
					connect_cb(undefined, 1);
				});

				reader.connect(function (err, protocol) {
					should.not.exist(err);
					protocol.should.equal(1);
					done();
				});
			});
		});

		it('#_connect() error', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				const cb = sinon.spy();
				const connect_stub = sinon.stub(reader, '_connect').callsFake(function (share_mode, protocol, connect_cb) {
					connect_cb("");
				});

				reader.connect(cb);
				sinon.assert.calledOnce(cb);
				done();
			});
		});

		it('#_connect() already connected', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				const cb = sinon.spy();
				reader.connected = true;

				reader.connect(cb);
				process.nextTick(function () {
					sinon.assert.calledOnce(cb);
					done();
				});
			});
		});

	});

	describe('#_disconnect()', function () {

		it('#_disconnect() success', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				reader.connected = true;
				const cb = sinon.spy();
				const connect_stub = sinon.stub(reader, '_disconnect').callsFake(function (disposition, disconnect_cb) {
					disconnect_cb(undefined);
				});

				reader.disconnect(cb);
				sinon.assert.calledOnce(cb);
				done();
			});
		});

		it('#_disconnect() error', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				reader.connected = true;
				const cb = sinon.spy();
				const connect_stub = sinon.stub(reader, '_disconnect').callsFake(function (disposition,
																						   disconnect_cb) {
					disconnect_cb("");
				});

				reader.disconnect(cb);
				sinon.assert.calledOnce(cb);
				done();
			});
		});

		it('#_disconnect() already disconnected', function (done) {
			const p = get_reader();
			p.on('reader', function (reader) {
				const cb = sinon.spy();
				const connect_stub = sinon.stub(reader, '_disconnect').callsFake(function (disposition, disconnect_cb) {
					disconnect_cb(undefined);
				});

				reader.disconnect(cb);
				process.nextTick(function () {
					sinon.assert.calledOnce(cb);
					done();
				});
			});
		});
	});

});
