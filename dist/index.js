import { onSnapshot, doc, collection, setDoc, Bytes, getFirestore, serverTimestamp, getDoc, deleteDoc, runTransaction, getDocs } from 'firebase/firestore';
import * as Y2 from 'yjs';
import { ObservableV2 } from 'lib0/observable';
import * as awarenessProtocol2 from 'y-protocols/awareness';
import { get, set, del } from 'idb-keyval';
import SimplePeer from 'simple-peer-light';

// src/provider.ts

// node_modules/lib0/math.js
var floor = Math.floor;
var min = (a, b) => a < b ? a : b;
var max = (a, b) => a > b ? a : b;

// node_modules/lib0/binary.js
var BIT8 = 128;
var BITS7 = 127;

// node_modules/lib0/number.js
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
var _encodeUtf8Polyfill = (str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */
    encodedString.codePointAt(i);
  }
  return buf;
};
var utf8TextEncoder = (
  /** @type {TextEncoder} */
  typeof TextEncoder !== "undefined" ? new TextEncoder() : null
);
var _encodeUtf8Native = (str) => utf8TextEncoder.encode(str);
var encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  utf8TextDecoder = null;
}

// node_modules/lib0/encoding.js
var Encoder = class {
  constructor() {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    this.bufs = [];
  }
};
var createEncoder = () => new Encoder();
var length = (encoder) => {
  let len = encoder.cpos;
  for (let i = 0; i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len;
};
var toUint8Array = (encoder) => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(new Uint8Array(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr;
};
var write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
};
var writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | BITS7 & num);
    num = floor(num / 128);
  }
  write(encoder, BITS7 & num);
};
var _strBuffer = new Uint8Array(3e4);
var _maxStrBSize = _strBuffer.length / 3;
var _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
};
var _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    write(
      encoder,
      /** @type {number} */
      encodedString.codePointAt(i)
    );
  }
};
var writeVarString = utf8TextEncoder && /** @type {any} */
utf8TextEncoder.encodeInto ? _writeVarStringNative : _writeVarStringPolyfill;
var writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
};
var writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
};

// node_modules/lib0/error.js
var create = (s) => new Error(s);

// node_modules/lib0/decoding.js
var errorUnexpectedEndOfArray = create("Unexpected end of array");
var errorIntegerOutOfRange = create("Integer out of Range");
var Decoder = class {
  /**
   * @param {Uint8Array} uint8Array Binary data to decode
   */
  constructor(uint8Array) {
    this.arr = uint8Array;
    this.pos = 0;
  }
};
var createDecoder = (uint8Array) => new Decoder(uint8Array);
var readUint8Array = (decoder, len) => {
  const view = new Uint8Array(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view;
};
var readVarUint8Array = (decoder) => readUint8Array(decoder, readVarUint(decoder));
var readUint8 = (decoder) => decoder.arr[decoder.pos++];
var readVarUint = (decoder) => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return num;
    }
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange;
    }
  }
  throw errorUnexpectedEndOfArray;
};
var _readVarStringPolyfill = (decoder) => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return "";
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder));
    if (--remainingLen < 100) {
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 1e4 ? remainingLen : 1e4;
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        encodedString += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          bytes
        );
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString));
  }
};
var _readVarStringNative = (decoder) => (
  /** @type any */
  utf8TextDecoder.decode(readVarUint8Array(decoder))
);
var readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;

// src/utils.ts
var initiateInstance = async (db, path) => {
  try {
    let uid;
    let offset;
    const instanceRef = doc(collection(db, `${path}/instances`));
    const firestoreTimestamp = serverTimestamp();
    const before = Date.now();
    await setDoc(instanceRef, { now: firestoreTimestamp });
    const after = Date.now();
    uid = instanceRef.id;
    const avg = Math.floor((before + after) / 2);
    const instanceDoc = await getDoc(doc(db, `${path}/instances/${uid}`));
    if (!instanceDoc.exists()) throw `instance not created`;
    const instanceData = instanceDoc.data();
    const serverTime = instanceData.now;
    offset = serverTime.seconds * 1e3 + Math.floor(serverTime.nanoseconds / 1e6) - avg;
    return { uid, offset };
  } catch (error) {
    throw error;
  }
};
var deleteInstance = async (db, path, uid) => {
  try {
    if (!uid) throw `instance id is empty`;
    await runTransaction(db, async (transaction) => {
      const ref = doc(db, `${path}/instances`, uid);
      const callsRef = collection(db, `${path}/instances/${uid}/calls`);
      const answersRef = collection(db, `${path}/instances/${uid}/answers`);
      const calls = await getDocs(callsRef);
      const answers = await getDocs(answersRef);
      calls.forEach((call) => {
        const callRef = doc(db, `${path}/instances/${uid}/calls/${call.id}`);
        transaction.delete(callRef);
      });
      answers.forEach((answer) => {
        const answerRef = doc(
          db,
          `${path}/instances/${uid}/answers/${answer.id}`
        );
        transaction.delete(answerRef);
      });
      transaction.delete(ref);
    });
  } catch (error) {
  }
};
var killZombie = async (db, path, uid, peerUid) => {
  try {
    const ref = doc(db, `${path}/instances`, uid);
    const instance = await getDoc(ref);
    if (instance.exists()) {
      deleteInstance(db, path, peerUid);
    }
  } catch (error) {
  }
};
var refreshPeers = (newPeers, oldPeers) => {
  const oldMinusNew = Array.from(oldPeers).filter(
    (item) => !newPeers.includes(item)
  );
  const noChange = Array.from(oldPeers).filter((x) => newPeers.includes(x));
  const newMinusOld = newPeers.filter((item) => !oldPeers.has(item));
  return {
    obselete: oldMinusNew,
    same: noChange,
    new: newMinusOld
  };
};
var Uint8ArrayToBase64 = async (buffer) => {
  const base64url = await new Promise((r) => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([buffer]));
  });
  const bas64 = base64url;
  return bas64.slice(bas64.indexOf(",") + 1);
};
var base64ToUint8Array = async (base64) => {
  var dataUrl = "data:application/octet-binary;base64," + base64;
  const uint8 = await fetch(dataUrl).then((res) => res.arrayBuffer()).then((buffer) => new Uint8Array(buffer));
  return uint8;
};
var generateKey = async (sender, receiver) => {
  const secretBuffer = encodeUtf8(sender).buffer;
  const salt = encodeUtf8(receiver).buffer;
  const key = await crypto.subtle.importKey("raw", secretBuffer, "PBKDF2", false, ["deriveKey"]).then(
    (keyMaterial) => crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 1e5,
        hash: "SHA-256"
      },
      keyMaterial,
      {
        name: "AES-GCM",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    )
  );
  return key;
};
var encryptData = async (message, key) => {
  try {
    const string = JSON.stringify(message);
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      data
    );
    const encryptedDataEncoder = createEncoder();
    writeVarString(encryptedDataEncoder, "AES-GCM");
    writeVarUint8Array(encryptedDataEncoder, iv);
    writeVarUint8Array(encryptedDataEncoder, new Uint8Array(cipher));
    return toUint8Array(encryptedDataEncoder);
  } catch (error) {
    return null;
  }
};
var decryptData = async (message, key) => {
  try {
    const dataDecoder = createDecoder(message);
    const algorithm = readVarString(dataDecoder);
    if (algorithm !== "AES-GCM") throw `Unknown algorithm`;
    const iv = readVarUint8Array(dataDecoder);
    const cipher = readVarUint8Array(dataDecoder);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv
      },
      key,
      cipher
    );
    const decoder = new TextDecoder();
    const data = decoder.decode(decrypted);
    const obj = JSON.parse(data);
    return obj;
  } catch (error) {
    return null;
  }
};
var WebRtc = class extends ObservableV2 {
  constructor({
    firebaseApp,
    ydoc,
    awareness,
    instanceConnection,
    documentPath,
    uid,
    peerUid,
    isCaller = false
  }) {
    super();
    this.ice = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    };
    this.connection = "connecting";
    this.idleThreshold = 2e4;
    this.initPeer = () => {
      this.createKey();
      if (this.isCaller) {
        this.callPeer();
      } else {
        this.replyPeer();
      }
      this.peer.on("data", this.handleReceivingData);
      this.handshake();
      this.peer.on("connect", this.handleOnConnected);
      this.peer.on("close", this.handleOnClose);
      this.startInitClock();
    };
    this.startInitClock = () => {
      if (this.clock) clearTimeout(this.clock);
      this.clock = setTimeout(() => {
        if (this.connection !== "connected") {
          killZombie(this.db, this.documentPath, this.uid, this.peerUid);
          this.handleOnClose();
        }
      }, this.idleThreshold);
    };
    this.createKey = async () => {
      this.peerKey = await generateKey(
        this.isCaller ? this.uid : this.peerUid,
        this.isCaller ? this.peerUid : this.uid
      );
      if (!this.peerKey) this.destroy();
    };
    this.createPeer = (config) => {
      this.peer = new SimplePeer(config);
    };
    this.callPeer = () => {
      this.createPeer({
        initiator: true,
        config: this.ice,
        trickle: false,
        channelName: `${this.documentPath}:${this.uid}_${this.peerUid}`
      });
      this.peer.on("signal", async (signal) => {
        try {
          const callRef = doc(
            this.db,
            `${this.documentPath}/instances/${this.peerUid}/calls`,
            this.uid
          );
          await setDoc(callRef, { signal });
          setTimeout(() => {
            deleteDoc(callRef);
          }, this.idleThreshold);
        } catch (error) {
          this.errorHandler(error);
        }
      });
    };
    this.replyPeer = () => {
      this.createPeer({
        initiator: false,
        config: this.ice,
        trickle: false
      });
      this.peer.on("signal", async (signal) => {
        try {
          const answerRef = doc(
            this.db,
            `${this.documentPath}/instances/${this.peerUid}/answers`,
            this.uid
          );
          await setDoc(answerRef, { signal });
          setTimeout(() => {
            deleteDoc(answerRef);
          }, this.idleThreshold);
        } catch (error) {
          this.errorHandler(error);
        }
      });
    };
    this.handshake = () => {
      this.unsubscribeHandshake = onSnapshot(
        doc(
          this.db,
          `${this.documentPath}/instances/${this.uid}/${this.isCaller ? "answers" : "calls"}/${this.peerUid}`
        ),
        // track own uid not peerUid
        (doc4) => {
          const docData = doc4.data();
          if (docData) {
            this.connect(docData.signal);
          }
        },
        (error) => {
        }
      );
    };
    this.unsubHandshake = () => {
      if (this.unsubscribeHandshake) {
        this.unsubscribeHandshake();
        delete this.unsubscribeHandshake;
      }
    };
    this.connect = (signal) => {
      try {
        this.unsubHandshake();
        if (this.peer) this.peer.signal(signal);
        this.deleteSignals();
      } catch (error) {
        this.errorHandler(error);
      }
    };
    this.deleteSignals = () => {
      try {
        let ref;
        if (this.isCaller) {
          ref = doc(
            this.db,
            `${this.documentPath}/instances/${this.peerUid}/calls`,
            this.uid
          );
        } else {
          ref = doc(
            this.db,
            `${this.documentPath}/instances/${this.peerUid}/answers`,
            this.uid
          );
        }
        deleteDoc(ref);
      } catch (error) {
      }
    };
    this.handleOnConnected = () => {
      this.connection = "connected";
      this.sendData({ message: "Hey!", data: null });
    };
    this.handleOnClose = () => {
      this.connection = "closed";
      this.instanceConnection.emit("closed", [true]);
      this.destroy();
    };
    this.sendData = async ({
      message,
      data
    }) => {
      const msg = {};
      msg.uid = this.uid;
      if (message) msg.message = message;
      if (data) {
        msg.data = await Uint8ArrayToBase64(data);
      }
      const encrypted = await encryptData(msg, this.peerKey);
      if (this.connection === "connected" && encrypted) this.peer.send(encrypted);
    };
    this.handleReceivingData = async (data) => {
      try {
        const decrypted = await decryptData(data, this.peerKey);
        if (decrypted) {
          if (decrypted.data) {
            decrypted.data = await base64ToUint8Array(decrypted.data);
          }
          if (decrypted.message === "awareness" && decrypted.data) {
            awarenessProtocol2.applyAwarenessUpdate(
              this.awareness,
              decrypted.data,
              decrypted.uid
            );
          } else if (!decrypted.message && decrypted.data) {
            Y2.applyUpdate(this.doc, decrypted.data, decrypted.uid);
          }
        }
      } catch (error) {
        this.errorHandler(error);
      }
    };
    this.consoleHandler = (message, data = null) => {
      console.log(
        "WebRTC",
        this.documentPath,
        `this client: ${this.uid}`,
        `peer client: ${this.peerUid}`,
        message,
        data
      );
    };
    this.errorHandler = (error) => {
      this.consoleHandler("Error", error);
    };
    this.doc = ydoc;
    this.awareness = awareness;
    this.instanceConnection = instanceConnection;
    this.documentPath = documentPath;
    this.uid = uid;
    this.peerUid = peerUid;
    this.db = getFirestore(firebaseApp);
    this.isCaller = isCaller;
    this.initPeer();
  }
  async destroy() {
    if (this.clock) clearTimeout(this.clock);
    if (this.peer) this.peer.destroy();
    this.unsubHandshake();
    this.deleteSignals();
    super.destroy();
  }
};

// src/graph.ts
var createGraph = (uids = [], connections = 3) => {
  const ids = uids.sort();
  const graph = {};
  for (let i = 0; i < ids.length; i++) {
    const nodes = ids.slice(
      connections * i + 1,
      connections * i + 1 + connections
    );
    if (nodes.length) graph[ids[i]] = nodes;
  }
  return graph;
};

// src/provider.ts
var FireProvider = class extends ObservableV2 {
  constructor({
    firebaseApp,
    ydoc,
    path,
    docMapper,
    maxUpdatesThreshold,
    maxWaitTime,
    maxWaitFirestoreTime
  }) {
    super();
    this.timeOffset = 0;
    // offset to server time in mili seconds
    this.clients = [];
    this.peersReceivers = /* @__PURE__ */ new Set([]);
    this.peersSenders = /* @__PURE__ */ new Set([]);
    this.peersRTC = {
      receivers: {},
      senders: {}
    };
    this.documentMapper = (bytes) => ({ content: bytes });
    this.maxCacheUpdates = 20;
    this.cacheUpdateCount = 0;
    this.maxRTCWait = 100;
    this.maxFirestoreWait = 3e3;
    this.firebaseDataLastUpdatedAt = (/* @__PURE__ */ new Date()).getTime();
    this.instanceConnection = new ObservableV2();
    this.ready = false;
    this.init = async () => {
      this.trackData();
      try {
        const data = await initiateInstance(this.db, this.documentPath);
        this.instanceConnection.on("closed", this.trackConnections);
        this.uid = data.uid;
        this.timeOffset = data.offset;
        this.initiateHandler();
        addEventListener("beforeunload", this.destroy);
      } catch (error) {
        this.consoleHandler("Could not connect to a peer network.");
        this.kill(true);
      }
    };
    this.syncLocal = async () => {
      try {
        const local = await get(this.documentPath);
        if (local) Y2.applyUpdate(this.doc, local, { key: "local-sync" });
      } catch (e) {
        this.consoleHandler("get local error", e);
      }
    };
    this.saveToLocal = async () => {
      try {
        const currentDoc = Y2.encodeStateAsUpdate(this.doc);
        set(this.documentPath, currentDoc);
      } catch (e) {
        this.consoleHandler("set local error", e);
      }
    };
    this.deleteLocal = async () => {
      try {
        del(this.documentPath);
      } catch (e) {
        this.consoleHandler("del local error", e);
      }
    };
    this.initiateHandler = () => {
      this.consoleHandler("FireProvider initiated!");
      this.awareness.on("update", this.awarenessUpdateHandler);
      this.trackMesh();
      this.doc.on("update", this.updateHandler);
      this.syncLocal();
    };
    this.trackData = () => {
      if (this.unsubscribeData) this.unsubscribeData();
      this.unsubscribeData = onSnapshot(
        doc(this.db, this.documentPath),
        (doc4) => {
          if (doc4.exists()) {
            const data = doc4.data();
            if (data && data.content) {
              this.firebaseDataLastUpdatedAt = (/* @__PURE__ */ new Date()).getTime();
              const content = data.content.toUint8Array();
              const origin = "origin:firebase/update";
              Y2.applyUpdate(this.doc, content, origin);
            }
            if (!this.ready) {
              if (this.onReady) {
                this.onReady();
                this.ready = true;
              }
            }
          }
        },
        (error) => {
          this.consoleHandler("Firestore sync error", error);
          if (error.code === "permission-denied") {
            if (this.onDeleted) this.onDeleted();
          }
        }
      );
    };
    this.trackMesh = () => {
      if (this.unsubscribeMesh) this.unsubscribeMesh();
      this.unsubscribeMesh = onSnapshot(
        collection(this.db, `${this.documentPath}/instances`),
        (snapshot) => {
          this.clients = [];
          snapshot.forEach((doc4) => {
            this.clients.push(doc4.id);
          });
          const mesh = createGraph(this.clients);
          const receivers = mesh[this.uid];
          const senders = Object.keys(mesh).filter(
            (v, i) => mesh[v] && mesh[v].length && mesh[v].includes(this.uid)
          );
          this.peersReceivers = this.connectToPeers(
            receivers,
            this.peersReceivers,
            true
          );
          this.peersSenders = this.connectToPeers(
            senders,
            this.peersSenders,
            false
          );
        },
        (error) => {
          this.consoleHandler("Creating peer mesh error", error);
        }
      );
    };
    this.reconnect = () => {
      if (this.recreateTimeout) clearTimeout(this.recreateTimeout);
      this.recreateTimeout = setTimeout(async () => {
        this.consoleHandler("triggering reconnect", this.uid);
        this.destroy();
        this.init();
      }, 200);
    };
    this.trackConnections = async () => {
      const clients = this.clients.length;
      let connected = 0;
      Object.values(this.peersRTC.receivers).forEach((receiver) => {
        if (receiver.connection !== "closed") connected++;
      });
      Object.values(this.peersRTC.senders).forEach((sender) => {
        if (sender.connection !== "closed") connected++;
      });
      if (clients > 1 && connected <= 0) {
        this.reconnect();
      }
    };
    this.connectToPeers = (newPeers, oldPeers, isCaller) => {
      if (!newPeers) return /* @__PURE__ */ new Set([]);
      const getNewPeers = refreshPeers(newPeers, oldPeers);
      const peersType = isCaller ? "receivers" : "senders";
      if (!this.peersRTC[peersType]) this.peersRTC[peersType] = {};
      if (getNewPeers.obselete && getNewPeers.obselete.length) {
        getNewPeers.obselete.forEach(async (peerUid) => {
          if (this.peersRTC[peersType][peerUid]) {
            await this.peersRTC[peersType][peerUid].destroy();
            delete this.peersRTC[peersType][peerUid];
          }
        });
      }
      if (getNewPeers.new && getNewPeers.new.length) {
        getNewPeers.new.forEach(async (peerUid) => {
          if (this.peersRTC[peersType][peerUid]) {
            await this.peersRTC[peersType][peerUid].destroy();
            delete this.peersRTC[peersType][peerUid];
          }
          this.peersRTC[peersType][peerUid] = new WebRtc({
            firebaseApp: this.firebaseApp,
            ydoc: this.doc,
            awareness: this.awareness,
            instanceConnection: this.instanceConnection,
            documentPath: this.documentPath,
            uid: this.uid,
            peerUid,
            isCaller
          });
        });
      }
      return new Set(newPeers);
    };
    this.sendDataToPeers = ({
      from,
      message,
      data
    }) => {
      if (this.peersRTC) {
        if (this.peersRTC.receivers) {
          Object.keys(this.peersRTC.receivers).forEach((receiver) => {
            if (receiver !== from) {
              const rtc = this.peersRTC.receivers[receiver];
              rtc.sendData({ message, data });
            }
          });
        }
        if (this.peersRTC.senders) {
          Object.keys(this.peersRTC.senders).forEach((sender) => {
            if (sender !== from) {
              const rtc = this.peersRTC.senders[sender];
              rtc.sendData({ message, data });
            }
          });
        }
      }
    };
    this.saveToFirestore = async () => {
      try {
        const ref = doc(this.db, this.documentPath);
        await setDoc(
          ref,
          this.documentMapper(
            Bytes.fromUint8Array(Y2.encodeStateAsUpdate(this.doc))
          ),
          { merge: true }
        );
        this.deleteLocal();
      } catch (error) {
        this.consoleHandler("error saving to firestore", error);
      } finally {
        if (this.onSaving) this.onSaving(false);
      }
    };
    this.sendToFirestoreQueue = () => {
      if (this.firestoreTimeout) clearTimeout(this.firestoreTimeout);
      if (this.onSaving) this.onSaving(true);
      this.firestoreTimeout = setTimeout(() => {
        if ((/* @__PURE__ */ new Date()).getTime() - this.firebaseDataLastUpdatedAt > this.maxFirestoreWait) {
          this.saveToFirestore();
        } else {
          this.sendToFirestoreQueue();
        }
      }, this.maxFirestoreWait);
    };
    this.sendCache = (from) => {
      this.sendDataToPeers({
        from,
        message: null,
        data: this.cache
      });
      this.cache = null;
      this.cacheUpdateCount = 0;
      this.sendToFirestoreQueue();
    };
    this.sendToQueue = ({ from, update }) => {
      if (from === this.uid) {
        if (this.cacheTimeout) clearTimeout(this.cacheTimeout);
        this.cache = this.cache ? Y2.mergeUpdates([this.cache, update]) : update;
        this.cacheUpdateCount++;
        if (this.cacheUpdateCount >= this.maxCacheUpdates) {
          this.sendCache(from);
        } else {
          this.cacheTimeout = setTimeout(() => {
            this.sendCache(from);
          }, this.maxRTCWait);
        }
      } else {
        this.sendDataToPeers({
          from,
          message: null,
          data: update
        });
      }
    };
    this.updateHandler = (update, origin) => {
      if (origin !== this.uid) {
        Y2.applyUpdate(this.doc, update, this.uid);
        this.sendToQueue({
          from: typeof origin === "string" ? origin : this.uid,
          update
        });
        this.saveToLocal();
      }
    };
    this.awarenessUpdateHandler = ({
      added,
      updated,
      removed
    }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      this.sendDataToPeers({
        from: origin !== "local" ? origin : this.uid,
        message: "awareness",
        data: awarenessProtocol2.encodeAwarenessUpdate(
          this.awareness,
          changedClients
        )
      });
    };
    this.consoleHandler = (message, data = null) => {
      console.log(
        "Provider:",
        this.documentPath,
        `this client: ${this.uid}`,
        message,
        data
      );
    };
    // use destroy directly if you don't need arguements
    // otherwise use kill
    this.destroy = () => {
      this.kill();
    };
    this.kill = (keepReadOnly = false) => {
      this.instanceConnection.destroy();
      removeEventListener("beforeunload", this.destroy);
      if (this.recreateTimeout) clearTimeout(this.recreateTimeout);
      if (this.cacheTimeout) clearTimeout(this.cacheTimeout);
      if (this.firestoreTimeout) clearTimeout(this.firestoreTimeout);
      this.doc.off("update", this.updateHandler);
      this.awareness.off("update", this.awarenessUpdateHandler);
      deleteInstance(this.db, this.documentPath, this.uid);
      if (this.unsubscribeData && !keepReadOnly) {
        this.unsubscribeData();
        delete this.unsubscribeData;
      }
      if (this.unsubscribeMesh) {
        this.unsubscribeMesh();
        delete this.unsubscribeMesh;
      }
      if (this.peersRTC) {
        if (this.peersRTC.receivers) {
          Object.values(this.peersRTC.receivers).forEach(
            (receiver) => receiver.destroy()
          );
        }
        if (this.peersRTC.senders) {
          Object.values(this.peersRTC.senders).forEach(
            (sender) => sender.destroy()
          );
        }
      }
      this.ready = false;
      super.destroy();
    };
    this.firebaseApp = firebaseApp;
    this.db = getFirestore(this.firebaseApp);
    this.doc = ydoc;
    this.documentPath = path;
    if (docMapper) this.documentMapper = docMapper;
    if (maxUpdatesThreshold) this.maxCacheUpdates = maxUpdatesThreshold;
    if (maxWaitTime) this.maxRTCWait = maxWaitTime;
    if (maxWaitFirestoreTime) this.maxFirestoreWait = maxWaitFirestoreTime;
    this.awareness = new awarenessProtocol2.Awareness(this.doc);
    this.init();
  }
  get clientTimeOffset() {
    return this.timeOffset;
  }
};

export { FireProvider };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map