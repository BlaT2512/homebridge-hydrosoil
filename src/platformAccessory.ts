import request = require('request');

import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { HydroSoilHomebridge } from './platform';

/**
 * HydroSoil Accessory -
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class HydroSoilAccessory {
  private humiditySensor: Service;
  private motionSensor: Service;

  constructor(
    private readonly platform: HydroSoilHomebridge,
    private readonly accessory: PlatformAccessory,
  ) {

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'HydroSoil')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device['macaddr']);

    if (accessory.context.devtype === 'hydrosensors') {
      this.accessory.getService(this.platform.Service.AccessoryInformation)!
        .setCharacteristic(this.platform.Characteristic.Model, 'HydroSensor');
    }

    // Add the Humidity and Motion sensors, and configure them
    this.humiditySensor = this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);
    this.motionSensor = this.accessory.getService('Watering Needed') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Watering Needed', accessory.context.device['macaddr'] + '-MOTION');
    this.humiditySensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);
    this.motionSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);

    // Add latest data
    this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, (accessory.context.device['value']/10.24).toFixed());
    if (accessory.context.device['value']/10.24 < accessory.context.device['waterlevel']) {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, true);
    } else {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, false);
    }

    // Add handlers for the sensors to update data every 5 minutes
    setInterval(() => {
      // Get the new data
      const reqParams = {
        uri: accessory.context.request,
        method: 'GET',
        headers: {
          'X-Api-Key': 'dcd55039-4764-410e-8b6f-e2f8ab5b58fd',
        },
      };

      request(reqParams, (error, response, body) => {
        if (!error && response.statusCode === 200 && JSON.parse(body)['code'] === 200) {
          body = JSON.parse(body);
          // Push the new data to HomeKit
          for (const device of body[accessory.context.devtype]) {
            if (device['macaddr'] === accessory.context.device['macaddr']) {
              this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, (device['value']/10.24).toFixed());
              if (device['value']/10.24 < device['waterlevel']) {
                this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, true);
              } else {
                this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, false);
              }
            }
          }
        }
      });

      this.platform.log.debug('Updating HydroSoil data:', accessory.context.device['nickname']);
    }, 300000);
  }
}
