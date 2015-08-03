var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	iconsElems.push(<div><img className={"icon-" + ICONS[i]} /></div>);
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
