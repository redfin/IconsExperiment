var iconsElems = [];
var styles = {};

for (var i = 0; i < ICONS.length; i++) {
	for (var j = 0; j < COLORS.length; j++) {
		for (var k = 0; k < SIZES.length; k++) {
			styles = {
				fill: COLORS[j],
				stroke: COLORS[j],
				height: SIZES[k].height,
				width: SIZES[k].width
			}
			var useTag = '<use style="height: ' + SIZES[k].height + '; width: ' + SIZES[k].width + ';" xlink:href="svg/' + ICONS[i] + '.svg#Iconography" />'
			iconsElems.push(<svg className="icon" viewBox={"-1 -1 26 26"} style={styles} dangerouslySetInnerHTML={{__html: useTag }} />);
		}
	}
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
