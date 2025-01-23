require("dotenv").config();
const mqtt = require("mqtt");
const path = require("path");
const url = require("url");
const smartcard = require("smartcard");
const Devices = smartcard.Devices;
const devices = new Devices();
const CommandApdu = smartcard.CommandApdu;
const legacy = require("legacy-encoding");
const fs = require("fs");

let cmdIndex = 0;
let imgTemp = "";
let CID = "";

// MQTT setup
const client = mqtt.connect({
  host: process.env.MQTT_SERVER_URL,
  port: process.env.MQTT_PORT,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

// Publish function
const publishData = (topic, data) => {
  const payload = JSON.stringify(data);
  client.publish(topic, payload, { qos: 1 }, (error) => {
    if (error) {
      console.error("MQTT Publish Error:", error);
    } else {
      console.log("Data published to topic:", topic);
    }
  });
};

// Execute Command
const executeCommand = async (card, commandBytes) => {
  try {
    const response = await card.issueCommand(
      new CommandApdu({ bytes: commandBytes })
    );
    return response;
  } catch (error) {
    console.error("Command execution error:", error);
    throw error;
  }
};

// Reading functions
const readCid = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x0d]);
    CID = response.slice(0, -2).toString();
    console.log(`CID [${CID.length}]: ${CID}`);
    if (CID.length != 13) {
      process.exit();
    } else {
      return CID;
    }
  } catch (error) {
    console.error("Error reading CID:", error);
    process.exit();
  }
};

const readFullnameTH = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x64]);
    const data = legacy.decode(response.slice(0, -2), "tis620");
    console.log(`Fullname TH[${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading fullname:", error);
    process.exit();
  }
};
const readFullnameEN = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x64]);
    const data = legacy.decode(response.slice(0, -2), "tis620");
    console.log(`Fullname EN[${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading fullname:", error);
    process.exit();
  }
};
const readDateofBirth = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0xd9, 0x02, 0x00, 0x08]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x08]);
    const data = response.slice(0, -2).toString();
    console.log(`Date of Birth[${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Date of Birth:", error);
    process.exit();
  }
};

const readGender = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0xe1, 0x02, 0x00, 0x01]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x01]);
    const data = response.slice(0, -2).toString();
    console.log(`Gender [${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Gender:", error);
    process.exit();
  }
};
const readCardIssuer = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x00, 0xf6, 0x02, 0x00, 0x64]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x64]);
    const data = legacy.decode(response.slice(0, -2), "tis620");
    console.log(`Card Issuer [${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Card Issuer:", error);
    process.exit();
  }
};
const readIssueDate = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x08]);
    const data = response.slice(0, -2).toString();
    console.log(`Issue Date [${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Issue Date:", error);
    process.exit();
  }
};
const readExpireDate = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x01, 0x6f, 0x02, 0x00, 0x08]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x08]);
    const data = response.slice(0, -2).toString();
    console.log(`Expire Date [${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Expire Date:", error);
    process.exit();
  }
};

const readAddress = async (card) => {
  try {
    await executeCommand(card, [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64]);
    const response = await executeCommand(card, [0x00, 0xc0, 0x00, 0x00, 0x64]);
    const data = legacy.decode(response.slice(0, -2), "tis620");
    console.log(`Address[${data.length}]: ${data}`);
    return data;
  } catch (error) {
    console.error("Error reading Address:", error);
    process.exit();
  }
};

const readImageOneLine = async (card) => {
  try {
    while (cmdIndex <= 20) {
      let xof = cmdIndex * 255 + 379;
      let xwd = cmdIndex === 20 ? 38 : 255;
      let sp2 = (xof >> 8) & 0xff;
      let sp3 = xof & 0xff;
      let sp6 = xwd & 0xff;

      await executeCommand(card, [0x80, 0xb0, sp2, sp3, 0x02, 0x00, sp6]);
      const response = await executeCommand(card, [
        0x00,
        0xc0,
        0x00,
        0x00,
        sp6,
      ]);

      imgTemp += response.toString("base64").replace("kAA=", "");
      cmdIndex++;
    }
    return imgTemp;
  } catch (error) {
    console.error("Error reading image:", error);
    process.exit();
  }
};

// Device handling
devices.on("device-activated", (event) => {
  const device = event.device;
  console.log(`Device '${device}' activated.`);

  device.on("card-inserted", async (event) => {
    const card = event.card;
    console.log(`Card inserted: ${card.getAtr()}`);

    try {
      await executeCommand(
        card,
        [
          0x00, 0xa4, 0x04, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x00, 0x54, 0x48,
          0x00, 0x01,
        ]
      );

      const cid = await readCid(card);
      const fullnameTH = await readFullnameTH(card);
      const fullnameEN = await readFullnameEN(card);
      const birthdate = await readDateofBirth(card);
      const gender = await readGender(card);
      const image = await readImageOneLine(card);

      // Create JSON data
      const data = {
        cid,
        fullnameTH,
        fullnameEN,
        birthdate,
        gender,
        image,
      };

      // Publish data to MQTT
      publishData(process.env.MQTT_TOPIC, data);
    } catch (error) {
      console.error("Error processing card:", error);
      process.exit();
    }
  });

  device.on("card-removed", () => {
    console.log(`Card removed from '${device.name}'`);
  });
});

devices.on("device-deactivated", (event) => {
  console.log(`Device '${event.device}' deactivated.`);
});
