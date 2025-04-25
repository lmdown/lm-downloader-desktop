#!/bin/bash

printf '\e[8;45;65t'
clear

echo ""
echo "应用修复工具"
echo ""

parentPath=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parentPath"

appPath=$( find "$parentPath" -name '*.app' -maxdepth 1)

if [[ -z "$appPath" ]]
then
    echo "错误: 未找到应用程序(.app文件)"
    echo "请确保脚本和应用程序在同一个文件夹中"
    echo "按任意键退出..."
    read -n 1
    exit 1
else
    appName=${appPath##*/}
    appBashName=${appName// /\ }
    appDIR="/Applications/${appBashName}"

    echo "检测到应用程序: ${appBashName%.*}"
    echo ""

    if [ ! -d "$appDIR" ]; then
        echo "提示: 还未安装 ${appBashName%.*}"
        echo "请先将软件拖拽到【应用程序】目录"
    else
        echo "修复应用程序权限..."
        echo "请输入登录密码(输入时不会显示):"
        sudo spctl --master-disable
        sudo xattr -rd com.apple.quarantine "/Applications/$appBashName"
        echo ""
        echo "修复成功！可以正常运行 ${appBashName%.*} 了。"
    fi
fi

echo ""
echo "操作已完成，按任意键退出..."
read -n 1
exit 0
