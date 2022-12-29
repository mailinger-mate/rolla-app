import { dayMs } from "./utils/datetime";

export const defaultLocation = [50, 10]; // [11.82, 102.48]; 
export const defaultRadius = 30e3;
export const minRadius = 10e3;
export const maxRadius = 10e6;

export const serviceUuid = '5afe1eaf-f000-4ecb-ab75-f9ec2e1f1f10';
export const lockUuid = '0be70cad-92aa-48c3-b26a-330e339aa163';
export const otpUuid = 'e313b008-9fb4-4f5e-95a7-3dc5ee030543';
export const nonceUuid = 'b0446719-6abf-4eac-8f15-9f94062b0763';

export const toastDuration = 3000;
export const animationDelay = 500;

export const agentSkill = 5;
export const agentScan = 2000;
export const agentScanInterval = agentScan * 4;
export const agentSleepAfter = 20 * 1000;

export const storageExpiry = 30 * dayMs;