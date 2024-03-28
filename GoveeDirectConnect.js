import udp from "@SignalRGB/udp";
import goveeProducts from "./govee-products.test.js";
import GoveeDevice from "./GoveeDevice.test.js";
import GoveeController from "./GoveeController.test.js";
import GoveeDeviceUI from "./GoveeDeviceUI.test.js";

export function Name() { return "Govee Direct Connect"; }
export function Version() { return "2.0.0"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
export function Size() { return [1, 1]; }
export function DefaultPosition() {return [0, 70]; }
export function DefaultScale(){return 1.0;}
export function DefaultComponentBrand() { return "Govee";}
export function ControllableParameters()
{
	return [
		{"property":"lightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOff", "group":"lighting", "label":"On shutdown", "type":"combobox", "values":["Do nothing", "Single color", "Turn device off"], "default":"Turn device off"},
        {"property":"shutDownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#8000FF"},
        {"property":"frameDelay", "group":"settings", "label":"Delay between frames", "type":"combobox", "values":["0", "10", "50", "100"], "default":"0"}
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
    goveeUI.render(lightingMode, forcedColor, now, frameDelay);
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

    this.lastPort = null;
    
    // Disabled so we don't use the built in broadcasting
    // this.UdpBroadcastPort = 4003;
    // this.UdpListenPort = 4002;

    this.discoveredDeviceData = {};
    this.GoveeDeviceControllers = {};

    this.Initialize = function() {
        this.lastPort = service.getSetting('ipCache', 'lastUniquePort');
        if (!this.lastPort) this.getUniquePort();

        this.convertSettings();
        
        this.lastPollTime = Date.now();
        this.devicesLoaded = false;

        this.startSocketServer();
	}

    this.startSocketServer = function()
    {
        // Start the udp server
        this.udpServer = udp.createSocket();
        this.udpServer.on('message', this.handleSocketMessage.bind(this));
        this.udpServer.on('error', this.handleSocketError.bind(this));
        this.udpServer.bind(4002);
    }

    this.convertSettings = function()
    {
        let oldSettingsData = service.getSetting('GoveeDirectConnect', 'devices');
        let newSettingsData = service.getSetting('ipCache', 'cache');

        if(oldSettingsData !== undefined && !newSettingsData)
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

            // service.removeSetting('GoveeDirectConnect', 'devices');
        }
    }

    this.forceDiscover = function(ip, leds, type)
    {
        let goveeLightData = { 
            ip: ip,
            leds: parseInt(leds),
            type: parseInt(type),
            split: 1,
            uniquePort: this.getUniquePort()
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

    this.handleSocketError = function(err, message)
    {
        service.error(message);
    }

    this.handleSocketMessage = function(value)
    {
        if (!value) return;
        const ip = this.getIPv4(value.address);

        if (this.GoveeDeviceControllers.hasOwnProperty(ip))
        {
            let goveeController = this.GoveeDeviceControllers[ip];
            goveeController.relaySocketMessage(value);
        } else
        {
            service.log(`Cannot find controller for ${ip}`);
        }
	};

    this.getIPv4 = function(address)
    {
        const ipv4Pattern = /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)\.(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)/;
        const match = address.match(ipv4Pattern);
        return match ? match[0] : null;
    }

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

    this.getUniquePort = function()
    {
        if (!this.lastPort || this.lastPort < 46920)
        {
            this.lastPort = 46920;
        } else
        {
            this.lastPort++;
        }
        
        // Save the new port:
        service.saveSetting('ipCache', 'lastUniquePort', this.lastPort);
        return this.lastPort;
    }

    this.createController = function(cacheData)
    {
        service.log('Creating controller: ' + cacheData.ip);
        
        let goveeDevice;

        if (cacheData.id)
        {
            goveeDevice = (new GoveeDevice).load(cacheData.id);

            // Add this for devices with the old settings
            if (!goveeDevice.uniquePort)
            {
                goveeDevice.uniquePort = this.getUniquePort();
                goveeDevice.save();
            }
        } else
        {
            goveeDevice = new GoveeDevice(cacheData);
        }

        // Create and store controller for network tab
        let goveeController = new GoveeController(goveeDevice, this);

        // Start the udp socket?
        goveeController.setupUDPSocket();
        return goveeController;
    }

    this.updatedController = function(goveeController)
    {
        service.log(`Controller ${goveeController.id} data updated`);
        this.saveCache();
        service.removeController(goveeController);
        service.addController(goveeController);
        service.log('Re-announcing the controller');
        service.announceController(goveeController);

        service.log('Restart our socket server');
        this.startSocketServer();

    }
}

function getGoveeLogo()
{
    return 'data:image/png;base64,' + goveeProducts['default'].base64Image;
}


