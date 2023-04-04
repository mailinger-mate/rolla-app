import { dayMs } from "./utils/datetime";

export const defaultCoordinates: [number, number] = [11.82, 102.48] // [11, 102]; // [11.82, 102.48]; // [10.439540, 58.15282]; // [50, 10]; // [11.82, 102.48]; 
export const defaultDiameter: number = 4;
// export const minRadius: number = 10e3;
// export const maxRadius: number = 10e6;

export const locationMinThreshold: number = 2 / 3;
export const locationMaxThreshold: number = 1 / 3;

export const locationDebounce: number = 300;
export const locationDecimals: number = 5;
export const locationStep: string = '' + 1 / Math.pow(10, locationDecimals);

export const latitudeLimit = 85;
export const longitudeLimit = 180;

export const h3GeohashRatio: number = 0.8;
export const h3AreaRatio: number = 1 / 5;
export const h3ResolutionMax: number = 9;
export const h3ResolutionLocation: number = 6;
export const h3MinDiameter: number = 8;
export const h3RingSize: number = 3;

export const mapEditZoom = 14;

export const serviceUuid: string = '5afe1eaf-f000-4ecb-ab75-f9ec2e1f1f10';
export const lockUuid: string = '0be70cad-92aa-48c3-b26a-330e339aa163';
export const otpUuid: string = 'e313b008-9fb4-4f5e-95a7-3dc5ee030543';
export const nonceUuid: string = 'b0446719-6abf-4eac-8f15-9f94062b0763';

export const toastDuration: number = 3000;
export const animationDelay: number = 500;

export const agentSkill: number = 5;
export const agentScan: number = 2000;
export const agentScanInterval: number = agentScan * 4;
export const agentSleepAfter: number = 20 * 1000;

export const storageExpiry: number = 30 * dayMs;

export const maxCompoundQueryArray: number = 10;
