import { Rectangle } from "@babylonjs/gui/2D/controls/rectangle";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Image } from "@babylonjs/gui/2D/controls/image";

const createButton = function (name, text, width, height, icon?: string, size: string = "md") {
    let result = new Button(name);
    result.width = width;
    result.height = height;
    applyTheme(result);

    if (icon) {
        const source = icon.includes("/") ? icon : "images/icons/" + icon + ".png";
        let image = new Image("img" + name, source);
        image.stretch = Image.STRETCH_UNIFORM;
        image.paddingLeftInPixels = 5;
        image.paddingRightInPixels = 5;
        image.paddingTopInPixels = 5;
        image.paddingBottomInPixels = 5;
        result.addControl(image);
    }

    let textBlock = new TextBlock(name + "_text", text);
    textBlock.width = 1;
    textBlock.textWrapping = true;
    textBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    textBlock.color = "white";
    textBlock.fontWeight = "bold";
    //textBlock.fontFamily = getFont();

    if (size === "md") {
        textBlock.fontSize = "14px";
    } else if (size === "sm") {
        textBlock.fontSize = "12px";
    } else if (size === "xs") {
        textBlock.fontSize = "10px";
    } else {
        textBlock.fontSize = "14px";
    }

    result.addControl(textBlock);
    return result;
};

const generatePanel = function (panelName: string = "Default Name", width = "300px", height = "400px", top = "0px", left = "0px") {
    let panel: Rectangle = new Rectangle("panel-" + panelName);
    panel.top = top;
    panel.left = left;
    panel.width = width;
    panel.height = height;
    //panel.fontFamily = getFont();
    applyTheme(panel);
    return panel;
};

const applyTheme = function (panel) {
    panel.thickness = 2;
    panel.cornerRadius = 8;
    panel.background = getBg();
    panel.color = "rgba(216,164,82,0.92)";
    panel.fontFamily = getFont();
};

const applyFont = function (p: Rectangle, size = "12px") {
    //p.fontFamily = getFont();
    p.fontSize = size;
};

const getFont = function () {
    return "Georgia, Cambria, serif";
};

const getBg = function () {
    return "rgba(9, 22, 24, .93)";
};

const getPadding = function (multiplier = 1) {
    return multiplier * 8;
};

const getSidebarWidth = function () {
    return 320;
};

export { applyFont, getBg, getPadding, generatePanel, applyTheme, createButton, getSidebarWidth };
