var elem = '<%= contents %>';

React.render(
	<div dangerouslySetInnerHTML={{__html: elem }}></div>,
	document.getElementById('icon-<%= fileName %>')
);
