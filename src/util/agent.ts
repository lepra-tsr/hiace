/*-----------------------------------------------------------------------------
 - Copyright (c) 2023.                                                        -
 - @tsrkzy/Github.                                                            -
 - tsrmix@gmail.com                                                           -
 - All rights reserved.                                                       -
 -----------------------------------------------------------------------------*/

/**
 * ブラウザがMacOSならtrueを返す
 */
export const isMacOS = (): boolean => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf("mac") > 0 && ua.indexOf("os") > 0;
};

/**
 * MouseEventを引数にとり、それが右クリックならtrueを返す
 * @param {MouseEvent} e
 */
export const isContextMenu = (e: MouseEvent): boolean => {
  return e.button === 2 || e.ctrlKey;
};
