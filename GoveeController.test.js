import udp from "@SignalRGB/udp";

export default class GoveeController
{
    constructor(goveeDevice, discovery)
    {
        this.device = goveeDevice;
        this.discovery = discovery;

        this.id = goveeDevice.ip;
        this.name = goveeDevice.getName();

        this.changed = false;
        this.statusData = {};

        this.connected = false;
        this.messageQueue = [];
        this.udpSocket = udp.createSocket();
        this.udpSocket.on('error', this.handleSocketError.bind(this));
        this.udpSocket.on('connection', this.handleSocketConnection.bind(this));
    }

    validateDeviceUpdate(leds, type, split)
    {
        return (leds != this.device.leds || type != this.device.type || split != this.device.split);
    }

    updateDevice(leds, type, split)
    {
        // Change the device data
        this.device.leds = leds;
        this.device.type = type;
        this.device.split = split;

        // Save the device data
        this.device.save();

        this.discovery.updatedController(this);
    }

    toCacheJSON()
    {
        return this.device.toCacheJSON();
    }

    handleSocketError(errId, errMessage)
    {
        service.log(errMessage);
    }

    handleSocketConnection()
    {
        console.log('Connection established');
        this.connected = true;
        while(this.messageQueue.length > 0)
        {
            let goveeResponse = this.messageQueue.shift();
            service.log('Sending delayed data');
            service.log(goveeResponse)
            this.udpSocket.send(goveeResponse);
        }
    }

    relaySocketMessage(value)
    {
        if (this.device.uniquePort)
        {
            let goveeResponse = JSON.parse(value.data);
            this.udpSocket.write(goveeResponse, '127.0.0.1', this.device.uniquePort);
        } else
        {
            service.log('Govee device doesnt have a unique port');
        }
    }
}
