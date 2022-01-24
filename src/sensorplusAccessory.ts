import request = require('request');

import { Service, PlatformAccessory } from 'homebridge';

import { HydroSoilHomebridge } from './platform';

/**
 * Sensor Accessory -
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SensorPlusAccessory {
  private moistureSensor: Service;
  private humiditySensor: Service;
  private tempSensor: Service;
  private motionSensor: Service;

  constructor(
    private readonly platform: HydroSoilHomebridge,
    private readonly accessory: PlatformAccessory,
  ) {

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'HydroSoil')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device['macaddr'])
      .setCharacteristic(this.platform.Characteristic.Model, 'HydroSensor Plus');

    // Register the device(s) and configure them
    this.moistureSensor = this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);
    this.humiditySensor = this.accessory.getService('Humidity Sensor') ||
      this.accessory.addService(this.platform.Service.HumiditySensor, 'Humidity Sensor', accessory.context.device['macaddr'] + '-HUMIDITY');
    this.tempSensor = this.accessory.getService('Temperature Sensor') ||
      this.accessory.addService(this.platform.Service.TemperatureSensor, 'Temperature Sensor', accessory.context.device['macaddr'] + '-TEMP');
    this.motionSensor = this.accessory.getService('Action Needed') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Action Needed', accessory.context.device['macaddr'] + '-MOTION');
    this.moistureSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);
    this.humiditySensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);
    this.tempSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);
    this.motionSensor.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device['nickname']);

    // Add latest data
    this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, (accessory.context.device['value']/10.24).toFixed());
    if (accessory.context.device['value']/10.24 < accessory.context.device['waterlevel']) {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, true);
    } else {
      this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, false);
    }
    if (accessory.context.device['chargelevel'] < 15) {
      this.humiditySensor.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
    } else {
      this.humiditySensor.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
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
          for (const device of body['hydrosensors']) {
            if (device['macaddr'] === accessory.context.device['macaddr']) {
              this.humiditySensor.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, (device['value']/10.24).toFixed());
              if (device['value']/10.24 < device['waterlevel']) {
                this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, true);
              } else {
                this.motionSensor.updateCharacteristic(this.platform.Characteristic.MotionDetected, false);
              }
              if (device['chargelevel'] < 15) {
                this.humiditySensor.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
              } else {
                this.humiditySensor.updateCharacteristic(this.platform.Characteristic.StatusLowBattery, this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
              }
            }
          }
        }
      });

      this.platform.log.debug('Updating HydroSoil data:', accessory.context.device['nickname']);
    }, 300000);
  }
}
