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

			// Item {
			// 	width: 90
			// 	height: 30
			// 	Rectangle {
			// 		width: parent.width
			// 		height: 30
			// 		color: "#D65A00"
			// 		radius: 2
			// 	}
			// 	ToolButton {
			// 		height: 30
			// 		width: parent.width
			// 		anchors.verticalCenter: parent.verticalCenter
			// 		font.family: "Poppins"
			// 		font.bold: true
			// 		icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVQ4jZWS4XHCMAxGn3VdICukI3QFWIERYISuQEcII9AVMgIrkBHIBp/4EdEaEwP57nTyydazZBkKubRyyTNblWeqcqktkm/W1nKsEh+AQ/inqgH6ZLYD+ry6JYBSLXB26eLS3qVmKWAEfsN/B6xdBEhmm2T2CeyABji51Hy8CfhTMju4BNBFNf/Kxnh2qQs/O8bYu9QAL/+BS0eX/O4NktkArIuz64jPt1RWEMv8xiGD37XA9Jgvy39ow6VtxPb5FEam71vTeEtmmsAI/CSXuidJuRrgK2uvB4bkkr8JmNUV4XrdYTAY354AAAAASUVORK5CYII="
			// 		text: "Test"
			// 		anchors.right: parent.center
			// 		onClicked: {
			// 			discovery.testDiscover(discoverIP.text, ledCount.text, lightType.currentValue);
			// 		}
			// 	}
			// }

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
						discovery.forceDiscover(discoverIP.text, ledCount.text, lightType.currentValue);
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
			width: 520
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
						color: theme.primarytextcolor
						text: controller.name
						font.pixelSize: 18
						font.family: "Poppins"
						font.weight: Font.Bold
					}

				// 	Item {
				// 		x: parent.width - 60
				// 		y: 0

				// 		Rectangle {
							
				// 			width: 30
				// 			height: 30
				// 			color: "#003000"
				// 			radius: 2
						
				// 			ToolButton {
				// 				id: onOff
				// 				width: parent.width
				// 				height: parent.height
				// 				anchors.verticalCenter: parent.verticalCenter
				// 				font.family: "Poppins"
				// 				font.bold: true
				// 				icon.source: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA6klEQVQ4jZVSURXCMAy8xUEtzMKQgIVZmAUsYAEkbBJAAkjoJGwOLvykvFC6Mu69vL4m1+u1CVCBklHJWONIrbgHbwEleyXHH446JW9KhrxwVFKVXJRsXf7jCUqejXfLBaIVukI+ZrnRuIO3rkqeC5ZLAsGcxvQHvdWutfcnNCIrgAlAq2QnADoAayMy7xEwPG1tUxfWPw57BAEwm51QIBwscqROzb41fYFYhOtagJKtbeKGi/zwYPyLT54sOdZEbOAWi69pHJ2TwRNshC9uWo9bNyQnW/Hwow4ATUEkABgA+FtmAFMjcs/5L6AYHte9jR/tAAAAAElFTkSuQmCC"
				// 				text: ""
				// 				anchors.right: parent.center
				// 				onClicked: {
				// 					controller.deviceInstance.turnOn();
				// 				}
				// 			}
				// 		}
				// 	}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Type: " + (controller.device.sku ? controller.device.sku : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Device id: " + (controller.device.device ? controller.device.device : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
					}
				}

				Row {
					width: parent.width

					Text {
						color: theme.primarytextcolor
						text: "Firmware: " + (controller.device.bleVersionSoft ? controller.device.bleVersionSoft : "Unknown")
						font.pixelSize: 14
						font.family: "Poppins"
						bottomPadding: 25
					}
				}

				Row {
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
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue);
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
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue);
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
							}
							textRole: "key"
							valueRole: "value"
							topInset: 0
							bottomInset: 0
							verticalPadding: 0
							currentIndex: controller.device.split - 1
							onActivated: {
								updateButton.enabled = controller.validateDeviceUpdate(ledCount.text, lightType.currentValue, splitDevice.currentValue);
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
									controller.updateDevice(ledCount.text, lightType.currentValue, splitDevice.currentValue, splitDevice.currentValue);
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
								discovery.Delete(controller.ip);
							}
						}
					}
				}
			}
		}  
	}
}