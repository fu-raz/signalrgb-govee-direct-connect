import base64 from "@SignalRGB/base64";

export function Name() { return "Govee Direct Connect"; }
export function Version() { return "0.0.1"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
export function Size() { return [22, 1]; }
export function DefaultPosition() {return [0, 70]; }
export function DefaultScale(){return 2.0;}
export function ControllableParameters()
{
	return [
		{"property":"LightingMode", "group":"settings", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"settings", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOffOnShutdown", "group":"settings", "label":"Turn Govee device OFF on Shutdown", "type":"boolean", "default":"false"}
	];
}

export function SubdeviceController() { return false; }

let goveeUI;

export function Initialize()
{
    device.log('Creating Govee Device UI');
	goveeUI = new GoveeDeviceUI(device, controller);
}

export function Render()
{
    goveeUI.render();
}

export function Shutdown(suspend)
{
	goveeUI.shutDown(turnOffOnShutdown);
}

export function DiscoveryService()
{
    this.lastPollTime = -5000;
    this.PollInterval = 5000;

    this.UdpBroadcastPort = 4003;
    this.UdpBroadcastAddress = '192.168.100.38' // <-- MAKE SURE YOU CHANGE THIS IP TO YOUR DEVICE'S IP
    this.UdpListenPort = 4002;

    this.testCommands = [];
    this.GoveeDevices = {
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
        let goveeLight = { ip: ip, leds: parseInt(leds), type: parseInt(type) };

        let forcedGoveeDevices;
        try {
            forcedGoveeDevices = JSON.parse( service.getSetting('goveeForced', 'devices') );
        } catch(ex)
        {
            forcedGoveeDevices = [];
        }

        forcedGoveeDevices.push(goveeLight);
        
        service.saveSetting('goveeForced', 'devices', JSON.stringify( forcedGoveeDevices ));
        this.devicesLoaded = false;

        this.Update();
    }

    this.loadForcedDevices = function()
    {
        service.log('Trying to load forced devices');

        let deviceList = service.getSetting('goveeForced', 'devices');
		if(deviceList !== undefined)
        {
            deviceList = JSON.parse(deviceList)
            // Check if devices are still in new device list
            for (let ip of Object.keys(this.GoveeDevices))
            {
                if (!deviceList.includes(ip))
                {
                    let goveeController = service.getController(ip);
                    // Disconnect the Govee device
                    service.removeController(goveeController);
                    this.GoveeDevices[ip].delete();
                    delete this.GoveeDevices[ip];
                }
            }

            for(let goveeDeviceData of deviceList)
            {
                if (goveeDeviceData === null) continue;

                if (!Object.keys(this.GoveeDevices).includes(goveeDeviceData.ip))
                {
                    service.log('Adding new Govee controller for ' + goveeDeviceData.ip);

                    let goveeController = new GoveeController(goveeDeviceData);
                    this.GoveeDevices[goveeDeviceData.ip] = goveeController;
                    service.addController( goveeController );
                }
            }
            
            this.devicesLoaded = true;
		}
    }

    this.Update = function()
    {
        let diff = Date.now() - discovery.lastPollTime;

        if(diff > discovery.PollInterval)
        {
			discovery.lastPollTime = Date.now();

            if (!this.devicesLoaded)
            {
                this.loadForcedDevices();
            }
		}

        if (diff > 500)
        {
            if (this.testCommands.length > 0)
            {
                // Get the first command from the queue
                let cmd = this.testCommands.shift();
                service.log(cmd.title);
                service.broadcast( JSON.stringify(cmd.command) );
            }
        }

        for(const controller of service.controllers)
        {
			controller.obj.update();
		}
    }

    this.Discovered = function(value)
    {
		service.log(value.response);
	};

    this.Delete = function(ip)
    {
        const deviceListJSON = service.getSetting('goveeForced', 'devices');
        let deviceList = JSON.parse(deviceListJSON);

        for(let idx in deviceList)
        {
            if (deviceList[idx].ip == ip)
            {
                // Delete the controller entry
                delete deviceList[idx];
                // Save the new settings
                service.saveSetting('goveeForced', 'devices', JSON.stringify(deviceList));
                // Reload the devices
                this.loadForcedDevices();
                return;
            }
        }

    }
}

class GoveeController
{
    constructor(device)
    {
        this.id = device.ip;
        this.name = `Govee Controller for: ${device.ip}`;
        this.device = device;
        this.initialized = false;
    }

    update()
    {
		if(!this.initialized)
        {
			this.initialized = true;
            service.log('Announcing Govee Controller for ip: ' + this.id);
			service.announceController(this);
		}
	}

    delete()
    {
        service.log('Trying to delete controller for ip: ' + this.id);
    }
}

class GoveeDevice
{
    constructor(data)
    {
        this.ip = data.ip;
        this.port = 4003;
        this.statusPort = 4001;
        this.leds = parseInt(data.leds);
        this.type = parseInt(data.type);
        this.enabled = false;
    }

    getStatus()
    {
        device.log('Sending status UDP command');
        udp.send(this.ip, this.statusPort, {msg: { command: 'scan', data: {account_topic: 'reserve'} }});
    }

    getRazerModeCommands(enable)
    {
        let command = base64.encode([0xBB, 0x00, 0x01, 0xB1, enable, 0x0A]);

        return [
            { title: 'Enabling razer mode', command: { msg: { cmd: "razer", data: { pt: command } } } },
            { title: 'Enabling razer mode', command: { msg: { cmd: "razer", data: { pt: command } } } },
            { title: 'Enabling razer mode', command: { msg: { cmd: "razer", data: { pt: command } } } },
            { title: 'Enabling razer mode', command: { msg: { cmd: "razer", data: { pt: command } } } }
        ];

        // this.service.broadcast(JSON.stringify({ msg: { cmd: "turn", data: { value: 1 } } }));
        // this.service.broadcast( JSON.stringify({msg: {cmd: "razer", data: { pt: command } } }));
        // this.service.broadcast( JSON.stringify({msg: {cmd: "razer", data: { pt: command } } }));
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
        let razerColors = 4;
        let razerHeader = [0xBB, 0x00, 0x0E, 0xB0, 0x01, razerColors];
        
        let colorsCommand = razerHeader;
        for(let c = 0; c < razerColors; c++)
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

    getTestColors(amount)
    {
        let colors = [];

        for (let x = 1; x <= amount; x++)
        {
            if (x == 1 || x == amount)
            {
                colors.push([255,0,0]);
            } else
            {
                colors.push([255,255,255]);
            }
        }

        return colors;
    }

    getTests()
    {
        let commands = [];

        // Add the Razer mode commands
        commands = commands.concat( this.getRazerModeCommands(true) );

        let minLedAmount = 1;
        let maxLedAmount = this.leds;

        if (this.type == 2) // Razer
        {
            minLedAmount = 4;
        } else if (this.type == 3)
        {
            maxLedAmount = 1;
        }

        for (let ledAmount = minLedAmount; ledAmount <= maxLedAmount; ledAmount++)
        {
            let colors = this.getTestColors(ledAmount);
            commands.push( { title: `Testing ${ledAmount} colors`, command: this.getColorCommand(colors) } );
        }

        return commands;
    }

    calculateXorChecksum(packet) {
        let checksum = 0;
        for (let i = 0; i < packet.length; i++) {
          checksum ^= packet[i];
        }
        return checksum;
    }

    sendRGB(colors)
    {
        if (!this.enabled)
        {
            this.turnOn();
            this.getStatus();

            let commands = this.getRazerModeCommands(true);
            device.log(commands);
            for(const command of commands)
            {
                this.send(command.command);
            }
            this.enabled = true;
        }

        // Send RGB command
        let colorCommand = this.getColorCommand(colors);
        this.send(colorCommand);
    }

    send(command)
    {
        // device.log('Sending command: ' + JSON.stringify(command));
        udp.send(this.ip, this.port, command);
    }

    turnOff()
    {
        this.send({ msg: { cmd: "turn", data: { value: 0 } } });
        this.send({ msg: { cmd: "turn", data: { value: 0 } } });
    }

    turnOn()
    {
        device.log('Turning on device on ip: ' + this.ip);
        this.send({ msg: { cmd: "turn", data: { value: 1 } } });
        this.send({ msg: { cmd: "turn", data: { value: 1 } } });
    }
}

class GoveeDeviceUI
{
    constructor(deviceInstance, controller)
    {
        this.ledCount = 0;
        this.ledNames = [];
        this.ledPositions = [];

        this.device = deviceInstance
        this.controller = controller;
        this.log(controller.device);
        this.goveeDevice = new GoveeDevice(this.controller.device);

        this.device.addFeature("udp");
        this.device.addFeature("base64");
        this.device.setName(this.controller.name);

        this.setLedCount(this.controller.device.leds);
    }

    log(data)
    {
        this.device.log(data);
    }

    setLedCount(count)
    {
        this.log(`Setting led count to ${count}`);
        this.ledCount = count;
    
        this.createLedMap(count);

        this.device.setSize([count, 1]);
        this.device.setControllableLeds(this.ledNames, this.ledPositions);
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

    render()
    {
        let RGBData = [];

        RGBData = this.getDeviceRGB();

        this.goveeDevice.sendRGB(RGBData);
        this.device.pause(10);
    }

    shutDown(turnOffOnShutdown)
    {
        let razerCommand = this.goveeDevice.getRazerModeCommands(false)
        this.goveeDevice.send(razerCommand);

        if (turnOffOnShutdown)
        {
            this.goveeDevice.turnOff()
        }
    }

    getRGBFromSubdevices()
    {
        const RGBData = [];
    
        for(const subdevice of subdevices){
            const ledPositions = subdevice.ledPositions;
    
            for(let i = 0 ; i < ledPositions.length; i++){
                const ledPosition = ledPositions[i];
    
                const color = device.subdeviceColor(subdevice.id, ledPosition[0], ledPosition[1]);
                RGBData.push(color[0]);
                RGBData.push(color[1]);
                RGBData.push(color[2]);
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
}