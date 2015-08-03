var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	iconsElems.push(<img src={'svg/' + ICONS[i] + '.svg'}/>);
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
