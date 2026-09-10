export interface paths {
    readonly "/api/v1/curated-persons": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getCuratedPersonsV1"];
        readonly put?: never;
        readonly post: operations["createCuratedPersonV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/curated-persons/{curatedPersonId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        readonly delete: operations["deleteCuratedPersonV1"];
        readonly options?: never;
        readonly head?: never;
        readonly patch: operations["updateCuratedPersonV1"];
        readonly trace?: never;
    };
    readonly "/api/v1/health": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** Check API health */
        readonly get: operations["getHealthV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/party": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getPartyV1"];
        readonly put?: never;
        readonly post: operations["addPartyMemberV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/party/{memberPersonId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        readonly delete: operations["removePartyMemberV1"];
        readonly options?: never;
        readonly head?: never;
        readonly patch: operations["updatePartyMemberV1"];
        readonly trace?: never;
    };
    readonly "/api/v1/party/reorder": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["reorderPartyV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/profiles/{personId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getProfileV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/profiles/current": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getCurrentProfileV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch: operations["updateCurrentProfileV1"];
        readonly trace?: never;
    };
    readonly "/api/v1/session": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getCurrentSessionV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/session/logout": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["logoutV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/signup": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["signupV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/signup-codes": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["createSignupCodeV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/timeline-items/{timelineItemId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** Get one Timeline item */
        readonly get: operations["getTimelineItemV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    readonly getCuratedPersonsV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly changedPersonId: string | null;
                            readonly people: readonly {
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly id: string;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                /** Format: date-time */
                                readonly updatedAt: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createCuratedPersonV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly nickname: string;
                    readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                    readonly privateDescription: string;
                    readonly relationshipShape: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly changedPersonId: string | null;
                            readonly people: readonly {
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly id: string;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                /** Format: date-time */
                                readonly updatedAt: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly deleteCuratedPersonV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly curatedPersonId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly expectedVersion: number;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly changedPersonId: string | null;
                            readonly people: readonly {
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly id: string;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                /** Format: date-time */
                                readonly updatedAt: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly updateCuratedPersonV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly curatedPersonId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly expectedVersion: number;
                    readonly nickname: string;
                    readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                    readonly privateDescription: string;
                    readonly relationshipShape: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly changedPersonId: string | null;
                            readonly people: readonly {
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly id: string;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                /** Format: date-time */
                                readonly updatedAt: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getHealthV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        /** @enum {string} */
                        readonly status: "ok";
                    };
                };
            };
        };
    };
    readonly getPartyV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly members: readonly {
                                readonly memberPersonId: string;
                                readonly position: number;
                                readonly privateNote: string;
                                readonly relationshipLabel: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly addPartyMemberV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly memberPersonId: string;
                    readonly privateNote: string;
                    readonly relationshipLabel: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly members: readonly {
                                readonly memberPersonId: string;
                                readonly position: number;
                                readonly privateNote: string;
                                readonly relationshipLabel: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly removePartyMemberV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly memberPersonId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly expectedVersion: number;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly members: readonly {
                                readonly memberPersonId: string;
                                readonly position: number;
                                readonly privateNote: string;
                                readonly relationshipLabel: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly updatePartyMemberV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly memberPersonId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly expectedVersion: number;
                    readonly privateNote: string;
                    readonly relationshipLabel: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly members: readonly {
                                readonly memberPersonId: string;
                                readonly position: number;
                                readonly privateNote: string;
                                readonly relationshipLabel: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly reorderPartyV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly members: readonly {
                        readonly expectedVersion: number;
                        readonly memberPersonId: string;
                    }[];
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly members: readonly {
                                readonly memberPersonId: string;
                                readonly position: number;
                                readonly privateNote: string;
                                readonly relationshipLabel: string;
                                readonly version: number;
                            }[];
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getProfileV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly personId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly profile: {
                                readonly displayName: string;
                                readonly personId: string;
                            };
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getCurrentProfileV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly profile: {
                                readonly displayName: string;
                                readonly personId: string;
                            };
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly updateCurrentProfileV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly displayName: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly profile: {
                                readonly displayName: string;
                                readonly personId: string;
                            };
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 409: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION_ERROR" | "DUPLICATE_MEMBER" | "PARTY_FULL" | "STALE_WRITE_CONFLICT";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getCurrentSessionV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly currentPersonId: string;
                            readonly role?: "admin" | "user";
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "UNAUTHORIZED";
                            /** @enum {string} */
                            readonly message: "A valid invited session is required.";
                        };
                    };
                };
            };
        };
    };
    readonly logoutV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 204: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "UNAUTHORIZED";
                            /** @enum {string} */
                            readonly message: "A valid invited session is required.";
                        };
                    };
                };
            };
        };
    };
    readonly signupV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly code: string;
                    readonly password: string;
                    readonly username: string;
                };
            };
        };
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": unknown;
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "SIGNUP_FAILED";
                            readonly message: string;
                        };
                    } | string;
                };
            };
            /** @description Default Response */
            readonly 500: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "SIGNUP_FAILED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createSignupCodeV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 201: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            readonly link: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 401: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "UNAUTHORIZED";
                            /** @enum {string} */
                            readonly message: "A valid invited session is required.";
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 403: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            /** @enum {string} */
                            readonly code: "FORBIDDEN";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getTimelineItemV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly timelineItemId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody?: never;
        readonly responses: {
            /** @description Default Response */
            readonly 200: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly data: {
                            /** TimelineItem */
                            readonly timelineItem: {
                                readonly actor: {
                                    readonly avatarUrl?: string;
                                    readonly displayName: string;
                                    readonly id: string;
                                    readonly initials?: string;
                                    readonly layer: "party" | "tribe" | "guild" | "signal";
                                };
                                readonly content: string;
                                readonly id: string;
                                /** Format: date-time */
                                readonly publishedAt: string;
                            };
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 400: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "INVALID_REQUEST" | "TIMELINE_ITEM_NOT_FOUND";
                            readonly message: string;
                        };
                    };
                };
            };
            /** @description Default Response */
            readonly 404: {
                headers: {
                    readonly [name: string]: unknown;
                };
                content: {
                    readonly "application/json": {
                        /** @enum {string} */
                        readonly apiVersion: "v1";
                        readonly error: {
                            readonly code: "INVALID_REQUEST" | "TIMELINE_ITEM_NOT_FOUND";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
}
