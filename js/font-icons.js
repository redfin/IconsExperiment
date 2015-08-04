var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	for (var j = 0; j < COLORS.length; j++) {
		for (var k = 0; k < SIZES.length; k++) {
			styles = {
				color: COLORS[j],
				"font-size": SIZES[k].height
			}
			iconsElems.push(<span className={"icon icon-" + ICONS[i]} style={styles}></span>);
		}
	}
}

React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
