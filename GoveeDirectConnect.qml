Item {
	anchors.fill: parent
	Column {
		width: parent.width
		height: parent.height
		Column {
			width: 500
			height: 115
			Rectangle {
				width: parent.width
				height: parent.height - 10
				color: "#141414"
				radius: 2
				Column {
					x: 10
					y: 10
					width: parent.width - 20
					spacing: 0
					Text {
						color: theme.primarytextcolor
						text: "Force Connect to Govee IP"
						font.pixelSize: 16
						font.family: "Poppins"
						font.bold: true
						bottomPadding: 20
					}
					Text {
						color: theme.primarytextcolor
						text: "Use this plugin to direct connect to your Govee device. Make sure the device has a permanent IP by setting up your router."
						font.pixelSize: 16
						font.family: "Poppins"
						font.bold: false
						bottomPadding: 10
					}
					Row {
						
						spacing: 5
						
						Rectangle {
							x: 0
							y: 0
							width: 200
							height: 30
							radius: 2
							border.color: "#444444"
							border.width: 2
							color: "#141414"
							

							TextField {
								width: 180
								leftPadding: 0
								rightPadding: 10
								id: discoverIP
								x: 10
								y: -5
								color: theme.primarytextcolor
								font.family: "Poppins"
								font.bold: true
								font.pixelSize: 16
								verticalAlignment: TextInput.AlignVCenter
								placeholderText: "192.168.0.1"
								
								
								validator: RegularExpressionValidator {
									regularExpression:  /^((?:[0-1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\.){0,3}(?:[0-1]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/
								}
								background: Item {
									width: parent.width
									height: parent.height
									Rectangle {
										color: "transparent"
										height: 1
										width: parent.width
										anchors.bottom: parent.bottom
									}
								}
							}
						}

						Rectangle {
							x: 0
							y: 0
							width: 60
							height: 30
							radius: 2
							border.color: "#444444"
							border.width: 2
							color: "#141414"
							
							TextField {
								width: 50
								leftPadding: 0
								rightPadding: 10
								id: ledCount
								x: 10
								y: -5
								color: theme.primarytextcolor
								font.family: "Poppins"
								font.bold: true
								font.pixelSize: 16
								verticalAlignment: TextInput.AlignVCenter
								placeholderText: "LEDs"
								
								
								validator: RegularExpressionValidator {
									regularExpression:  /^([0-9]{1,3})$/
								}
								background: Item {
									width: parent.width
									height: parent.height
									Rectangle {
										color: "transparent"
										height: 1
										width: parent.width
										anchors.bottom: parent.bottom
									}
								}
							}
						}
						
						Rectangle {
							
							width: 200
							height: 30
							radius: 2
							border.color: "#444444"
							border.width: 2
							color: "#141414"
							

							ComboBox{
								y: 0
								id: lightType
								width: parent.width
								height: 30
								font.family: "Poppins"
								font.bold: true
								flat: true
								model: ListModel {
									ListElement { key: "Dreamview"; value: 1}
									ListElement { key: "Razer"; value: 2}
									ListElement { key: "Single color"; value: 3}
								}
								textRole: "key"
								valueRole: "value"
								topInset: 0
								bottomInset: 0
								verticalPadding: 0
							}
						}

						Item{
							width: 90
							height: 30
							Rectangle {
								width: parent.width
								height: 30
								color: "#D65A00"
								radius: 2
							}
							ToolButton {
								height: 30
								width: parent.width
								anchors.verticalCenter: parent.verticalCenter
								font.family: "Poppins"
								font.bold: true
								icon.source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/icon-discover.png"
								text: "Test"
								anchors.right: parent.center
								onClicked: {
									discovery.testDiscover(discoverIP.text, ledCount.text, lightType.currentValue);
								}
							}
						}

						Item{
								Rectangle {
									width: 90
									height: 30
									color: "#008020"
									radius: 2
								}
								width: 90
								height: 30
								ToolButton {
									height: 30
									width: 90
									anchors.verticalCenter: parent.verticalCenter
									font.family: "Poppins"
									font.bold: true
									icon.source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/icon-discover.png"
									text: "Add"
									anchors.right: parent.center
									onClicked: {
										discovery.forceDiscover(discoverIP.text, ledCount.text, lightType.currentValue);
									}
								}
							}
					}
				}
				
			}
		}

		ListView {
			id: controllerList
			model: service.controllers   
			width: contentItem.childrenRect.width + (controllerListScrollBar.width * 1.5)
			height: parent.height - 150
			clip: true

			ScrollBar.vertical: ScrollBar {
				id: controllerListScrollBar
				anchors.right: parent.right
				width: 10
				visible: parent.height < parent.contentHeight
				policy: ScrollBar.AlwaysOn

				height: parent.availableHeight
				contentItem: Rectangle {
					radius: parent.width / 2
					color: theme.scrollBar
				}
			}


			delegate: Item {
				visible: true
				width: 450
				height: 115
				property var device: model.modelData.obj

				Rectangle {
					width: parent.width
					height: parent.height - 10
					color: device.offline ? "#101010" : device.connected ? "#003EFF" : "#292929"
					radius: 5
				}
				Column {
					x: 260
					y: 4
					width: parent.width - 20
					spacing: 10
					Image {
						x: 10
						y: 10
						height: 50				
						source: device.offline ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/wled_logo_akemi_mono.png" : device.connected ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/wled_logo_akemi.png" : "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/wled_logo_akemi_mono.png"
						fillMode: Image.PreserveAspectFit
						antialiasing: false
						mipmap: false
					}
				}
				Column {
					x: 285
					y: 60
					width: parent.width - 20
					spacing: 10
					Item{
						Rectangle {
							width: 120
							height: 26
							color: device.offline ? "#C0A21B" : device.connected ? "#292929" : "#003EFF"
							radius: 5
							MouseArea {
								anchors.fill: parent
								acceptedButtons: Qt.NoButton
								cursorShape: Qt.ForbiddenCursor
							}
						}
						width: 120
						height: 26
						ToolButton {
							height: 30
							width: 120
							anchors.verticalCenter: parent.verticalCenter
							font.family: "Poppins"
							font.bold: true 
							visible: device.offline ? false : device.connected
							text: "Unlink"
							anchors.right: parent.right
							onClicked: {
								device.startRemove();
							}
						}
						ToolButton {
							height: 30
							width: 120
							anchors.verticalCenter: parent.verticalCenter
							font.family: "Poppins"
							font.bold: true 
							visible: device.offline ? false : !device.connected
							text: "Link"
							anchors.right: parent.right
							onClicked: {
								device.startLink();
							}
						}
						Text {
							anchors.verticalCenter: parent.verticalCenter
							anchors.horizontalCenter: parent.horizontalCenter
							color: theme.primarytextcolor
							font.pixelSize: 15
							font.family: "Poppins"
							font.bold: true 
							visible: device.offline
							text: "OFFLINE!"
						}
					}
				}
				Column {
					x: 10
					y: 4
					spacing: 6
					Row {
						width: parent.width - 20
						spacing: 6

						Text {
							color: theme.primarytextcolor
							text: device.name
							font.pixelSize: 16
							font.family: "Poppins"
							font.bold: true
						}
						Image {
							y: 3
							id: iconSignalStrength
							source: device.offline ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-offline.png" : device.signalstrength >= 90 ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-signal4.png" : device.signalstrength >= 75 ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-signal3.png" : device.signalstrength >= 60 ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-signal2.png" : device.signalstrength >= 50 ? "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-signal1.png" : "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-signal0.png"
						}
					}
					Row {
						spacing: 6
						Image {
							visible: device.offline ? false : true
							id: iconTurnOn
							source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-turnon.png"
							width: 16; height: 16
							opacity: 1.0
							MouseArea {
								anchors.fill: parent
								hoverEnabled: true
								acceptedButtons: Qt.LeftButton
								onClicked: {
									 device.turnOn();
								}
								onEntered: {
									iconTurnOn.opacity = 0.8;
								}
								onExited: {
									iconTurnOn.opacity = 1.0;
								}
							}
						}
						Image {
							visible: device.offline ? false : true
							id: iconTurnOff
							source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-turnoff.png"
							width: 16; height: 16
							opacity: 1.0
							MouseArea {
								anchors.fill: parent
								hoverEnabled: true
								acceptedButtons: Qt.LeftButton
								onClicked: {
									 device.turnOff();
								}
								onEntered: {
									iconTurnOff.opacity = 0.8;
								}
								onExited: {
									iconTurnOff.opacity = 1.0;
								}
							}
						}
						Image {
							id: iconDelete
							source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-delete.png"
							width: 16; height: 16
							visible: device.forced ? true : false
							opacity: 1.0
							MouseArea {
								anchors.fill: parent
								hoverEnabled: true
								acceptedButtons: Qt.LeftButton
								onClicked: {
									 device.startDelete();
								}
								onEntered: {
									iconDelete.opacity = 0.8;
								}
								onExited: {
									iconDelete.opacity = 1.0;
								}
							}
						}
						Image {
							id: iconForceAdd
							source: "https://raw.githubusercontent.com/SRGBmods/public/main/images/wled/device-forceadd.png"
							width: 16; height: 16
							visible: device.forced ? false : true
							opacity: 1.0
							MouseArea {
								anchors.fill: parent
								hoverEnabled: true
								acceptedButtons: Qt.LeftButton
								onClicked: {
									 device.startForceDiscover();
								}
								onEntered: {
									iconForceAdd.opacity = 0.8;
								}
								onExited: {
									iconForceAdd.opacity = 1.0;
								}
							}
						}
					}
					Text {
						color: theme.primarytextcolor
						text: "MAC: " + device.mac + "  |  IP: " + device.ip + ":" + device.streamingPort
					}
					Text {
						color: theme.primarytextcolor
						text: "Arch: " + device.arch + " @ " + device.firmwareversion + "  |  LED count: " + device.deviceledcount
					}		  
				}
			}
		}
	}
}