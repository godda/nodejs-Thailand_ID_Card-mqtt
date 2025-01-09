"use strict";

const pcsclite = require('../lib/pcsclite');


const pcsc = pcsclite();

pcsc.on('reader', (reader) => {

	console.log('New reader detected', reader.name);

	reader.on('error', err => {
		console.log('Error(', reader.name, '):', err.message);
	});

	reader.on('status', (status) => {

		console.log('Status(', reader.name, '):', status);

		// check what has changed
		const changes = reader.state ^ status.state;

		if (!changes) {
			return;
		}

		if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {

			console.log("card removed");

			reader.disconnect(reader.SCARD_LEAVE_CARD, err => {

				if (err) {
					console.log(err);
					return;
				}

				console.log('Disconnected');

			});

		}
		else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {

			console.log("card inserted");

			reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {

				if (err) {
					console.log(err);
					return;
				}

				console.log('Protocol(', reader.name, '):', protocol);

				reader.transmit(Buffer.from([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, (err, data) => {

					if (err) {
						console.log(err);
						return;
					}

					console.log('Data received', data);
					reader.close();
					pcsc.close();

				});

			});

		}

	});

	reader.on('end', () => {
		console.log('Reader', reader.name, 'removed');
	});

});

pcsc.on('error', err => {
	console.log('PCSC error', err.message);
});
