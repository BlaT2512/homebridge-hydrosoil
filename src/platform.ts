import request = require('request');

import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { HydroSoilAccessory } from './platformAccessory';

/**
 * HydroSoil Platform -
 * Registers devices on a user's account and set's up accessories in HomeKit
*/
export class HydroSoilHomebridge implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // Check if HydroSoil account is linked and add devices
      this.discoverDevices();
    });
  }

  /**
   * configureAccessory -
   * Restores cached accessories
  */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.debug('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  /**
   * discoverDevices -
   * Searches HydroSoil account for devices and registers them all as accessories for controlling
  */
  discoverDevices() {
    let excllist = '';
    if (this.config.username !== '' && this.config.password !== '' && this.config.exposed_devs !== []) {

      // Create the request parameters
      if (!this.config.exposed_devs.includes('HydroSensors (Regular)')) {
        excllist += 's';
      }
      if (!this.config.exposed_devs.includes('HydroSensors +')) {
        excllist += 'p';
      }
      if (!this.config.exposed_devs.includes('Valve Boards')) {
        excllist += 'v';
      }
      const reqParams = {
        uri: 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist,
        method: 'GET',
        headers: {
          'X-Api-Key': 'dcd55039-4764-410e-8b6f-e2f8ab5b58fd',
        },
      };

      // Execute the request
      request(reqParams, (error, response, body) => {
        if (!error && response.statusCode === 200 && JSON.parse(body)['code'] === 200) {
          const hydroDevices = JSON.parse(body);

          // Loop over the discovered devices and register each one if it has not already been registered
          // HydroSensors
          if (this.config.exposed_devs.includes('HydroSensors (Regular)')) {
            for (const device of hydroDevices['hydrosensors']) {
              // Check if the device already exists
              const uuid = this.api.hap.uuid.generate(device['macaddr']);
              const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
              if (existingAccessory) {
                // The accessory already exists, restore and update it's device context
                existingAccessory.context.device = device;
                existingAccessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                this.api.updatePlatformAccessories([existingAccessory]);
                new HydroSoilAccessory(this, existingAccessory);
              } else {
                // Create a new accessory, register it and store device context
                const accessory = new this.api.platformAccessory(device['nickname'], uuid);
                accessory.context.device = device;
                accessory.context.dispName = 'HydroSensor';
                accessory.context.devtype = 'hydrosensors';
                accessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                new HydroSoilAccessory(this, accessory);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
              }
            }
          }

          // HydroSensors +
          if (this.config.exposed_devs.includes('HydroSensors +')) {
            for (const device of hydroDevices['hydrosensorsplus']) {
              // Check if the device already exists
              const uuid = this.api.hap.uuid.generate(device['macaddr']);
              const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
              if (existingAccessory) {
                // The accessory already exists, restore and update it's device context
                existingAccessory.context.device = device;
                existingAccessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                this.api.updatePlatformAccessories([existingAccessory]);
                new HydroSoilAccessory(this, existingAccessory);
              } else {
                // Create a new accessory, register it and store device context
                const accessory = new this.api.platformAccessory(device['nickname'], uuid);
                accessory.context.device = device;
                accessory.context.dispName = 'HydroSensor +';
                accessory.context.devtype = 'hydrosensorsplus';
                accessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                new HydroSoilAccessory(this, accessory);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
              }
            }
          }

          // Valve Boards
          if (this.config.exposed_devs.includes('Valve Boards')) {
            for (const device of hydroDevices['controlunits']) {
              // Check if the device already exists
              const uuid = this.api.hap.uuid.generate(device['macaddr']);
              const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
              if (existingAccessory) {
                // The accessory already exists, restore and update it's device context
                existingAccessory.context.device = device;
                existingAccessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                this.api.updatePlatformAccessories([existingAccessory]);
                new HydroSoilAccessory(this, existingAccessory);
              } else {
                // Create a new accessory, register it and store device context
                const accessory = new this.api.platformAccessory(device['nickname'], uuid);
                accessory.context.device = device;
                accessory.context.dispName = 'Valve Control Unit';
                accessory.context.devtype = 'controlunits';
                accessory.context.request = 'https://hydrosoil.tk/api/getaccdatax.php?username=' + this.config.username + '&password=' + this.config.password + '&exclude=' + excllist;
                new HydroSoilAccessory(this, accessory);
                this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
              }
            }
          }

        } else if (response.statusCode === 401) {
          this.log.error('Error: Username or password supplied is incorrect. Please click the settings button below the homebridge-hydrosoil module to change.');
          this.log.warn('Warning: HydroSoil plugin inactive. Please address specified issue and reboot Homebridge to re-attempt setup.');
        } else {
          this.log.error('Error: Server unexpectedly failed to process request. Please try again later or submit a bug report on GitHub.');
          this.log.warn('Warning: HydroSoil plugin inactive. Please address specified issue and reboot Homebridge to re-attempt setup.');
        }
      });

    } else {
      this.log.error('Error: Username, password and/or devices not provided. Please click the settings button below the homebridge-hydrosoil module to configure.');
      this.log.warn('Warning: HydroSoil plugin inactive. Please address specified issue and reboot Homebridge to re-attempt setup.');
    }
  }
}
