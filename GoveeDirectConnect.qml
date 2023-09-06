Item {
	anchors.fill: parent
	Column {
		width: parent.width
		height: parent.height
		spacing: 10

		Column {
			y: 10
			width: parent.width - 20
			spacing: 0
			Text {
				color: theme.primarytextcolor
				text: "Use this plugin to direct connect to your Govee device. Make sure the device has a permanent IP by setting up your router."
				font.pixelSize: 16
				font.family: "Poppins"
				font.bold: false
				bottomPadding: 10
				width: parent.width
				wrapMode: Text.WordWrap
			}
			Text {
				color: theme.primarytextcolor
				text: "If you want to use the test button to test your Govee device right now, make sure you HARD CODE the ip of your device in the GoveeDirectConnect.js file on line 35. Hopefully this will change in the future"
				font.pixelSize: 16
				font.family: "Poppins"
				font.bold: false
				bottomPadding: 10
				width: parent.width
				wrapMode: Text.WordWrap
			}
			Text {
				color: theme.primarytextcolor
				text: "If you just want to add multiple Govee devices you can enter the IP address, the amount of leds, select the protocol type and press ADD. Changing the led amount or protocol type on a controller doesn't work yet."
				font.pixelSize: 16
				font.family: "Poppins"
				font.bold: false
				bottomPadding: 10
				width: parent.width
				wrapMode: Text.WordWrap
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
						icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVQ4jZWS4XHCMAxGn3VdICukI3QFWIERYISuQEcII9AVMgIrkBHIBp/4EdEaEwP57nTyydazZBkKubRyyTNblWeqcqktkm/W1nKsEh+AQ/inqgH6ZLYD+ry6JYBSLXB26eLS3qVmKWAEfsN/B6xdBEhmm2T2CeyABji51Hy8CfhTMju4BNBFNf/Kxnh2qQs/O8bYu9QAL/+BS0eX/O4NktkArIuz64jPt1RWEMv8xiGD37XA9Jgvy39ow6VtxPb5FEam71vTeEtmmsAI/CSXuidJuRrgK2uvB4bkkr8JmNUV4XrdYTAY354AAAAASUVORK5CYII="
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
						color: "#009000"
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
						icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAV0lEQVQ4jWP8//8/A0UAnwH///3r+P/vXwdevQQMuPv/37+7+AxgItaluMAwMIARGpIdDAwMoVjklaD0PSxyqxkYGSsodsFoNFLBABYC8qsJGcBIaXYGAFjoNxCMz3axAAAAAElFTkSuQmCC"
						text: "Add"
						anchors.right: parent.center
						onClicked: {
							discovery.forceDiscover(discoverIP.text, ledCount.text, lightType.currentValue);
						}
					}
				}
			}
		}

		Column {
			spacing: 10

			Repeater {
				model: service.controllers          

				delegate:
				Item {
					id: root
					width: 500
					height: content.height
					
					property var controller: model.modelData.obj

					Rectangle {
						width: parent.width
						height: parent.height
						color: Qt.lighter(theme.background2, 1.3)
						radius: 2
					}

					Column{
						id: content
						width: parent.width
						padding: 15
						spacing: 5

						Row{
							width: parent.width
							height: childrenRect.height

							Column{
								id: leftCol
								width: 260
								height: childrenRect.height
								spacing: 10

								Text{
									color: theme.primarytextcolor
									text: controller.name
									font.pixelSize: 16
									font.family: "Poppins"
									font.weight: Font.Bold
									bottomPadding: 10
								}

							}
						}

						Row {
							spacing: 10

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
									text: controller.device.leds
									
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
								
								ComboBox {
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
									currentIndex: controller.device.type - 1
								}
							}

							Item {
								Rectangle {
									width: 90
									height: 30
									color: "#003000"
									radius: 2
								}
								width: 90
								height: 30
								ToolButton {
									enabled: false
									height: 30
									width: 90
									anchors.verticalCenter: parent.verticalCenter
									font.family: "Poppins"
									font.bold: true
									icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6ElEQVQ4jZWTaxGDMBCEN3GABSxgAQtYoBKoBCzEQmoFJIAEcLDXH73QlB4MZCYzN5Psl71HgJMlZClkeXbHElVCRiEXIUX3ImQQssjAwRJ3mWhSUNQ4gdoM3lviScjagLc7V7K5UNtJXJzUY9HdJIDX8wLACODhvF8tMYBB780AmluFVUi/sy9CBncTsm/p6jTnn7yd9/MdajCsxat6n8UvfAoJAPXRBApZCzlsrc4cNFmbqgNxkQ1VtXcQ8a3FH0BfHACUAJ7O+zEdpAlcNE7TZo2yCNlZ1vqUk9oMxmeKR6kdrivf+Q3AUXasRZoSOwAAAABJRU5ErkJggg=="
									text: "Update"
									anchors.right: parent.center
									onClicked: {
										
									}
								}
							}
							
							Item {
								Rectangle {
									width: 90
									height: 30
									color: "#800000"
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
									icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAx0lEQVQ4jbWT2w2DMAxFjxELsEI6Ait0BbpCR2hHYJbO0BU6QlmBDex+NEEuBAgfvVKkxL45usoDMjLVt6nabLwXPjPqzOYeCMATGGI5AGdT7aWq7t5fm2oD9HHdAF2cj86X5jdTDW59lVhYxCuSiEiMnSAv4LKz7QG0wAmRYarGg9tN4n1mRjXrNwXBfzweMBwATNE9YIwRVyGuN93QArCToggQNgCptwko0X8THDoD/5lSsYsvM6d2DphkqiHzhddGgO9L/ACGFZcIfeUD6AAAAABJRU5ErkJggg=="
									text: "Delete"
									anchors.right: parent.center
									onClicked: {
										discovery.Delete(controller.id);
									}
								}
							}

							
						}
					}
				}  
			}
		}
		

	}
}