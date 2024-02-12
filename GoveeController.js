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

    updateDeviceData(receivedData)
    {
        this.device.update(receivedData);
        this.name = this.device.getName();

        this.discovery.updatedController(this);
    }

    toCacheJSON()
    {
        return this.device.toCacheJSON();
    }
}
