import goveeProducts from "./govee-products.js";
import GoveeDevice from "./GoveeDevice.js";

export default class GoveeDeviceUI
{
    constructor(device, controller)
    {
        this.device = device
        this.controller = controller;

        this.goveeDevice = new GoveeDevice(controller.device);

        // Setup lighting device
        this.ledCount = controller.device.leds;
        this.ledNames = [];
        this.ledPositions = [];

        this.subDevices = [];

        this.device.addFeature("udp");
        this.device.addFeature("base64");

        this.device.setName(this.goveeDevice.getName());
        this.device.setImageFromBase64(this.getImage(this.goveeDevice.sku));

        this.lastRender = 0;
        this.notifyId = 0;

        if (this.goveeDevice.testMode)
        {
            this.notifyId = this.device.notify('Govee device is waiting to connect', 'Please wait', 0);
            this.log('Govee device is in test mode');
            this.device.setSize([1, 1]);
            this.device.setControllableLeds(['Test color'], [ [0,0] ]);
        } else
        {
            this.device.denotify(this.notifyId);
            this.createLedMap(this.ledCount);
            switch(this.goveeDevice.split)
            {
                case 3:
                    this.log('This should be two subdevices');
                    this.device.SetIsSubdeviceController(true);
                    for (let num = 1; num <=2; num++)
                    {
                        let subDeviceId = `${this.goveeDevice.id}:${num}`;
                        this.device.createSubdevice(subDeviceId);
                        this.device.setSubdeviceName(subDeviceId, `${this.goveeDevice.getName()}`);
                        this.device.setSubdeviceImage(subDeviceId, '');
                        this.device.setSubdeviceSize(subDeviceId, this.ledCount, 1);
                        this.device.setSubdeviceLeds(subDeviceId, this.ledNames, this.ledPositions);

                        this.subDevices.push(subDeviceId);
                    }
                    break;
                case 4:
                    this.device.SetLedLimit(this.ledCount);
                    this.device.addChannel(this.goveeDevice.sku, this.ledCount);
                    break;
                default:
                    this.device.setSize([this.controller.device.leds, 1]);
                    this.device.setControllableLeds(this.ledNames, this.ledPositions);
                    break;
            }
        }
    }

    updateStatus(receivedData)
    {
        this.goveeDevice.updateStatus(receivedData);
    }

    getImage(sku)
    {
        if (goveeProducts.hasOwnProperty(sku)) return goveeProducts[sku].base64Image;
        return goveeProducts.default.base64Image;
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
        if (this.goveeDevice.testMode)
        {
            // We should wait till we get new data
            if (now - this.lastRender > 10000)
            {
                this.log('Trying to retreive device data...');
                this.goveeDevice.requestDeviceData();
                this.lastRender = now;
            }
        } else 
        {
            switch(lightingMode)
            {
                case "Canvas":
                    let RGBData = [];
    
                    switch(this.goveeDevice.split)
                    {
                        case 3:
                            RGBData = this.getRGBFromSubdevices();
                            this.device.log(RGBData.length);
                            break;
                        case 4:
                            if (this.device.getLedCount() == 0) return;
                            const channel = this.device.channel(this.goveeDevice.sku);
                            RGBData = this.parseChannelColors(channel.getColors('Inline'));
                            break;
                        default:
                            RGBData = this.getDeviceRGB();
                            break;
                    }
    
                    this.goveeDevice.sendRGB(RGBData, now);
                    break;
                case "Forced":
                    this.goveeDevice.singleColor(this.hexToRGB(forcedColor), now);
                    break;
            }
        }
    }

    shutDown(shutDownMode, shutDownColor)
    {
        switch(shutDownMode)
        {
            case "Do nothing":
                break;
            case "Single color":
                this.goveeDevice.singleColor(this.hexToRGB(shutDownColor));
                break;
            default:
                this.device.log('Shutting down and turning device off');
                this.goveeDevice.turnOff();
                break;
        }
    }

    parseChannelColors(inlineColors)
    {
        let RGBData = [];
        for (let i = 0; i < inlineColors.length; i = i + 3)
        {
            RGBData.push([
                inlineColors[i],
                inlineColors[i+1],
                inlineColors[i+2]
            ]);
        }

        let totalColors = RGBData.length;
        if (totalColors < this.ledCount)
        {
            for (let i = totalColors; i < this.ledCount; i++)
            {
                RGBData.push([0,0,0]);
            }
        }
        return RGBData;
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