React.render(
	<div>
	{
		ICONS.map(function(icon) {
			return COLORS.map(function(color) {
				return SIZES.map(function(size) {
					return '<Icon' + icon + ' height="' + size.height + '" width="' + size.width + '" fill="' + color + '"></Icon' + icon + '>';
				})
			})
		})
	}
	</div>,
	document.getElementById('icons')
)

React.render(
	<Iconagent height="40px" width="48px" fill="#A02021"></Iconagent>,
	document.getElementById('temp')
)
