#!/bin/bash

printf '\e[8;45;65t'
clear

echo ""
echo "Application Fix Tool"
echo ""

parentPath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parentPath"

appPath=$( find "$parentPath" -name '*.app' -not -name '*Crack.app' -maxdepth 1)

if [[ -z "$appPath" ]]
then
    echo "Error: No application (.app file) found"
    echo "Please make sure the script and application are in the same folder"
    echo "Press any key to exit..."
    read -n 1
    exit 1
else
    appName=${appPath##*/}
    appBashName=${appName// /\ }
    appDIR="/Applications/${appBashName}"

    echo "Detected application: ${appBashName%.*}"
    echo ""

    if [ ! -d "$appDIR" ]; then
        echo "Notice: You haven't installed ${appBashName%.*}"
        echo "Please drag the application to your /Applications folder first"
    else
        echo "Fixing application permissions..."
        echo "Please enter your password (input will be hidden):"
        sudo spctl --master-disable
        sudo xattr -rd com.apple.quarantine "/Applications/$appBashName"
        echo ""
        echo "Success! You can now run ${appBashName%.*} normally."
    fi
fi

echo ""
echo "Operation complete. Press any key to exit..."
read -n 1
exit 0
