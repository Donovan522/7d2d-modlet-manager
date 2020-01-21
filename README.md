# Welcome to the 7 Days to Die Modlet Manager

This project is intended for a few different audiences;

- Casual users who do not wish to have multiple game installation folders, but would like the ability to enable/disable installed modlets as required.
- Advanced users who would like to be able to keep all their modlets in one directory, and install/uninstall them into the game's mods folder as necessary.
- Modlet developers who would like to be able to validate their XML files against a chosen game directory.

## Installation

- Download and run the installer (coming soon!)
- Launch the app from wherever you normally run windows applications (i.e. the Start menu)
- The first time it runs, you'll be prompted to select your main "7 Days to Die" game folder. (Note: This must be a folder where the game's .exe is located).

## Usage

### Basic Mode

In this mode, you're asked to choose the main game folder and the utility will list all installed modlets therein. You may enable or disable them via a switch.

### Advanced Mode

In this mode, you're also given the option of choosing which modlets folder you wish to use. If you choose a modlet folder different than the game's Mods folder, you may install/uninstall modlets into the game's Mods folder.

You may also "validate" the modlet XMLs against the games XML files, and be notified if there are any errors trying to apply them. More information below.

#### Validating XMLs

When you validate XML files, the utility will attempt to apply the modlet files against the game's XML files. If there is a problem, it will tell you which lines failed to apply.

Note: If you choose "Validate XMLs" from the top button, it will attempt to apply _all_ the modlets, in order, against the game's XMLs and changes _ARE_ kept between files. Keep in mind that this may produce false failures when conflicting modlets both modify the same parts of the XML structure.

Selecting the checkbox for an individual modlet validates that modlet alone.

## Future

- User-defined "game profiles" which will save folder and modlet selection choices.
- Ability to change the "Load Order" for modlets, in case it's necessary to apply them in a particular order.
- Find/install/update modlets from the internet

Hang tight, more information will be coming soon!
