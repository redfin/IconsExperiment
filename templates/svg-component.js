var Icon<%= fileName.replace(/-/,'') %> = React.createClass({
	displayName: "com.redfin.icons.<%= fileName %>",
	propTypes: {
		fill: React.PropTypes.string,
		width: React.PropTypes.string,
		height: React.PropTypes.string
	},
	getDefaultProps: function() {
		return {
			fill: "#585858",
			height: "24px",
			width: "24px"
		};
	},
	render: function() {
		var elem = '<%= contents %>';
		elem.replace(/fill="[^"]*"/, 'fill="' + this.props.fill + '"');
		elem.replace(/stroke="[^"]*"/, 'stroke="' + this.props.fill + '"');
		elem.replace(/width="[^"]*"/, 'width="' + this.props.width + '"');
		elem.replace(/height="[^"]*"/, 'height="' + this.props.height + '"');

		return (
			<div dangerouslySetInnerHTML={{__html: elem }}></div>
		);
	}
});
