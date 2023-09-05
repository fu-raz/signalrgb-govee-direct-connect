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
					Text {
						color: theme.primarytextcolor
						text: "If you want to test this plugin right now, make sure you HARD CODE the ip of your device in the GoveeDirectConnect.js file on line 35."
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
						/*
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
						*/
					}
				}
				
			}
		}

	}
}