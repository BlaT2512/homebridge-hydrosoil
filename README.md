
<p align="center">
<img src="extras/homebridge-hydrosoil-wordmark.png" width="500">
</p>

# homebridge-hydrosoil

Homebridge HydroSoil allows you to control your HydroSoil sensors and HydroSoil Control Unit through Apple HomeKit and the iPhone/iPad Home app, or your favourite HomeKit third-party client. Easily check up on the status of your irrigation valves and get alerted when HydroSoil sensors detect your plants need to be watered through Apple Home, and integrate your HydroSoil devices with the rest of your smart home.

# Installation - Part 1

You will need Homebridge installed to be able to run this plugin. Homebridge is a service allowing you to connect devices to Apple HomeKit. It can be installed on to run in the background on a desktop Mac, desktop Windows machine or IOT device such as a Raspberry Pi. The device you run it on must always be on and located in your house (i.e. a desktop computer not a laptop). It only takes a few clicks to install. Follow the simple installation instructions [on the Homebridge GitHub Wiki here](https://github.com/homebridge/homebridge/wiki).

# Installation - Part 2

To install the Homebridge HydroSoil plugin, go to the command line app of the device you installed Homebridge on (Terminal on Mac and Linux/Raspberry Pi, Command Prompt on Windows) and paste this command before pressing enter:
```
npm i -g https://github.com/BlaT2512/homebridge-hydrosoil
```
You can then go to your Homebridge Web Interface > Plugins > homebridge-hydrosoil > Settings and enter your username and password, as well as select the devices you want exposed to Apple HomeKit. On the home page of the Homebridge Web Interface, you can also scan the QR code using Apple Home app on iPhone/iPad if you haven't already to register Homebridge.

## Installation - Part 3

Once you have installed Homebridge and this plugin, and registered Homebridge in Apple Home with the QR code, simply restart Homebridge in the Web Interface and see your HydroSoil devices in Apple Home!

