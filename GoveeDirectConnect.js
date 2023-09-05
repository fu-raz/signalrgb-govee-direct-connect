import base64 from "@SignalRGB/base64"
// import udp from "@SignalRGB/udp"

export function Name() { return "Govee Direct Connect"; }
export function Version() { return "0.0.1"; }
export function Type() { return "network"; }
export function Publisher() { return "RickOfficial"; }
// export function Documentation() { return "gettingstarted/srgbmods-net-info"; }
export function Size() { return [1, 1]; }
export function DefaultPosition(){return [0, 0]; }
export function DefaultScale(){return 1.0; }
// export function SupportsSubdevices(){ return true; }
// export function DefaultComponentBrand() { return "CompGen"; }
export function ControllableParameters()
{
	return [
		{"property":"LightingMode", "group":"settings", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"settings", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"turnOffOnShutdown", "group":"settings", "label":"Turn WLED device OFF on Shutdown", "type":"boolean", "default":"false"},
	];
}

export function Initialize()
{
	device.addFeature("udp");
	device.addFeature("base64");
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

        let goveeInstance = new Govee(ip, leds ? leds : 1, type ? type : 3);
        this.testCommands = goveeInstance.getTests();
    }

    this.forceDiscover = function(ip, leds, type)
    {
        let goveeLight = { ip: ip, ledCount: leds, type: type };
        let forcedGoveeDevices = JSON.parse( service.getSetting("goveeForced", "devices") );
        forcedGoveeDevices.push(goveeLight);
        
        service.saveSetting("goveeForced", "devices", JSON.stringify( forcedGoveeDevices ));
        this.devicesLoaded = false;

        this.Update();
    }

    this.loadForcedDevices = function()
    {
        service.log('Trying to load forced devices');

        let deviceList = service.getSetting("goveeForced", "devices");
		if(deviceList !== undefined)
        {
            deviceList = JSON.parse(deviceList)
            // Check if devices are still in new device list
            for (let ip of Object.keys(this.GoveeDevices))
            {
                if (!deviceList.includes(ip))
                {
                    // Disconnect the Govee device
                    this.GoveeDevices[ip].delete();
                    delete this.GoveeDevices[ip];
                }
            }

            for(let goveeDevice of deviceList)
            {
                if (!Object.keys(this.GoveeDevices).includes(goveeDevice.ip))
                {
                    // Create new govee object
                    let newGoveeDevice = new Govee(goveeDevice.ip, goveeDevice.leds, goveeDevice.type);
                    this.GoveeDevices[goveeDevice.ip] = newGoveeDevice
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
    }

    this.Discovered = function(value)
    {
		service.log(value.response);
	};
}

class Govee
{
    constructor(ip, leds, type)
    {
        this.ip = ip;
        this.leds = parseInt(leds);
        this.type = parseInt(type);

        this.service = service;

        this.service.log('Created govee device with ip '+ip);
    }

    getStatus()
    {

    }

    getRazerModeCommand(enable)
    {
        let command = base64.encode([0xBB, 0x00, 0x01, 0xB1, enable, 0x0A]);

        return [
            { title: 'Turning on device', command: { msg: { cmd: "turn", data: { value: 1 } } } },
            { title: 'Enabling razer mode', command: { msg: { cmd: "razer", data: { pt: command } } } },
            { title: 'Enabling razer mode (second time)', command: { msg: { cmd: "razer", data: { pt: command } } } }
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
        commands = commands.concat( this.getRazerModeCommand(true) );

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
}