export interface paths {
    readonly "/api/v1/care-offers": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getCareOffersV1"];
        readonly put?: never;
        readonly post: operations["createCareOfferV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-offers/{careOfferId}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post?: never;
        readonly delete: operations["withdrawCareOfferV1"];
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-offers/{careOfferId}/claim": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["claimCareOfferV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-offers/{careOfferId}/pass": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["passCareOfferV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-requests": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getCareRequestsV1"];
        readonly put?: never;
        readonly post: operations["createCareRequestV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-requests/{careRequestId}/claim": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["claimCareRequestV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-requests/{careRequestId}/complete": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["completeCareRequestV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-requests/{careRequestId}/gratitude": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["recordCareGratitudeV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/care-requests/{careRequestId}/pass": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["passCareRequestV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["createConnectionPairingV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings/{token}": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get: operations["getConnectionPairingV1"];
        readonly put?: never;
        readonly post?: never;
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings/{token}/block": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["blockConnectionPairingV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings/{token}/cancel": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["cancelConnectionPairingV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings/{token}/confirm": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["confirmConnectionPairingV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/connection-pairings/{token}/resolve": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["resolveConnectionPairingV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
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
    readonly "/api/v1/curated-persons/{curatedPersonId}/block": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["blockCuratedPersonV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/curated-persons/{curatedPersonId}/end-connection": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["endConnectionV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
        readonly trace?: never;
    };
    readonly "/api/v1/curated-persons/{curatedPersonId}/unblock": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly get?: never;
        readonly put?: never;
        readonly post: operations["unblockCuratedPersonV1"];
        readonly delete?: never;
        readonly options?: never;
        readonly head?: never;
        readonly patch?: never;
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
    readonly "/api/v1/timeline-items": {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        /** List visible Timeline items */
        readonly get: operations["getTimelineItemsV1"];
        readonly put?: never;
        /** Create an ordinary Timeline post */
        readonly post: operations["createTimelinePostV1"];
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
    readonly getCareOffersV1: {
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
                            readonly offers: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly availableWhen: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                /** @enum {string} */
                                readonly direction: "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly giver: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                readonly handoffStyle: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                readonly mealDescription: string;
                                /** @enum {string} */
                                readonly offer: "A meal";
                                readonly status: "available" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createCareOfferV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly availableWhen: string;
                    readonly expiresIn: "1h" | "4h" | "1d" | "1w";
                    readonly handoffStyle: string;
                    readonly mealDescription: string;
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
                            readonly offers: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly availableWhen: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                /** @enum {string} */
                                readonly direction: "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly giver: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                readonly handoffStyle: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                readonly mealDescription: string;
                                /** @enum {string} */
                                readonly offer: "A meal";
                                readonly status: "available" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly withdrawCareOfferV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careOfferId: string;
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
                            readonly offers: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly availableWhen: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                /** @enum {string} */
                                readonly direction: "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly giver: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                readonly handoffStyle: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                readonly mealDescription: string;
                                /** @enum {string} */
                                readonly offer: "A meal";
                                readonly status: "available" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly claimCareOfferV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careOfferId: string;
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
                            readonly offers: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly availableWhen: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                /** @enum {string} */
                                readonly direction: "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly giver: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                readonly handoffStyle: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                readonly mealDescription: string;
                                /** @enum {string} */
                                readonly offer: "A meal";
                                readonly status: "available" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly passCareOfferV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careOfferId: string;
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
                            readonly offers: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly availableWhen: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                /** @enum {string} */
                                readonly direction: "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly giver: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                readonly handoffStyle: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                readonly mealDescription: string;
                                /** @enum {string} */
                                readonly offer: "A meal";
                                readonly status: "available" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getCareRequestsV1: {
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createCareRequestV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly expiresIn: "1h" | "4h" | "1d" | "1w";
                    readonly foodDoesNotWork: string;
                    readonly foodWorks: string;
                    readonly handoffStyle: string;
                    readonly helpfulWhen: string;
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly claimCareRequestV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careRequestId: string;
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly completeCareRequestV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careRequestId: string;
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly recordCareGratitudeV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careRequestId: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly message: string;
                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly passCareRequestV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly careRequestId: string;
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
                            readonly requests: readonly {
                                readonly audience: "Party" | "Tribe";
                                readonly claimant?: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly claimantCompletedAt?: string;
                                /** Format: date-time */
                                readonly claimedAt?: string;
                                /** Format: date-time */
                                readonly completedAt?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly direction: "receive" | "give";
                                /** Format: date-time */
                                readonly expiredAt?: string;
                                /** Format: date-time */
                                readonly expiresAt?: string;
                                readonly foodDoesNotWork: string;
                                readonly foodWorks: string;
                                readonly gratitude?: {
                                    /** Format: date-time */
                                    readonly createdAt: string;
                                    readonly message: string;
                                    readonly statementId: "meal-fed-when-needed" | "meal-care-felt-easy" | "meal-seen-and-supported";
                                };
                                readonly handoffStyle: string;
                                readonly helpfulWhen: string;
                                readonly id: string;
                                /** @enum {string} */
                                readonly kind: "meal";
                                /** @enum {string} */
                                readonly need: "A meal";
                                readonly requester: {
                                    readonly displayName: string;
                                    readonly personId: string;
                                };
                                /** Format: date-time */
                                readonly requesterCompletedAt?: string;
                                readonly status: "open" | "claimed" | "orphaned" | "completed" | "expired";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "ALREADY_CLAIMED" | "ALREADY_RECORDED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly curatedPersonId: string;
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
                            /** Format: date-time */
                            readonly expiresAt: string;
                            readonly signupCode: string;
                            /** @enum {string} */
                            readonly state: "pending";
                            readonly token: string;
                        } | {
                            /** @enum {string} */
                            readonly state: "already-connected";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER" | "SIGNUP_INVITATION_FAILED";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER" | "SIGNUP_INVITATION_FAILED";
                            readonly message: string;
                        };
                    };
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER" | "SIGNUP_INVITATION_FAILED";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly getConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly token: string;
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
                            /** Format: date-time */
                            readonly expiresAt: string;
                            readonly initiator: {
                                readonly displayName: string;
                            };
                            readonly initiatorConfirmed: boolean;
                            readonly receiver?: {
                                readonly displayName: string;
                            };
                            readonly receiverConfirmed: boolean;
                            readonly receiverResolved: boolean;
                            readonly state: "pending" | "completed" | "cancelled" | "superseded" | "expired";
                            readonly viewerPlacement?: "party" | "tribe" | "holding";
                            readonly viewerRole: "initiator" | "receiver" | "visitor";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly blockConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly token: string;
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
                        readonly data: null;
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly cancelConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly token: string;
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
                        readonly data: null;
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly confirmConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly token: string;
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
                            /** Format: date-time */
                            readonly expiresAt: string;
                            readonly initiator: {
                                readonly displayName: string;
                            };
                            readonly initiatorConfirmed: boolean;
                            readonly receiver?: {
                                readonly displayName: string;
                            };
                            readonly receiverConfirmed: boolean;
                            readonly receiverResolved: boolean;
                            readonly state: "pending" | "completed" | "cancelled" | "superseded" | "expired";
                            readonly viewerPlacement?: "party" | "tribe" | "holding";
                            readonly viewerRole: "initiator" | "receiver" | "visitor";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly resolveConnectionPairingV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly token: string;
            };
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly curatedPersonId: string;
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
                            /** Format: date-time */
                            readonly expiresAt: string;
                            readonly initiator: {
                                readonly displayName: string;
                            };
                            readonly initiatorConfirmed: boolean;
                            readonly receiver?: {
                                readonly displayName: string;
                            };
                            readonly receiverConfirmed: boolean;
                            readonly receiverResolved: boolean;
                            readonly state: "pending" | "completed" | "cancelled" | "superseded" | "expired";
                            readonly viewerPlacement?: "party" | "tribe" | "holding";
                            readonly viewerRole: "initiator" | "receiver" | "visitor";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "INACTIVE_PAIRING" | "NOT_PAIRING_PARTICIPANT" | "RECEIVER_RESOLUTION_REQUIRED" | "CHARACTER_LINKED_TO_ANOTHER_USER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                    readonly firstName: string;
                    readonly lastName: string;
                    readonly nickname: string;
                    readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                    readonly portraitUrl?: string;
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                    readonly firstName: string;
                    readonly lastName: string;
                    readonly nickname: string;
                    readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                    readonly portraitUrl?: string;
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly blockCuratedPersonV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path: {
                readonly curatedPersonId: string;
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
                            readonly changedPersonId: string | null;
                            readonly people: readonly {
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly endConnectionV1: {
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
                    readonly deleteCharacter: boolean;
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly unblockCuratedPersonV1: {
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
                    readonly blockedUserId: string;
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
                                readonly blockedUserId?: string;
                                /** Format: date-time */
                                readonly createdAt: string;
                                readonly firstName: string;
                                readonly id: string;
                                readonly lastName: string;
                                readonly linkedPersonId: string | null;
                                readonly linkedUserId: string | null;
                                readonly nickname: string;
                                readonly placement: "party" | "tribe" | "guild" | "signal" | "holding";
                                readonly portraitUrl?: string;
                                readonly privateDescription: string;
                                readonly relationshipShape: string;
                                readonly relationshipState: "character" | "connected" | "blocked";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly code: "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "HOLDING_FULL" | "PARTY_FULL" | "TRIBE_FULL" | "STALE_WRITE_CONFLICT" | "CONNECTED_CHARACTER";
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
                            readonly displayName: string;
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
                    readonly firstName: string;
                    readonly lastName: string;
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
    readonly getTimelineItemsV1: {
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
                            readonly timelineItems: readonly {
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
                            readonly code: "INVALID_REQUEST" | "UNAUTHORIZED" | "TIMELINE_POST_NOT_FOUND";
                            readonly message: string;
                        };
                    };
                };
            };
        };
    };
    readonly createTimelinePostV1: {
        readonly parameters: {
            readonly query?: never;
            readonly header?: never;
            readonly path?: never;
            readonly cookie?: never;
        };
        readonly requestBody: {
            readonly content: {
                readonly "application/json": {
                    readonly audience: "party" | "tribe";
                    readonly content: string;
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
                            readonly code: "INVALID_REQUEST" | "UNAUTHORIZED" | "TIMELINE_POST_NOT_FOUND";
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
                            readonly code: "INVALID_REQUEST" | "UNAUTHORIZED" | "TIMELINE_POST_NOT_FOUND";
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
                            readonly code: "INVALID_REQUEST" | "UNAUTHORIZED" | "TIMELINE_POST_NOT_FOUND";
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
