export interface paths {
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
