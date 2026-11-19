/** Shared analytics/consent shapes used by the consent store and the track API. */

export type ConsentCategory = "analytics" | "marketing";

export type ConsentState = {
	version: number;
	necessary: true; // always
	analytics: boolean;
	marketing: boolean;
	decided: boolean; // whether the user has made a choice
};

export type Listener = (s: ConsentState) => void;

export type ServerLegs = { ga: boolean; meta: boolean };
