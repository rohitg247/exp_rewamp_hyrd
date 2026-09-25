// src/utils/pin.js
//
// Engineering access PIN. Stored in localStorage, not sessionStorage: shutdown
// calls safeSessionStorage.clear(), and a changed PIN has to outlive that.
// On a panel without Web Storage safeLocalStorage falls back to memory, so the
// PIN reverts to the default on reload — the safe direction to fail.

import { safeLocalStorage } from './safeStorage';

const KEY = 'engPin';

export const DEFAULT_PIN = '1234';
export const PIN_LENGTH = 4;

export const getPin = () => safeLocalStorage.getItem(KEY) || DEFAULT_PIN;
export const setPin = (pin) => safeLocalStorage.setItem(KEY, pin);
export const isDefaultPin = () => getPin() === DEFAULT_PIN;
