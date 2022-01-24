import request = require('request');

import { Service, PlatformAccessory } from 'homebridge';

import { HydroSoilHomebridge } from './platform';

/**
 * Sensor Accessory -
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SprinklerAccessory {
  private service: [Service];

  constructor(
    private readonly platform: HydroSoilHomebridge,
    private readonly accessory: PlatformAccessory,
  ) {

    // Set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'HydroSoil')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device['macaddr'])
      .setCharacteristic(this.platform.Characteristic.Model, 'Valve Control Board');

    // Create an accessory for each valve in the chain
    this.service = [this.accessory.getService(this.platform.Service.IrrigationSystem) ||
      this.accessory.addService(this.platform.Service.IrrigationSystem)];
    this.service[0].setCharacteristic(this.platform.Characteristic.Name, 'Valve 1');
    // Add latest data
    this.service[0].updateCharacteristic(this.platform.Characteristic.Active, accessory.context.device['valvedata'][0]['a']);
    this.service[0].updateCharacteristic(this.platform.Characteristic.InUse, accessory.context.device['valvedata'][0]['a']);
    if (accessory.context.device['valvedata'][0]['r'] === 'auto') {
      this.service[0].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED);
    } else if (accessory.context.device['valvedata'][0]['r'] === 'routine') {
      this.service[0].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED);
    } else {
      this.service[0].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED_MANUAL_MODE_);
    }

    if (accessory.context.device['valvedata'].length > 1) {
      for (const valve of accessory.context.device['valvedata']) {
        if (valve['v'] > 1) {
          this.service.push(this.accessory.getService(this.platform.Service.IrrigationSystem) ||
            this.accessory.addService(this.platform.Service.IrrigationSystem));
          this.service[valve['v']-1].setCharacteristic(this.platform.Characteristic.Name, 'Valve ' + valve['v']);
          // Add latest data
          this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.Active, valve['a']);
          this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.InUse, valve['a']);
          if (valve['r'] === 'auto') {
            this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED);
          } else if (valve['r'] === 'routine') {
            this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED);
          } else {
            this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED_MANUAL_MODE_);
          }
        }
      }
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
          for (const valve of body['controlunits'][0]['valvedata']) {
            this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.Active, valve['a']);
            this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.InUse, valve['a']);
            if (valve['r'] === 'auto') {
              this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED);
            } else if (valve['r'] === 'routine') {
              this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED);
            } else {
              this.service[valve['v']-1].updateCharacteristic(this.platform.Characteristic.ProgramMode, this.platform.Characteristic.ProgramMode.PROGRAM_SCHEDULED_MANUAL_MODE_);
            }
          }
        }
      });

      this.platform.log.debug('Updating HydroSoil data: Irrigation Valves');
    }, 300000);
  }
}
