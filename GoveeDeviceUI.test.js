import goveeProducts from "./govee-products.test.js";
import GoveeDevice from "./GoveeDevice.test.js";

const PROTOCOL_SINGLE_COLOR = 3;

export default class GoveeDeviceUI
{
    constructor(device, controller)
    {
        this.device = device
        this.controller = controller;

        device.log('Setting up Govee device and udp server');
        this.goveeDevice = new GoveeDevice(controller.device);
        this.goveeDevice.setupUdpServer();

        // Setup lighting device
        this.ledCount = controller.device.leds;
        this.ledNames = [];
        this.ledPositions = [];

        this.subDevices = [];

        this.device.setName(this.goveeDevice.getName());
        this.device.setImageFromBase64(this.getImage(this.goveeDevice.sku));

        this.lastRender = 0;
        this.notifyId = 0;
        
        this.device.denotify(this.notifyId);
        this.setupLeds();

        this.setupTestProperty();
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
    
    setupLeds()
    {
        // If it's only a single color
        if (this.goveeDevice.type == PROTOCOL_SINGLE_COLOR)
        {
            this.ledCount = 1;
        }

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
                this.device.addChannel(`Govee [${this.goveeDevice.id}]`, this.ledCount);
                break;
            default:
                this.device.setSize([this.controller.device.leds, 1]);
                this.device.setControllableLeds(this.ledNames, this.ledPositions);
                break;
        }
    }

    setupTestProperty()
    {
        this.device.addProperty({
            "property":"testLedCount",
            "group":"lighting",
            "label":"Test led count",
            "step":"1",
            "type":"number",
            "min":"1",
            "max": this.ledCount,
            "default": this.ledCount,
            "live" : true});
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

    getTestRGBData(ledCount)
    {
        const result = [];
  
        for (let i = 0; i < ledCount; i++)
        {
            if (i % 2 === 0)
            {
                result.push([255, 0, 0]);
            } else {
                result.push([0, 0, 255]);
            }
        }
        
        return result;
    }

    render(lightingMode, forcedColor, now, frameDelay)
    {
        switch(lightingMode)
        {
            case "Test Pattern":
                let TestRGBData = this.getTestRGBData(parseInt(testLedCount));
                this.goveeDevice.sendRGB(TestRGBData, now, frameDelay);
                break;
            case "Canvas":
                let RGBData = [];

                switch(this.goveeDevice.split)
                {
                    case 3:
                        RGBData = this.getRGBFromSubdevices();
                        break;
                    case 4:
                        if (this.device.getLedCount() == 0) return;
                        const channel = this.device.channel(`Govee [${this.goveeDevice.id}]`);
                        RGBData = this.parseChannelColors(channel.getColors('Inline'));
                        break;
                    default:
                        RGBData = this.getDeviceRGB();
                        break;
                }

                this.goveeDevice.sendRGB(RGBData, now, frameDelay);
                break;
            case "Forced":
                this.goveeDevice.singleColor(this.hexToRGB(forcedColor), now);
                break;
        }
    }

    shutDown(shutDownMode, shutDownColor)
    {
        switch(shutDownMode)
        {
            case "Do nothing":
                this.goveeDevice.turnOffRazer();
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