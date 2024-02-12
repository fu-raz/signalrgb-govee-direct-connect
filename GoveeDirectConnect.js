import goveeProducts from "./govee-products.js";

import GoveeDevice from "./GoveeDevice.js";
import GoveeController from "./GoveeController.js";
import GoveeDeviceUI from "./GoveeDeviceUI.js";

export function Name() { return "Govee Direct Connect"; }
export function Version() { return "1.2.0"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() {return [0, 70]; }
export function DefaultScale(){return 1.0;}
export function ControllableParameters()
{
	return [
		{"property":"lightingMode", "group":"settings", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"settings", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOff", "group":"settings", "label":"On shutdown", "type":"combobox", "values":["Do nothing", "Single color", "Turn device off"], "default":"Turn device off"},
        {"property":"shutDownColor", "group":"settings", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#8000FF"}
	];
}

export function SubdeviceController() { return false; }

let goveeUI;
let lastRender = 0;

export function Initialize()
{
    device.log('Creating Govee Device UI');
	goveeUI = new GoveeDeviceUI(device, controller);
}

export function Render()
{
    let now = Date.now();
    if (now - lastRender > 10000)
    {
        // Check update status
        if (controller.changed)
        {
            goveeUI.updateStatus(controller.statusData);
            controller.changed = false;
        }
        lastRender = now;
    }
    goveeUI.render(lightingMode, forcedColor, now);
}

export function Shutdown()
{
    device.log('Shutting down');
	goveeUI.shutDown(turnOff, shutDownColor);
}

export function Validate()
{
    return true;
}

export function DiscoveryService()
{
    this.IconUrl = getGoveeLogo();
    this.lastPollTime = -5000;
    this.PollInterval = 5000;

    this.UdpBroadcastPort = 4003;
    this.UdpListenPort = 4002;

    this.discoveredDeviceData = {};
    this.GoveeDeviceControllers = {};

    this.Initialize = function() {
        this.convertSettings();
        
        this.lastPollTime = Date.now();
        this.devicesLoaded = false;
	}

    this.convertSettings = function()
    {
        let oldSettingsData = service.getSetting('GoveeDirectConnect', 'devices');
        if(oldSettingsData !== undefined)
        {
            service.log('Found old settings');
            let oldSettings = JSON.parse(oldSettingsData);
            for(let ip of Object.keys(oldSettings))
            {
                // We found the ip, let's find the device id
                let deviceData = oldSettings[ip];
                deviceData.id = deviceData.device;

                //Create a new Govee device so we can save the data
                let goveeDevice = new GoveeDevice(deviceData);
                goveeDevice.save();
            }

            this.saveCache();

            this.removeSetting('GoveeDirectConnect', 'devices');
        }
    }

    this.forceDiscover = function(ip, leds, type)
    {
        let goveeLightData = { 
            ip: ip,
            leds: parseInt(leds),
            type: parseInt(type),
            split: 1
        };

        this.GoveeDeviceControllers[ip] = this.createController(goveeLightData);

        this.saveCache();
        this.Update(true);
    }

    this.loadForcedDevices = function()
    {
        // Load the cached ips
        let ipCacheJSON = service.getSetting('ipCache', 'cache');
        let ipCache = {};
        if (ipCacheJSON) ipCache = JSON.parse(ipCacheJSON);

        // Get all cached ips
        let cachedIps = Object.keys(ipCache);
        
        for(let cachedIp of cachedIps)
        {
            // If Controller is not yet created
            if (!this.GoveeDeviceControllers.hasOwnProperty(cachedIp))
            {
                // Create the controller and add it
                this.GoveeDeviceControllers[cachedIp] = this.createController(ipCache[cachedIp]);
            }

            let goveeController = this.GoveeDeviceControllers[cachedIp];
            
            if (!service.hasController(cachedIp))
            {
                service.addController(goveeController);
                // Announce the controller as a device
                service.announceController(goveeController);
            } else
            {
                service.updateController(goveeController);
            }
        }

        this.devicesLoaded = true;
    }

    this.Update = function(force)
    {
        let diff = Date.now() - discovery.lastPollTime;

        if(diff > discovery.PollInterval || force === true)
        {
			discovery.lastPollTime = Date.now();

            if (!this.devicesLoaded || force === true)
            {
                this.loadForcedDevices();
            }
		}
    }

    this.Discovered = function(value)
    {
        if (!value) return;
        
        let goveeResponse = JSON.parse(value.response);
        let goveeData = goveeResponse.msg.data;

        if (this.GoveeDeviceControllers.hasOwnProperty(value.ip))
        {
            let goveeController = this.GoveeDeviceControllers[value.ip];
            
            if (goveeResponse.msg.cmd == 'scan')
            {
                goveeController.updateDeviceData(goveeData);
            } else if (goveeResponse.msg.cmd == 'status' || goveeResponse.msg.cmd == 'devStatus')
            {   
                service.log('Received status data for ' + value.ip);
                if (JSON.stringify(goveeController.statusData) !== JSON.stringify(goveeData))
                {
                    goveeController.changed = true;
                    goveeController.statusData = goveeData;
                    service.updateController(goveeController);
                }
            }
        }
	};

    this.Delete = function(ip)
    {
        this.removeController(ip);
        this.saveCache();
        this.Update(true);
    }

    this.saveCache = function()
    {
        let ipCache = {};
        for(let ip of Object.keys(this.GoveeDeviceControllers))
        {
            let goveeController = this.GoveeDeviceControllers[ip];
            ipCache[goveeController.id] = goveeController.toCacheJSON();
        }
        if (Object.keys(ipCache).length > 0)
        {
            service.saveSetting('ipCache', 'cache', JSON.stringify(ipCache));
        }
    }

    this.removeController = function(ip)
    {
        let goveeController = this.GoveeDeviceControllers[ip];
        service.removeController(goveeController);
        delete this.GoveeDeviceControllers[ip];
    }

    this.createController = function(cacheData)
    {
        service.log('Creating controller: ' + cacheData.ip);
        
        let goveeDevice;

        if (cacheData.id)
        {
            goveeDevice = (new GoveeDevice).load(cacheData.id);
        } else
        {
            goveeDevice = new GoveeDevice(cacheData);
            // In the future: Request the device data
            // goveeDevice.requestDeviceData();
        }

        // Create and store controller for network tab
        let goveeController = new GoveeController(goveeDevice, this);

        return goveeController;
    }

    this.updatedController = function(goveeController)
    {
        console.log(`Controller ${goveeController.id} data updated`);
        this.saveCache();
        service.removeController(goveeController);
        service.addController(goveeController);
        service.announceController(goveeController);
    }

    
}

function getGoveeLogo()
{
    return 'data:image/png;base64,' + goveeProducts['default'].base64Image;
}


