// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, batteryState, batteryStateButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';
var commandList = new Array()
const measuredPower = -58 //1 metro = -60 Dbm

var ESP = {
    service: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
    write: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'
}

var app = {
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        commandButton.addEventListener('touchstart', this.commandButtonAction, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        // scan for all devices
        ble.scan([], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {

        console.log(JSON.stringify(device));
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                'Distancia(Metros): ' + Math.round(Math.pow(10,(parseInt(measuredPower)-parseInt(device.rssi))/(10*2))*100)/100 + '&nbsp;|&nbsp;'
                device.id;

        listItem.dataset.deviceId = device.id;  // TODO
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);

    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId,
            onConnect = function() {

                // TODO check if we have the battery service
                // TODO check if the battery service can notify us
                //ble.startNotification(deviceId, battery.service, battery.level, app.onBatteryLevelChange, app.onError);
                commandButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                app.showDetailPage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },
    getDistance: function(device){
        return 
    },
    commandButtonAction: function(event) {
        var deviceId = event.target.dataset.deviceId
       /*  if (commandList.length === 0)
        {
            this.getCommands()
            this.commandButtonAction()
        }
        else
        {
            ble.write(deviceId, ESP, ESP, 'A')
        } */
        var array = new Uint8Array(1)
        array[0] = 65
        ble.write(deviceId, ESP.service, ESP.write, array.buffer, print('sent'), print('failed to send'))
    }, 
    disconnect: function(event) {
        var array = new Uint8Array(1)
        array[0] = 66
        var deviceId = event.target.dataset.deviceId;
        ble.write(deviceId,ESP.service,ESP.write,array.buffer, print('sent'), print('failed to send'))
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        notification.alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
