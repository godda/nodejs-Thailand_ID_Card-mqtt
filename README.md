# Smart Card Data Reader with MQTT Integration

This project provides a Node.js-based implementation for reading data from Thailand ID Card (smart cards) and sending the data via MQTT in JSON format. The image data from the smart card is encoded as a BASE64 string. The configuration for the MQTT connection (e.g., server URL, port, username, password, and topic) is managed through a `.env` file.

## Features
- Reads smart card data (e.g., CID, full name, date of birth, address, and image).
- Sends the data in JSON format to an MQTT broker.
- Encodes image data as a BASE64 string.
- Supports configuration via a `.env` file.

## Prerequisites
- Node.js installed on your system.
- Smart card reader hardware.
- Access to an MQTT broker.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/godda/nodejs-Thailand_ID_Card-mqtt.git
   cd nodejs-Thailand_ID_Card-mqtt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and configure the following variables:
   ```env
   MQTT_SERVER_URL=broker.emqx.io
   MQTT_PORT=1883
   MQTT_USERNAME=your_username
   MQTT_PASSWORD=your_password
   MQTT_TOPIC=smartcard/data
   ```

## Usage

1. Connect your smart card reader to the system and insert a smart card.

2. Start the application:
   ```bash
   node index.js
   ```

3. Data from the smart card will be published to the configured MQTT topic.

## Data Format
The data is sent in the following JSON format:
```json
{
  "cid": "<Card ID>",
  "fullnameTH": "<Full Name in Thai>",
  "fullnameEN": "<Full Name in English>",
  "birthdate": "<Date of Birth>",
  "gender":"<gender>"
  "image": "<BASE64-encoded image string>"
}
```

## References
This project utilizes information and resources from the following repositories:
- [ThaiNationalIDCard/APDU.md](https://github.com/chakphanu/ThaiNationalIDCard/blob/master/APDU.md)
- [node-th-cid-reader](https://github.com/24engiball/node-th-cid-reader)

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

