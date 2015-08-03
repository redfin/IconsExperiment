var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	var styles = {'height': '22px', 'width': '24px', 'background-repeat': 'no-repeat' }
	iconsElems.push(<img style={styles} className={ICONS[i]} />);
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
