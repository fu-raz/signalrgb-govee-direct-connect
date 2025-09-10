import udp from "@SignalRGB/udp";

export default class GoveeController
{
    constructor(goveeDevice)
    {
        this.device = goveeDevice;

        this.id = goveeDevice.ip;
        this.name = goveeDevice.getName();

        this.changed = false;
        this.statusData = {};

        this.connected = false;
        this.messageQueue = [];
    }

    validateDeviceUpdate(leds, type, split, ip)
    {
        return (
            leds != this.device.leds || 
            type != this.device.type || 
            split != this.device.split || 
            ip != this.device.ip
        );
    }

    updateDevice(leds, type, split, ip)
    {
        // Change the device data
        this.device.leds = leds;
        this.device.type = type;
        this.device.split = split;

        // We have to do a little more if the IP has changed
        let ipChanged = (this.device.ip != ip);
        this.device.ip = ip;

        // Save the device data
        this.device.save();

        if (ipChanged)
        {
            // Change the device name
            this.device.name = this.device.generateName();
            
            // We should change the IP in discovery
            // this.discovery.changeIp(this.device.ip, ip);

            // Update the controller ID and name
            this.id = ip;
            this.name = this.device.getName();
        }

        // We should have the device disconnect the socket
        //service.log('Sending disconnect command to device port: ' + this.device.uniquePort);
        //this.sendToDevice({msg: { cmd: 'disconnect' }})

        // Let discovery know that we updated the device settings and need to reinit the device
        // this.discovery.updatedController(this);
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
            // Let the device handle the received message
            this.device.handleSocketMessage(value);
            if (this.device.hasChanged)
            {
                this.device.save();
                this.device.hasChanged = false;

                // Save the new data to the cache
                // this.discovery.saveCache();
            }

            let goveeResponse = JSON.parse(value.data);
            // Also send to device for realtime changes
            this.sendToDevice(goveeResponse);
        } else
        {
            service.log('Govee device doesnt have a unique port');
        }
    }

    sendToDevice(data)
    {
        this.setupUDPSocket();
        this.udpSocket.write(data, '127.0.0.1', this.device.uniquePort);
    }

    setupUDPSocket()
    {
        if (!this.udpSocket)
        {
            service.log('Device has unique port ' + this.device.uniquePort);
            service.log('Creating udp socket for controller ' + this.id);
            this.udpSocket = udp.createSocket();
            this.udpSocket.on('error', this.handleSocketError.bind(this));
        }
    }
}
