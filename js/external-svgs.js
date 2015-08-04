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
			// var useTag = '<use xlink:href="svg/' + ICONS[i] + '.svg" />'
			// iconsElems.push(<svg className="icon" style={styles} dangerouslySetInnerHTML={{__html: useTag }} />);
			// img tags don't support stroke/fill
			iconsElems.push(<img src={'svg/' + ICONS[i] + '.svg'} style={styles} />);
		}
	}
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
