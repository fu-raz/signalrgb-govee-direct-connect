import base64 from "@SignalRGB/base64";

export function Name() { return "Govee Direct Connect"; }
export function Version() { return "0.0.2"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
export function Size() { return [22, 1]; }
export function DefaultPosition() {return [0, 70]; }
export function DefaultScale(){return 1.0;}
export function ControllableParameters()
{
	return [
		{"property":"lightingMode", "group":"settings", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"settings", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOff", "group":"settings", "label":"On shutdown", "type":"combobox", "values":["Do nothing", "Single color", "Turn device off"], "default":"Turn device off"},
        {"property":"turnOffColor", "group":"settings", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#8000FF"}
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
        if (controller.changed)
        {
            device.log('Data changed, updating...');
            goveeUI.updateGoveeDevice(controller.device);
            controller.changed = false;
        }
        lastRender = now;
    }
    goveeUI.render(lightingMode, forcedColor, now);
}

export function Shutdown(suspend)
{
	goveeUI.shutDown(turnOff, turnOffColor);
}

export function DiscoveryService()
{
    this.lastPollTime = -5000;
    this.PollInterval = 5000;

    this.UdpBroadcastPort = 4003;
    // this.UdpBroadcastAddress = '239.255.255.250';
    this.UdpListenPort = 4002;

    this.testCommands = [];

    this.discoveredDeviceData = {};

    this.GoveeDeviceControllers = {
        // 192.168.100.38: { Govee Class object }
    };

    this.Initialize = function() {
		service.log("Initializing Govee Forced Plugin!");
        this.lastPollTime = Date.now();

        this.devicesLoaded = false;
	};

    this.testDiscover = function(ip, leds, type)
    {
        // This should change the IP:
        // this.UdpBroadcastAddress = ip;

        let goveeInstance = new GoveeDevice({ip: ip, leds: leds ? leds : 1, type: type ? type : 3});
        this.testCommands = goveeInstance.getTests();
    }

    this.forceDiscover = function(ip, leds, type)
    {
        let goveeLightData = { ip: ip, leds: parseInt(leds), type: parseInt(type) };

        this.discoveredDeviceData[ip] = goveeLightData
        
        service.saveSetting('GoveeDirectConnect', 'devices', JSON.stringify( this.discoveredDeviceData ));
        this.devicesLoaded = false;

        this.Update(true);
    }

    this.loadForcedDevices = function()
    {
        service.log('Trying to load forced devices');
        let savedDeviceData = service.getSetting('GoveeDirectConnect', 'devices');
        if(savedDeviceData !== undefined)
        {
            this.discoveredDeviceData = JSON.parse(savedDeviceData);
        }

        let oldData = service.getSetting('goveeForced', 'devices');
        if (oldData !== undefined)
        {
            service.log('Found old data');
            let conversionData = JSON.parse(oldData);
            for (let oldDevice of conversionData)
            {
                if (!this.discoveredDeviceData.hasOwnProperty(oldDevice.ip))
                {
                    this.discoveredDeviceData[oldDevice.ip] = oldDevice;
                }
            }
            service.removeSetting('goveeForced', 'devices');
        }
        
		if(Object.keys(this.discoveredDeviceData).length > 0)
        {
            // Check if devices are still in new device list
            for (let ip of Object.keys(this.GoveeDeviceControllers))
            {
                if (!Object.keys(this.discoveredDeviceData).includes(ip))
                {
                    let goveeController = service.getController(ip);
                    // Disconnect the Govee device
                    service.removeController(goveeController);
                    this.GoveeDeviceControllers[ip].delete();
                    delete this.GoveeDeviceControllers[ip];
                }
            }

            for(let savedIP of Object.keys(this.discoveredDeviceData))
            {
                if (!Object.keys(this.GoveeDeviceControllers).includes(savedIP))
                {
                    service.log('Adding new Govee controller for ' + savedIP);

                    let goveeController = new GoveeController(this.discoveredDeviceData[savedIP]);
                    this.GoveeDeviceControllers[savedIP] = goveeController;
                    service.addController(goveeController);
                }
            }
            
            this.devicesLoaded = true;
		}
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

            for(const controller of service.controllers)
            {
                controller.obj.update();
            }
		}
    }

    this.Discovered = function(value)
    {
        let goveeResponse = JSON.parse(value.response);
        if (goveeResponse.msg.cmd == 'scan' || goveeResponse.msg.cmd == 'status')
        {
            let goveeData = goveeResponse.msg.data;
            if (this.GoveeDeviceControllers.hasOwnProperty(value.ip))
            {
                let currentDeviceData = this.GoveeDeviceControllers[value.ip].device;

                let shouldUpdate = false;
                for (let key of Object.keys(goveeData))
                {
                    if (goveeData[key] != currentDeviceData[key])
                    {
                        shouldUpdate = true;
                        break;
                    }
                }

                if (shouldUpdate)
                {
                    let newDeviceData = Object.assign({}, currentDeviceData, goveeData);
                    this.GoveeDeviceControllers[value.ip].device = newDeviceData;
    
                    service.log('Saving received data to govee device controller');
                    service.log(newDeviceData);
    
                    this.GoveeDeviceControllers[value.ip].save();

                    for(const controller of service.controllers)
                    {
                        if (controller.obj.device.ip == value.ip)
                        {
                            controller.obj.device = newDeviceData;
                            controller.obj.changed = true;
                            service.log('Found controller and changed data to:');
                            service.log(controller.obj);
                        }
                    }
                }
            } else {
                service.log('No controller found for ' + value.ip);
            }
        }
	};

    this.Delete = function(ip)
    {
        service.log('Deleting device ' + ip);
        let deviceListJSON = service.getSetting('GoveeDirectConnect', 'devices');
        let forcedGoveeDevices = JSON.parse(deviceListJSON);

        service.log(forcedGoveeDevices);
        if (Object.keys(forcedGoveeDevices).includes(ip))
        {
            delete forcedGoveeDevices[ip];
            service.saveSetting('GoveeDirectConnect', 'devices', JSON.stringify(forcedGoveeDevices));

            let controller = this.GoveeDeviceControllers[ip];
            service.removeController(controller);
            delete this.GoveeDeviceControllers[ip];
            
            this.Update(true);
            return;
        }
    }
}

class GoveeController
{
    constructor(device)
    {
        if (device.hasOwnProperty('device'))
        {
            this.id = device.device;
        } else
        {
            this.id = device.ip;
        }

        this.name = `Govee Controller for: ${device.ip}`;
        this.ip = device.ip;
        this.device = device;
        this.initialized = false;
    }

    validateDeviceUpdate(leds, type, split)
    {
        return (leds != this.device.leds || type != this.device.type || split != this.device.split);
    }

    updateDevice(leds, type, split)
    {
        this.device.leds = leds;
        this.device.type = type;
        this.device.split = split;

        this.save();

        service.log(`Changing leds and/or type to ${leds} leds and protocol type ${type}`);
        service.log('Changing mirrored setting to: ' + split);
        service.removeController(this);
        service.addController(this);
        service.announceController(this);
    }

    save()
    {
        let forcedGoveeDevices;
        try {
            forcedGoveeDevices = JSON.parse( service.getSetting('GoveeDirectConnect', 'devices') );
        } catch(ex)
        {
            forcedGoveeDevices = {};
        }

        forcedGoveeDevices[this.ip] = this.device;
        service.saveSetting('GoveeDirectConnect', 'devices', JSON.stringify(forcedGoveeDevices));
        service.log('Updating the controller');
        service.updateController(this);
    }

    update()
    {
		if(!this.initialized)
        {
			this.initialized = true;
            service.log('Announcing Govee Controller for ip: ' + this.ip);
			service.announceController(this);
		}
	}

    delete()
    {
        service.log('Trying to delete controller for ip: ' + this.ip);
    }
}

class GoveeDevice
{
    constructor(data)
    {
        this.id = (data.hasOwnProperty('device')) ? data.device : data.ip;

        this.ip = data.ip;
        this.port = 4003;
        this.statusPort = 4001;
        this.leds = parseInt(data.leds);
        this.type = parseInt(data.type);
        this.split = parseInt(data.split);
        this.onOff = data.hasOwnProperty('onOff') ? data.onOff : false;
        this.pt = data.hasOwnProperty('pt') ? data.pt : null;
        // PT Data uwABsgAI = razer off, uwABsgEJ = razer on
        this.lastRender = 0;
        this.enabled = true;

        this.lastSingleColor = '';
    }

    getStatus()
    {
        udp.send(this.ip, this.port, {
            msg: {
                cmd: "status",
                data: {}
            }
        });
    }

    getDeviceData()
    {
        device.log('Asking device for device data');
        udp.send(this.ip, this.statusPort, {msg: { cmd: 'scan', data: {account_topic: 'reserve'} }});
    }

    getRazerModeCommand(enable)
    {
        let command = base64.encode([0xBB, 0x00, 0x01, 0xB1, enable, 0x0A]);
        return { msg: { cmd: "razer", data: { pt: command } } };
    }

    getColorCommand(colors)
    {
        let command = {};

        switch(this.type)
        {
            // Dreamview mode
            case 1:
                command = this.getDreamViewCommand(colors);
                break;
            case 2:
                command = this.getRazerCommand(colors);
                break;
            case 3:
                command = this.getSolidColorCommand(colors);
                break;
            case 4:
                command = this.getRazerLegacyCommand(colors);
                break;
        }
        
        return { msg: command };
    }

    getDreamViewCommand(colors)
    {
        let dreamViewHeader = [0xBB, 0x00, 0x20, 0xB0, 0x01, colors.length];
        
        let colorsCommand = dreamViewHeader;
        for (let c = 0; c < colors.length; c++)
        {
            let color = colors[c];
            colorsCommand = colorsCommand.concat(color);
        }

        colorsCommand.push( this.calculateXorChecksum(colorsCommand) );

        return {cmd: "razer", data: { pt: base64.encode(colorsCommand) } };
    }

    getRazerCommand(colors)
    {
        let razerHeader = [0xBB, 0x00, 0x0E, 0xB0, 0x01, colors.length];
        
        let colorsCommand = razerHeader;
        for(let c = 0; c < colors.length; c++)
        {
            // Color is an [r,g,b] array
            let color = colors[c];
            colorsCommand = colorsCommand.concat(color);
        }

        // Add razer checksum
        colorsCommand.push( this.calculateXorChecksum(colorsCommand) );
        // colorsCommand.push(0);

        return {cmd: "razer", data: { pt: base64.encode(colorsCommand) } };
    }

    getRazerLegacyCommand(colors)
    {
        let razerHeader = [0xBB, 0x00, 0x0E, 0xB0, 0x01, colors.length];
        
        let colorsCommand = razerHeader;
        for(let c = 0; c < colors.length; c++)
        {
            // Color is an [r,g,b] array
            let color = colors[c];
            colorsCommand = colorsCommand.concat(color);
        }

        // Add razer checksum
        colorsCommand.push(0);

        return {cmd: "razer", data: { pt: base64.encode(colorsCommand) } };
    }

    getSolidColorCommand(colors)
    {
        let color = colors[0];
        return {
            cmd: "colorwc",
            data: {
                color: {r: color[0], g: color[1], b: color[2]},
                colorTemInKelvin: 0
            }
        }
        
    }

    calculateXorChecksum(packet) {
        let checksum = 0;
        for (let i = 0; i < packet.length; i++) {
          checksum ^= packet[i];
        }
        return checksum;
    }

    sendRGB(colors, now)
    {
        if (this.enabled)
        {
            if (this.split == 2)
            {
                colors = colors.concat(colors);
            }
    
            // Send RGB command first, then do calculations and stuff later
            let colorCommand = this.getColorCommand(colors);
            this.send(colorCommand);
    
            // Get status every 10 seconds
            if (now - this.lastRender > 10000)
            {
                // Check if we have the device data already
                if (this.ip == this.id)
                {
                    // There's no unique ID, so we need to get that data
                    this.getDeviceData();
                }
    
                // Turn device on if it's off
                if (!this.onOff)
                {
                    device.log('Sending `turn on` command');
                    this.turnOn();
                }
    
                // If not single color
                if (this.type !== 3)
                {
                    if (this.pt !== 'uwABsgEJ')
                    {
                        device.log('Sending `razer on` command');
                        this.send(this.getRazerModeCommand(true));
                    }
                }
    
                this.getStatus();
                this.lastRender = now;
            }
        }
    }

    singleColor(color, now)
    {
        if (now - this.lastRender > 10000)
        {
            // Turn off Razer mode
            if (this.pt == 'uwABsgEJ')
            {
                device.log('Sending `razer off` command');
                this.send(this.getRazerModeCommand(false));
            }

            this.getStatus();
            this.lastRender = now;
        }

        let jsonColor = JSON.stringify(color);
        if (jsonColor !== this.lastSingleColor)
        {
            this.lastSingleColor = jsonColor;
            let colorCommand = this.getSolidColorCommand([color]);
            device.log('Sending new color code ' + JSON.stringify(colorCommand));
            this.send({msg: colorCommand});
        }
    }

    send(command)
    {
        // device.log('Sending command: ' + JSON.stringify(command));
        udp.send(this.ip, this.port, command);
    }

    turnOff()
    {
        this.enabled = false;
        this.send(this.getRazerModeCommand(false));
        this.send({ msg: { cmd: "turn", data: { value: 0 } } });
        this.lastRender = 0;
    }

    turnOn()
    {
        this.send({ msg: { cmd: "turn", data: { value: 1 } } });
    }
}

class GoveeDeviceUI
{
    constructor(deviceInstance, controller)
    {
        this.ledCount = controller.device.leds;
        this.ledNames = [];
        this.ledPositions = [];

        this.device = deviceInstance
        this.subDevices = [];
        this.controller = controller;
        this.goveeDevice = new GoveeDevice(this.controller.device);

        this.device.addFeature("udp");
        this.device.addFeature("base64");

        this.lastRender = 0;

        // Create led map
        this.createLedMap(this.ledCount);

        if (this.goveeDevice.split == 3)
        {
            this.log('This should be two subdevices');
            this.device.SetIsSubdeviceController(true);
            for (let num = 1; num <=2; num++)
            {
                let subDeviceId = `${this.controller.name} ${num}`
                this.device.createSubdevice(subDeviceId);
                this.device.setSubdeviceName(subDeviceId, `${this.controller.name}`);
                this.device.setSubdeviceImage(subDeviceId, '');
                this.device.setSubdeviceSize(subDeviceId, this.ledCount, 1);
                this.device.setSubdeviceLeds(subDeviceId, this.ledNames, this.ledPositions);

                this.subDevices.push(subDeviceId);
            }
        } else
        {
            this.device.setSize([this.controller.device.leds, 1]);
            this.device.setControllableLeds(this.ledNames, this.ledPositions);
        }
    }

    updateGoveeDevice(deviceData)
    {
        this.goveeDevice = new GoveeDevice(deviceData);
    }

    log(data)
    {
        this.device.log(data);
    }
    
    createLedMap(count)
    {
        this.ledNames = [];
        this.ledPositions = [];
    
        for(let i = 0; i < count; i++)
        {
            this.ledNames.push(`Led ${i + 1}`);
            this.ledPositions.push([i, 0]);
        }
    }

    render(lightingMode, forcedColor, now)
    {
        switch(lightingMode)
        {
            case "Canvas":
                let RGBData = [];

                if (this.goveeDevice.split == 3)
                {
                    RGBData = this.getRGBFromSubdevices();
                    this.device.log(RGBData.length);
                } else
                {
                    RGBData = this.getDeviceRGB();
                }

                this.goveeDevice.sendRGB(RGBData, now);
                break;
            case "Forced":
                this.goveeDevice.singleColor(this.hexToRGB(forcedColor), now);
                break;
        }
        
    }

    shutDown(shutDownMode, shutDownColor)
    {
        let razerCommand = this.goveeDevice.getRazerModeCommand(false)
        this.goveeDevice.send(razerCommand);

        switch(shutDownMode)
        {
            case "Do nothing":
                break;
            case "Single color":
                this.goveeDevice.singleColor(this.hexToRGB(shutDownColor));
                break;
            case "Turn device off":
                this.goveeDevice.turnOff();
                break;
        }
    }

    getRGBFromSubdevices()
    {
        const RGBData = [];
    
        for(const subdeviceId of this.subDevices)
        {
            for(let i = 0 ; i < this.ledCount; i++)
            {
                const color = this.device.subdeviceColor(subdeviceId, i, 0);
                RGBData.push(color);
            }
        }
    
        return RGBData;
    }
    
    getDeviceRGB()
    {
        const RGBData = [];
    
        for(let i = 0 ; i < this.ledPositions.length; i++){
            const ledPosition = this.ledPositions[i];
            const color = this.device.color(ledPosition[0], ledPosition[1]);
            RGBData.push(color);
        }
    
        return RGBData;
    }

    hexToRGB(hexColor)
    {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        const colors = [];
        colors[0] = parseInt(result[1], 16);
        colors[1] = parseInt(result[2], 16);
        colors[2] = parseInt(result[3], 16);

        return colors;
    }
}

export function Image() {
    return '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AgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcAAlAcJbUhAACCCCAgDMCJADOhIqGIoAAAgggEJwACUBwltSEAAIIIICAMwIkAM6EioYigAACCCAQnAAJQHCW1IQAAggggIAzAiQAzoSKhiKAAAIIIBCcwP8BGN9tKORleSoAAAAASUVORK5CYII=';
}