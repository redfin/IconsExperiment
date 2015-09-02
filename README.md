# Icons-Experiment
This repo is an investigation to figure out what the "best" solution is for Redfin to serve its icons.  To see a more formal definition of best, see the blog post on the Redfin Blog.

# Installation
1. Install the toolchain -- see step 1 under Method for specific installation instructions.

2. Create a folder for the project, and clone the repo:
		mkdir ~/code/icons-experiment
		cd ~/code/icons-experiment
		git clone https://github.com/Redfin/IconsExperiment.git

3. Generate the pngs -- see step 6 under Method for instructions

3. Build the assets
		gulp

4. Start the server
		node index.js

5. View the experiments in your browser
		# Also, open -a "Firefox"; open -a "Chome"; open for your default browser
		open -a "Chromium" "http://localhost:3000"

6. Rebuild the changes
		gulp clean
		gulp

# Find out more
See the Redfin blog
