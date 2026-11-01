import { ComponentStyles, MotionSpec, ThemeConfig } from "@miniforge/app-schema";
import React from "react";

/**
 * Resolves ComponentStyles into standard React CSSProperties
 */
export function resolveComponentStyles(
  styles?: ComponentStyles,
  theme?: ThemeConfig
): React.CSSProperties {
  if (!styles) return {};

  const styleObj: React.CSSProperties = {};

  if (styles.width) {
    styleObj.width = styles.width === "full" ? "100%" : styles.width === "auto" ? "auto" : styles.width;
  }
  if (styles.height) {
    styleObj.height = styles.height === "full" ? "100%" : styles.height === "auto" ? "auto" : styles.height;
  }
  if (styles.padding) styleObj.padding = styles.padding;
  if (styles.margin) styleObj.margin = styles.margin;
  if (styles.display) styleObj.display = styles.display;
  if (styles.flexDirection) styleObj.flexDirection = styles.flexDirection;
  if (styles.justifyContent) styleObj.justifyContent = styles.justifyContent;
  if (styles.alignItems) styleObj.alignItems = styles.alignItems;
  if (styles.gap) styleObj.gap = styles.gap;

  if (styles.backgroundColor) styleObj.backgroundColor = styles.backgroundColor;
  if (styles.backgroundGradient) styleObj.backgroundImage = styles.backgroundGradient;
  if (styles.textColor) styleObj.color = styles.textColor;
  if (styles.fontSize) styleObj.fontSize = styles.fontSize;
  if (styles.fontWeight) styleObj.fontWeight = styles.fontWeight;
  if (styles.textAlign) styleObj.textAlign = styles.textAlign;

  if (styles.borderColor) styleObj.borderColor = styles.borderColor;
  if (styles.borderWidth) styleObj.borderWidth = styles.borderWidth;
  if (styles.borderStyle) styleObj.borderStyle = styles.borderStyle;
  if (styles.borderRadius) {
    styleObj.borderRadius = styles.borderRadius;
  } else if (theme?.borderRadius) {
    styleObj.borderRadius = theme.borderRadius;
  }

  if (styles.boxShadow) {
    switch (styles.boxShadow) {
      case "subtle":
        styleObj.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)";
        break;
      case "medium":
        styleObj.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)";
        break;
      case "float":
        styleObj.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
        break;
      case "none":
        styleObj.boxShadow = "none";
        break;
    }
  }

  if (styles.opacity !== undefined) styleObj.opacity = styles.opacity;

  return styleObj;
}

/**
 * Returns inline animation styles corresponding to MotionSpec
 */
export function resolveMotionStyles(
  motion?: MotionSpec
): { style?: React.CSSProperties; className?: string } {
  if (!motion || !motion.preset || motion.preset === "none") {
    return {};
  }

  const durationMs = motion.duration || 350;
  const delayMs = motion.delay || 0;
  let timingFunction = "cubic-bezier(0.16, 1, 0.3, 1)"; // default smooth spring-like curve

  if (motion.easing === "linear") timingFunction = "linear";
  if (motion.easing === "ease-in") timingFunction = "ease-in";
  if (motion.easing === "ease-out") timingFunction = "ease-out";
  if (motion.easing === "ease-in-out") timingFunction = "ease-in-out";
  if (motion.easing === "spring") timingFunction = "cubic-bezier(0.34, 1.56, 0.64, 1)";

  const animationName = `mf-anim-${motion.preset}`;

  const style: React.CSSProperties = {
    animationName,
    animationDuration: `${durationMs}ms`,
    animationDelay: `${delayMs}ms`,
    animationTimingFunction: timingFunction,
    animationFillMode: "both",
  };

  return { style };
}

