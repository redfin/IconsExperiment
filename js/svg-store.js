var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	for (var j = 0; j < COLORS.length; j++) {
		for (var k = 0; k < SIZES.length; k++) {
			styles = {
				fill: COLORS[j],
				stroke: COLORS[j],
				height: SIZES[k].height,
				width: SIZES[k].width
			}
			var useTag = '<use xlink:href="#' + ICONS[i] + '" />'
			iconsElems.push(<svg className="icon" style={styles} dangerouslySetInnerHTML={{__html: useTag }} />);
		}
	}
}

<icon name="agent"></icon>

React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
