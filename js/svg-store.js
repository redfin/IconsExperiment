var iconsElems = [];

for (var i = 0; i < ICONS.length; i++) {
	var useTag = '<use xlink:href="#' + ICONS[i] + '" />'
	iconsElems.push(<svg className="icon" dangerouslySetInnerHTML={{__html: useTag }} />);
}

React.render(
	<div>{iconsElems}</div>,
	document.getElementById('icons')
)
