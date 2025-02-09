Item {
	anchors.fill: parent

	Column {
		id: headerColumn
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
						ListElement { key: "Razer (Legacy)"; value: 4}
					}
					textRole: "key"
					valueRole: "value"
					topInset: 0
					bottomInset: 0
					verticalPadding: 0
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
					id: splitDevice
					width: parent.width
					height: 30
					font.family: "Poppins"
					font.bold: true
					flat: true
					model: ListModel {
						ListElement { key: "Single device"; value: 1}
						ListElement { key: "Duplicate"; value: 2}
						ListElement { key: "Two devices"; value: 3}
						ListElement { key: "Custom components"; value: 4}
					}
					textRole: "key"
					valueRole: "value"
					topInset: 0
					bottomInset: 0
					verticalPadding: 0
				}
			}

			Item {
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
						discovery.forceDiscover(discoverIP.text, ledCount.text, lightType.currentValue, splitDevice.currentValue);
					}
				}
			}
		}
	}

	ListView {
		id: controllerList
		model: service.controllers
		width: parent.width
		height: parent.height - (headerColumn.height + 20) - 50
		y: headerColumn.height + 20
		clip: true
		spacing: 20

		ScrollBar.vertical: ScrollBar {
			id: controllerListScrollBar
			anchors.right: parent.right
			width: 10
			visible: true //parent.height < parent.contentHeight
			policy: ScrollBar.AlwaysOn
			height: parent.availableHeight
			contentItem: Rectangle {
				radius: parent.width / 2
				color: theme.scrollBar
			}
		}

		delegate:
		Item {
			id: root
			width: 600
			height: content.height

			property var controller: model.modelData.obj

			Rectangle {
				width: parent.width
				height: parent.height
				color: Qt.lighter(theme.background2, 1.3)
				radius: 2
			}

			Column {
				id: content
				width: parent.width
				padding: 15

				Row {
					width: parent.width
					spacing: 10

					Text {
						width: parent.width - 60
						color: theme.primarytextcolor
						text: controller.device.getName()
						font.pixelSize: 18
						font.family: "Poppins"
						font.weight: Font.Bold
					}

					Item {
						x: parent.width - 60
						y: 0

						Rectangle {
							width: 30
							height: 30
							radius: width / 2
							color: "green" // Change the color as desired
							border.width: 0
							visible: (controller.device.id !== null)
						}

						Rectangle {
							width: 30
							height: 30
							radius: width / 2
							color: "grey" // Change the color as desired
							border.width: 0
							visible: (controller.device.id == null)
							
						}
					}
				}

				Row {
					width: parent.width
					height: 20

					Text {
						height: parent.height
						verticalAlignment: Text.AlignVCenter
						color: theme.primarytextcolor
						text: "IP: " + controller.device.ip
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width
					height: 20

					Text {
						height: parent.height
						verticalAlignment: Text.AlignVCenter
						color: theme.primarytextcolor
						text: "Type: " + (controller.device.sku ? controller.device.sku : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width
					height: 20

					Text {
						height: parent.height
						verticalAlignment: Text.AlignVCenter
						color: theme.primarytextcolor
						text: "Device id: " + (controller.device.id ? controller.device.id : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width
					height: 20

					Text {
						height: parent.height
						verticalAlignment: Text.AlignVCenter
						color: theme.primarytextcolor
						text: "Firmware: " + (controller.device.firmware ? controller.device.firmware : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
						// bottomPadding: 25
					}
				}

				Row {
					topPadding: 15
					spacing: 10
					Text {
						color: theme.primarytextcolor
						text: "LEDs"
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 0
						width: 60
					}
					Text {
						color: theme.primarytextcolor
						text: "Protocol"
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 0
						width: 200
					}
					Text {
						color: theme.primarytextcolor
						text: "Split"
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 0
						width: 200
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
							placeholderText: ""
							text: controller.device.leds
							visible: true
							
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
							onTextEdited: {
								// service.log(service);
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
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
								ListElement { key: "Razer (Legacy)"; value: 4}
							}
							textRole: "key"
							valueRole: "value"
							topInset: 0
							bottomInset: 0
							verticalPadding: 0
							currentIndex: controller.device.type - 1
							onActivated: {
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
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
							id: splitDevice
							width: parent.width
							height: 30
							font.family: "Poppins"
							font.bold: true
							flat: true
							model: ListModel {
								ListElement { key: "Single device"; value: 1}
								ListElement { key: "Duplicate"; value: 2}
								ListElement { key: "Two devices"; value: 3}
								ListElement { key: "Custom components"; value: 4}
							}
							textRole: "key"
							valueRole: "value"
							topInset: 0
							bottomInset: 0
							verticalPadding: 0
							currentIndex: controller.device.split - 1
							onActivated: {
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
							}
						}
					}
					
				}

				Row {
					width: parent.width
					topPadding: 15

					Rectangle {
						width: parent.width - 30
						x: 10
						height: 4
						color: theme.background2
					}
				}

				Row {
					width: parent.width
					topPadding: 15
					spacing: 10

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
							id: updateButton
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
								if (this.enabled) // dunno if this is needed btw
								{
									controller.updateDevice(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
									updateButton.enabled = false;
								}
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

					Item {
						width: 130
						height: 30

						Rectangle {
							height: parent.height
							width: parent.width
							color: "#808000"
							radius: 2
						}

						ToolButton {
							id: changeIPAddressButton
							height: parent.height
							width: parent.width
							anchors.verticalCenter: parent.verticalCenter
							font.family: "Poppins"
							font.bold: true
							icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6ElEQVQ4jZWTaxGDMBCEN3GABSxgAQtYoBKoBCzEQmoFJIAEcLDXH73QlB4MZCYzN5Psl71HgJMlZClkeXbHElVCRiEXIUX3ImQQssjAwRJ3mWhSUNQ4gdoM3lviScjagLc7V7K5UNtJXJzUY9HdJIDX8wLACODhvF8tMYBB780AmluFVUi/sy9CBncTsm/p6jTnn7yd9/MdajCsxat6n8UvfAoJAPXRBApZCzlsrc4cNFmbqgNxkQ1VtXcQ8a3FH0BfHACUAJ7O+zEdpAlcNE7TZo2yCNlZ1vqUk9oMxmeKR6kdrivf+Q3AUXasRZoSOwAAAABJRU5ErkJggg=="
							text: "Change IP"
							anchors.right: parent.center
							onClicked: {
								if (changeIPAddressTextbox.visible)
								{
									// We canceled, so change it back
									changeIPAddressTo.text = controller.device.ip
									changeIPAddressTextbox.visible = false;
									changeIPAddressButton.text = "Change IP"
									updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
								} else
								{
									changeIPAddressTextbox.visible = true;
									changeIPAddressButton.text = "Cancel"
								}
							}
						}
					}

					Item {
						visible: false
						id: changeIPAddressTextbox
						width: 200
						height: 30

						Rectangle {
							height: parent.height
							width: parent.width
							radius: 2
							border.color: "#444444"
							border.width: 2
							color: "#141414"

							TextField {
								height: parent.height
								width: parent.width - 20
								leftPadding: 10
								rightPadding: 10
								id: changeIPAddressTo
								color: theme.primarytextcolor
								font.family: "Poppins"
								font.bold: true
								font.pixelSize: 16
								verticalAlignment: TextInput.AlignVCenter
								placeholderText: "192.168.0.1"
								text: controller.device.ip
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
								onTextEdited: {
									// service.log(service);
									updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue, changeIPAddressTo.text);
								}
							}
						}
					}
				}
			}
		}  
	}
}