/** Owner-editable legal identity for public/legal surfaces (all optional). */
export type LegalIdentity = {
	operatorName: string;
	legalStatus: string;
	responsiblePublisher: string;
	address: string;
	email: string;
	phone: string;
	rcRnae: string;
	ice: string;
	taxIdIf: string;
	patente: string;
	cndpDeclarationNumber: string;
	dpoContact: string;
	hostName: string;
	hostAddress: string;
	hostContact: string;
};

export const LEGAL_IDENTITY_KEYS = [
	"operatorName",
	"legalStatus",
	"responsiblePublisher",
	"address",
	"email",
	"phone",
	"rcRnae",
	"ice",
	"taxIdIf",
	"patente",
	"cndpDeclarationNumber",
	"dpoContact",
	"hostName",
	"hostAddress",
	"hostContact",
] as const satisfies readonly (keyof LegalIdentity)[];

export const EMPTY_LEGAL_IDENTITY: LegalIdentity = {
	operatorName: "",
	legalStatus: "",
	responsiblePublisher: "",
	address: "",
	email: "",
	phone: "",
	rcRnae: "",
	ice: "",
	taxIdIf: "",
	patente: "",
	cndpDeclarationNumber: "",
	dpoContact: "",
	hostName: "",
	hostAddress: "",
	hostContact: "",
};

export const LEGAL_IDENTITY_SETTING_KEY = "site.legal";
