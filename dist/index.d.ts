import { FirebaseApp } from 'firebase/app';
import { Firestore, Bytes } from 'firebase/firestore';
import * as Y from 'yjs';
import { ObservableV2 } from 'lib0/observable';
import * as awarenessProtocol from 'y-protocols/awareness';
import SimplePeer from 'simple-peer-light';

interface Parameters$1 {
    firebaseApp: FirebaseApp;
    ydoc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    instanceConnection: ObservableV2<any>;
    documentPath: string;
    uid: string;
    peerUid: string;
    isCaller: boolean;
}
declare class WebRtc extends ObservableV2<any> {
    readonly doc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    instanceConnection: ObservableV2<any>;
    readonly documentPath: string;
    uid: string;
    peerUid: string;
    peer: SimplePeer.Instance;
    readonly db: Firestore;
    private unsubscribeHandshake?;
    isCaller: boolean;
    ice: {
        iceServers: {
            urls: string;
        }[];
    };
    peerKey: CryptoKey;
    connection: string;
    clock: string | number | NodeJS.Timeout;
    idleThreshold: number;
    constructor({ firebaseApp, ydoc, awareness, instanceConnection, documentPath, uid, peerUid, isCaller, }: Parameters$1);
    initPeer: () => void;
    startInitClock: () => void;
    createKey: () => Promise<void>;
    createPeer: (config: {
        initiator: boolean;
        config: {
            iceServers: {
                urls: string;
            }[];
        };
        trickle: boolean;
        channelName?: string;
    }) => void;
    callPeer: () => void;
    replyPeer: () => void;
    handshake: () => void;
    unsubHandshake: () => void;
    connect: (signal: SimplePeer.SignalData) => void;
    deleteSignals: () => void;
    handleOnConnected: () => void;
    handleOnClose: () => void;
    sendData: ({ message, data, }: {
        message: unknown;
        data: Uint8Array | null;
    }) => Promise<void>;
    handleReceivingData: (data: any) => Promise<void>;
    consoleHandler: (message: any, data?: any) => void;
    errorHandler: (error: any) => void;
    destroy(): Promise<void>;
}

interface Parameters {
    firebaseApp: FirebaseApp;
    ydoc: Y.Doc;
    path: string;
    docMapper?: (bytes: Bytes) => object;
    maxUpdatesThreshold?: number;
    maxWaitTime?: number;
    maxWaitFirestoreTime?: number;
}
interface PeersRTC {
    receivers: {
        [key: string]: WebRtc;
    };
    senders: {
        [key: string]: WebRtc;
    };
}
/**
 * FireProvider class that handles firestore data sync and awareness
 * based on webRTC.
 * @param firebaseApp Firestore instance
 * @param ydoc ydoc
 * @param path path to the firestore document (ex. collection/documentuid)
 * @param maxUpdatesThreshold maximum number of updates to wait for before sending updates to peers
 * @param maxWaitTime maximum miliseconds to wait before sending updates to peers
 * @param maxWaitFirestoreTime miliseconds to wait before syncing this client's update to firestore
 */
declare class FireProvider extends ObservableV2<any> {
    readonly doc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    readonly documentPath: string;
    readonly firebaseApp: FirebaseApp;
    readonly db: Firestore;
    uid: string;
    timeOffset: number;
    clients: string[];
    peersReceivers: Set<string>;
    peersSenders: Set<string>;
    peersRTC: PeersRTC;
    documentMapper: (bytes: Bytes) => object;
    cache: Uint8Array | null;
    maxCacheUpdates: number;
    cacheUpdateCount: number;
    cacheTimeout: string | number | NodeJS.Timeout;
    maxRTCWait: number;
    firestoreTimeout: string | number | NodeJS.Timeout;
    maxFirestoreWait: number;
    firebaseDataLastUpdatedAt: number;
    instanceConnection: ObservableV2<any>;
    recreateTimeout: string | number | NodeJS.Timeout;
    private unsubscribeData?;
    private unsubscribeMesh?;
    get clientTimeOffset(): number;
    ready: boolean;
    onReady: () => void;
    onDeleted: () => void;
    onSaving: (status: boolean) => void;
    init: () => Promise<void>;
    syncLocal: () => Promise<void>;
    saveToLocal: () => Promise<void>;
    deleteLocal: () => Promise<void>;
    initiateHandler: () => void;
    trackData: () => void;
    trackMesh: () => void;
    reconnect: () => void;
    trackConnections: () => Promise<void>;
    connectToPeers: (newPeers: string[], oldPeers: Set<string>, isCaller: boolean) => Set<any>;
    sendDataToPeers: ({ from, message, data, }: {
        from: unknown;
        message: unknown;
        data: Uint8Array | null;
    }) => void;
    saveToFirestore: () => Promise<void>;
    sendToFirestoreQueue: () => void;
    sendCache: (from: string) => void;
    sendToQueue: ({ from, update }: {
        from: unknown;
        update: Uint8Array;
    }) => void;
    updateHandler: (update: Uint8Array, origin: any) => void;
    awarenessUpdateHandler: ({ added, updated, removed, }: {
        added: number[];
        updated: number[];
        removed: number[];
    }, origin: unknown) => void;
    consoleHandler: (message: any, data?: any) => void;
    destroy: () => void;
    kill: (keepReadOnly?: boolean) => void;
    constructor({ firebaseApp, ydoc, path, docMapper, maxUpdatesThreshold, maxWaitTime, maxWaitFirestoreTime, }: Parameters);
}

export { FireProvider, type Parameters as FireProviderConfig };
