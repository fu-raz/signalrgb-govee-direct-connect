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

        // We should have the device disconnect the socket
        //service.log('Sending disconnect command to device port: ' + this.device.uniquePort);
        //this.sendToDevice({msg: { cmd: 'disconnect' }})

        // Let discovery know that we updated the device settings and need to reinit the device
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

    relaySocketMessage(value)
    {
        if (this.device.uniquePort)
        {
            let goveeResponse = JSON.parse(value.data);
            this.sendToDevice(goveeResponse);
        } else
        {
            service.log('Govee device doesnt have a unique port');
        }
    }

    sendToDevice(data)
    {
        if (!this.udpSocket)
        {
            this.setupUDPSocket();
        }
        this.udpSocket.write(data, '127.0.0.1', this.device.uniquePort);
    }

    setupUDPSocket()
    {
        service.log('Creating udp socket for controller ' + this.id);
        this.udpSocket = udp.createSocket();
        this.udpSocket.on('error', this.handleSocketError.bind(this));
    }
}
