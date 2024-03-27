import {encode, decode} from "@SignalRGB/base64";
import udp from "@SignalRGB/udp";

const RAZER_ON = 'uwABsgEJ';
const RAZER_OFF = 'uwABsgAI';

const DREAMVIEW_ON = 'uwAZsgEHADwPAQQPAQIPAQQPAQQPAQIPAQIPAQAi';
const DREAMVIEW_OFF = 'uwAZsgAHADwPAQQPAQIPAQQPAQQPAQIPAQIPAQAj';

export default class GoveeDevice
{
    constructor(data)
    {
        if (data)
        {
            this.id = (data.hasOwnProperty('id')) ? data.id : null;
            this.ip = data.ip;
            this.leds = parseInt(data.leds);
            this.type = parseInt(data.type);
            this.split = data.split ? parseInt(data.split) : 1;
            this.sku = data.hasOwnProperty('sku') ? data.sku : null;
            this.firmware = data.hasOwnProperty('bleVersionSoft') ? data.bleVersionSoft : null;
            this.name = (data.hasOwnProperty('name')) ? data.name : this.generateName();
            this.uniquePort = (data.hasOwnProperty('uniquePort') ? data.uniquePort : null);
        }

        this.testMode = (!this.id);
        
        this.brightness = 100;
        this.onOff = 0;
        this.pt = RAZER_OFF;
        this.port = 4003;
        this.statusPort = 4001;
        this.enabled = true;

        this.lastRender = 0;
        this.lastStatus = 0;
        this.lastDeviceDataCheck = 0;
        this.lastSingleColor = '';
    }

    handleSocketMessage(message)
    {
        try
        {
            let goveeResponse = JSON.parse(message.data);
            if (goveeResponse.hasOwnProperty('msg'))
            {
                switch(goveeResponse.msg.cmd)
                {
                    case 'scan':
                        this.update(goveeResponse.msg.data);
                        break;
                    case 'status':
                    case 'devStatus':
                        this.updateStatus(goveeResponse.msg.data);
                        break;
                    case 'disconnect':
                        this.disconnectSocket();
                        break;
                    default:
                        device.log('Received unknown command');
                        device.log(message.data);
                        break;
                }
            }
        } catch(err)
        {
            device.log(err.message);
        }
    }

    handleSocketError(errorId, errorMessage)
    {
        device.error(errorMessage);
    }

    handleListening()
    {
        const address = this.udpServer.address();
        device.log(`Started listening on`);
        device.log(address);
    }

    handleConnection()
    {
        // service.log('Connected to');
        // service.log(this.udpServer.remoteAddress());
    }

    disconnectSocket()
    {
        this.udpServer.close();
    }

    setupUdpServer()
    {
        if (this.uniquePort)
        {
            this.udpServer = udp.createSocket();
            this.udpServer.on('message', this.handleSocketMessage.bind(this));
            this.udpServer.on('error', this.handleSocketError.bind(this));
            this.udpServer.on('listening', this.handleListening.bind(this));

            // Listen to this device specific port
            this.udpServer.bind(this.uniquePort);
        }
    }

    save()
    {
        if (this.id)
        {
            // Create a new setting specifically for that device
            service.saveSetting(this.id, 'ip', this.ip);
            service.saveSetting(this.id, 'leds', this.leds);
            service.saveSetting(this.id, 'type', this.type);
            service.saveSetting(this.id, 'split', this.split);
            service.saveSetting(this.id, 'sku', this.sku);
            service.saveSetting(this.id, 'firmware', this.firmware);
            service.saveSetting(this.id, 'name', this.name);
            service.saveSetting(this.id, 'uniquePort', this.uniquePort);

            service.log('Saved device');
            this.printDetails(service);
        } else
        {
            service.log('Data not yet received by device, saving device data later');
        }

        return this;
    }

    toCacheJSON()
    {
        return {
            id: this.id,
            ip: this.ip,
            name: this.name,
            leds: this.leds,
            type: this.type,
            split: this.split,
            uniquePort: this.uniquePort
        };
    }

    load(id)
    {
        this.id         = id;
        this.ip         = service.getSetting(id, 'ip');
        this.leds       = service.getSetting(id, 'leds');
        this.type       = service.getSetting(id, 'type');
        this.split      = service.getSetting(id, 'split');
        this.sku        = service.getSetting(id, 'sku');
        this.firmware   = service.getSetting(id, 'firmware');
        this.name       = service.getSetting(id, 'name');
        this.uniquePort = service.getSetting(id, 'uniquePort');

        service.log('Loaded device');
        this.printDetails(service);

        return this;
    }

    update(receivedData)
    {
        let hasChanged = false;
        
        if (this.id !== receivedData.device)
        {
            this.id = receivedData.device;
            hasChanged = true;
        }

        if (this.sku !== receivedData.sku)
        {
            this.sku = receivedData.sku;
            hasChanged = true;
        }

        if (this.firmware !== receivedData.bleVersionSoft)
        {
            this.firmware = receivedData.bleVersionSoft;
            hasChanged = true;
        }
        
        if (hasChanged)
        {
            this.name       = this.generateName();
            this.testMode   = false;
            this.save();
        }
    }

    updateStatus(receivedData)
    {
        if (this.brightness !== receivedData.brightness)
        {
            device.log(`Changed brightness from ${this.brightness} to ${receivedData.brightness}`);
            this.brightness = receivedData.brightness;
        }

        if (this.onOff !== receivedData.onOff)
        {
            device.log(`Changed onOff from ${this.onOff} to ${receivedData.onOff}`);
            this.onOff = receivedData.onOff;
        }

        if (this.pt !== receivedData.pt)
        {
            if (receivedData.pt == RAZER_OFF || 
                receivedData.pt == RAZER_ON || 
                receivedData.pt == DREAMVIEW_OFF ||
                receivedData.pt == DREAMVIEW_ON)
            {
                device.log(`Changed pt from ${this.pt} to ${receivedData.pt}`);
                this.pt = receivedData.pt;
            } else
            {
                device.log('Received weird PT data');
                device.log(receivedData.pt);
            }
        }
    }

    generateName()
    {
        return `Govee ${this.sku ? this.sku : 'device'} on ${this.ip}`;
    }

    getName()
    {
        return this.name;
    }

    printDetails(logger)
    {
        logger.log(`Name: ${this.name}`);
        logger.log(`SKU: ${this.sku}`);
        logger.log(`Firmware: ${this.firmware}`);
        logger.log(`IP address: ${this.ip}`);
        logger.log(`Total LED count: ${this.leds}`);
        switch(this.type)
        {
            // Dreamview mode
            case 1:
                logger.log(`Protocol: Dreamview`);
                break;
            case 2:
                logger.log(`Protocol: Razer`);
                break;
            case 3:
                logger.log(`Protocol: Solid color`);
                break;
            case 4:
                logger.log(`Protocol: Legacy Razer protocol`);
                break;
        }
        switch(this.split)
        {
            case 1:
                logger.log(`Split: Single logger`);
                break;
            case 2:
                logger.log(`Split: Mirrored`);
                break;
            case 3:
                logger.log(`Split: Two devices`);
                break;
            case 4:
                logger.log(`Split: Custom components`);
                break;
        }
    }

    getStatus()
    {
        const statusPacket = { msg: { cmd: "status", data: {} } };
        this.send(statusPacket);
    }

    requestDeviceData()
    {
        device.log('Asking device for device data');
        const deviceDataRequestPacket = {msg: { cmd: 'scan', data: {account_topic: 'reserve'} }};
        this.send(deviceDataRequestPacket, this.statusPort)
    }

    getRazerModeCommand(enable)
    {
        let command = encode([0xBB, 0x00, 0x01, 0xB1, enable, enable ? 0x0A : 0x0B]);
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

        return {cmd: "razer", data: { pt: encode(colorsCommand) } };
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

        return {cmd: "razer", data: { pt: encode(colorsCommand) } };
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

        return {cmd: "razer", data: { pt: encode(colorsCommand) } };
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

    sendRGB(colors, now, frameDelay)
    {
        if (this.enabled)
        {
            if (this.split == 2)
            {
                colors = colors.concat(colors);
            }

            // Every 60 minutes check if the device data has updated (like firmware changes)
            if (now - this.lastDeviceDataCheck > 60 * 60 * 1000)
            {
                this.requestDeviceData();
                this.lastDeviceDataCheck = now;

                // Not sending more commands to not overload
                return;
            }
    
            // Every 5 seconds check if we need to enable razer
            if (now - this.lastRender > 9 * 1000)
            {
                // Check if we have the device data already
                if (this.id == null)
                {
                    // There's no unique ID, so we need to get that data
                    this.requestDeviceData();
                } else
                {
                    // Turn device on if it's off
                    if (!this.onOff)
                    {
                        device.log('Sending `turn on` command');
                        this.turnOn();
                    } else
                    {
                        // Make sure device is on before sending more commands
                        // If not single color
                        if (this.type !== 3)
                        {
                            if (this.pt == RAZER_OFF || this.pt == DREAMVIEW_OFF)
                            {
                                device.log('Sending `razer on` command');
                                this.send(this.getRazerModeCommand(true));
                            }
                        }
                    }
                }
                
                this.lastRender = now;

                // Not sending more commands to not overload
                return
            }

            // Every 5 seconds check the status
            if (now - this.lastStatus > 5 * 1000)
            {
                this.getStatus();
                this.lastStatus = now;
                return
            }

            if (this.onOff)
            {
                // Check brightness if device is on
                if (this.brightness !== device.Brightness)
                {
                    device.log('Setting brightness');
                    this.setBrightness(device.Brightness);
                }

                try
                {
                    // Send RGB command first, then do calculations and stuff later
                    let colorCommand = this.getColorCommand(colors);
                    this.send(colorCommand);
                } catch(ex)
                {
                    device.error(ex.message);
                    device.error(colors);
                }
                

                frameDelay = parseInt(frameDelay);
                if (frameDelay > 0)
                {
                    device.pause(frameDelay);
                }
            }
        }
    }

    setBrightness(percentage)
    {
        this.send({msg: { cmd: 'brightness', data: { value: percentage }}});
        // Lets assume it gets set correctly
        this.brightness = percentage;
        device.log(`Setting brightness to ${percentage}%`);
    }

    singleColor(color, now)
    {
        if (now - this.lastRender > 10000)
        {
            // Turn off Razer mode
            if (this.pt == RAZER_ON)
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

    send(command, port)
    {
        this.udpServer.write(command, this.ip, port ? port : this.port);
    }

    turnOff()
    {
        this.enabled = false;
        // Set color to black
        this.singleColor([0,0,0], 0);

        // Turn device off
        this.send({ msg: { cmd: "turn", data: { value: 0 } } });

        this.pt = RAZER_OFF;
        this.onOff = 0;
    }

    turnOn()
    {
        this.send({ msg: { cmd: "turn", data: { value: 1 } } });
    }
}