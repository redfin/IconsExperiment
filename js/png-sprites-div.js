var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	iconsElems.push(<div><div className={"icon-" + ICONS[i]}></div></div>);
}
React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
