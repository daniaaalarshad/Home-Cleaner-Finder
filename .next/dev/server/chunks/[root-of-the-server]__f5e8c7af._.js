module.exports = [
"[project]/node_modules/cookie/index.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */ /**
 * Module exports.
 * @public
 */ exports.parse = parse;
exports.serialize = serialize;
/**
 * Module variables.
 * @private
 */ var __toString = Object.prototype.toString;
var __hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 */ var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 */ var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */ var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */ var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [opt]
 * @return {object}
 * @public
 */ function parse(str, opt) {
    if (typeof str !== 'string') {
        throw new TypeError('argument str must be a string');
    }
    var obj = {};
    var len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2) return obj;
    var dec = opt && opt.decode || decode;
    var index = 0;
    var eqIdx = 0;
    var endIdx = 0;
    do {
        eqIdx = str.indexOf('=', index);
        if (eqIdx === -1) break; // No more cookie pairs.
        endIdx = str.indexOf(';', index);
        if (endIdx === -1) {
            endIdx = len;
        } else if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(';', eqIdx - 1) + 1;
            continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        // only assign once
        if (!__hasOwnProperty.call(obj, key)) {
            var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            var valEndIdx = endIndex(str, endIdx, valStartIdx);
            if (str.charCodeAt(valStartIdx) === 0x22 /* " */  && str.charCodeAt(valEndIdx - 1) === 0x22 /* " */ ) {
                valStartIdx++;
                valEndIdx--;
            }
            var val = str.slice(valStartIdx, valEndIdx);
            obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
    }while (index < len)
    return obj;
}
function startIndex(str, index, max) {
    do {
        var code = str.charCodeAt(index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index;
    }while (++index < max)
    return max;
}
function endIndex(str, index, min) {
    while(index > min){
        var code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */  && code !== 0x09 /* \t */ ) return index + 1;
    }
    return min;
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [opt]
 * @return {string}
 * @public
 */ function serialize(name, val, opt) {
    var enc = opt && opt.encode || encodeURIComponent;
    if (typeof enc !== 'function') {
        throw new TypeError('option encode is invalid');
    }
    if (!cookieNameRegExp.test(name)) {
        throw new TypeError('argument name is invalid');
    }
    var value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError('argument val is invalid');
    }
    var str = name + '=' + value;
    if (!opt) return str;
    if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
            throw new TypeError('option maxAge is invalid');
        }
        str += '; Max-Age=' + maxAge;
    }
    if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
            throw new TypeError('option domain is invalid');
        }
        str += '; Domain=' + opt.domain;
    }
    if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
            throw new TypeError('option path is invalid');
        }
        str += '; Path=' + opt.path;
    }
    if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
            throw new TypeError('option expires is invalid');
        }
        str += '; Expires=' + expires.toUTCString();
    }
    if (opt.httpOnly) {
        str += '; HttpOnly';
    }
    if (opt.secure) {
        str += '; Secure';
    }
    if (opt.partitioned) {
        str += '; Partitioned';
    }
    if (opt.priority) {
        var priority = typeof opt.priority === 'string' ? opt.priority.toLowerCase() : opt.priority;
        switch(priority){
            case 'low':
                str += '; Priority=Low';
                break;
            case 'medium':
                str += '; Priority=Medium';
                break;
            case 'high':
                str += '; Priority=High';
                break;
            default:
                throw new TypeError('option priority is invalid');
        }
    }
    if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch(sameSite){
            case true:
                str += '; SameSite=Strict';
                break;
            case 'lax':
                str += '; SameSite=Lax';
                break;
            case 'strict':
                str += '; SameSite=Strict';
                break;
            case 'none':
                str += '; SameSite=None';
                break;
            default:
                throw new TypeError('option sameSite is invalid');
        }
    }
    return str;
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 *
 * @param {string} str
 * @returns {string}
 */ function decode(str) {
    return str.indexOf('%') !== -1 ? decodeURIComponent(str) : str;
}
/**
 * Determine if value is a Date.
 *
 * @param {*} val
 * @private
 */ function isDate(val) {
    return __toString.call(val) === '[object Date]';
}
/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */ function tryDecode(str, decode) {
    try {
        return decode(str);
    } catch (e) {
        return str;
    }
}
}),
"[project]/node_modules/iron-webcrypto/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "algorithms",
    ()=>algorithms,
    "base64urlDecode",
    ()=>base64urlDecode,
    "base64urlEncode",
    ()=>base64urlEncode,
    "bufferToString",
    ()=>bufferToString,
    "clone",
    ()=>clone,
    "decrypt",
    ()=>decrypt,
    "defaults",
    ()=>defaults,
    "encrypt",
    ()=>encrypt,
    "generateKey",
    ()=>generateKey,
    "hmacWithPassword",
    ()=>hmacWithPassword,
    "macFormatVersion",
    ()=>macFormatVersion,
    "macPrefix",
    ()=>macPrefix,
    "randomBits",
    ()=>randomBits,
    "seal",
    ()=>seal,
    "stringToBuffer",
    ()=>stringToBuffer,
    "unseal",
    ()=>unseal
]);
// src/utils.ts
var alphabetByEncoding = {};
var alphabetByValue = Array.from({
    length: 64
});
for(let i = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i + start <= limit; i++){
    const char = String.fromCharCode(i + start);
    alphabetByEncoding[char] = i;
    alphabetByValue[i] = char;
}
for(let i = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i + start <= limit; i++){
    const char = String.fromCharCode(i + start);
    const index = i + 26;
    alphabetByEncoding[char] = index;
    alphabetByValue[index] = char;
}
for(let i = 0; i < 10; i++){
    alphabetByEncoding[i.toString(10)] = i + 52;
    const char = i.toString(10);
    const index = i + 52;
    alphabetByEncoding[char] = index;
    alphabetByValue[index] = char;
}
alphabetByEncoding["-"] = 62;
alphabetByValue[62] = "-";
alphabetByEncoding["_"] = 63;
alphabetByValue[63] = "_";
var bitsPerLetter = 6;
var bitsPerByte = 8;
var maxLetterValue = 63;
var stringToBuffer = (value)=>{
    return new TextEncoder().encode(value);
};
var bufferToString = (value)=>{
    return new TextDecoder().decode(value);
};
var base64urlDecode = (_input)=>{
    const input = _input + "=".repeat((4 - _input.length % 4) % 4);
    let totalByteLength = input.length / 4 * 3;
    if (input.endsWith("==")) {
        totalByteLength -= 2;
    } else if (input.endsWith("=")) {
        totalByteLength--;
    }
    const out = new ArrayBuffer(totalByteLength);
    const dataView = new DataView(out);
    for(let i = 0; i < input.length; i += 4){
        let bits = 0;
        let bitLength = 0;
        for(let j = i, limit = i + 3; j <= limit; j++){
            if (input[j] === "=") {
                bits >>= bitsPerLetter;
            } else {
                if (!(input[j] in alphabetByEncoding)) {
                    throw new TypeError(`Invalid character ${input[j]} in base64 string.`);
                }
                bits |= alphabetByEncoding[input[j]] << (limit - j) * bitsPerLetter;
                bitLength += bitsPerLetter;
            }
        }
        const chunkOffset = i / 4 * 3;
        bits >>= bitLength % bitsPerByte;
        const byteLength = Math.floor(bitLength / bitsPerByte);
        for(let k = 0; k < byteLength; k++){
            const offset = (byteLength - k - 1) * bitsPerByte;
            dataView.setUint8(chunkOffset + k, (bits & 255 << offset) >> offset);
        }
    }
    return new Uint8Array(out);
};
var base64urlEncode = (_input)=>{
    const input = typeof _input === "string" ? stringToBuffer(_input) : _input;
    let str = "";
    for(let i = 0; i < input.length; i += 3){
        let bits = 0;
        let bitLength = 0;
        for(let j = i, limit = Math.min(i + 3, input.length); j < limit; j++){
            bits |= input[j] << (limit - j - 1) * bitsPerByte;
            bitLength += bitsPerByte;
        }
        const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
        bits <<= bitClusterCount * bitsPerLetter - bitLength;
        for(let k = 1; k <= bitClusterCount; k++){
            const offset = (bitClusterCount - k) * bitsPerLetter;
            str += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
        }
    }
    return str;
};
// src/index.ts
var defaults = {
    encryption: {
        saltBits: 256,
        algorithm: "aes-256-cbc",
        iterations: 1,
        minPasswordlength: 32
    },
    integrity: {
        saltBits: 256,
        algorithm: "sha256",
        iterations: 1,
        minPasswordlength: 32
    },
    ttl: 0,
    timestampSkewSec: 60,
    localtimeOffsetMsec: 0
};
var clone = (options)=>({
        ...options,
        encryption: {
            ...options.encryption
        },
        integrity: {
            ...options.integrity
        }
    });
var algorithms = {
    "aes-128-ctr": {
        keyBits: 128,
        ivBits: 128,
        name: "AES-CTR"
    },
    "aes-256-cbc": {
        keyBits: 256,
        ivBits: 128,
        name: "AES-CBC"
    },
    sha256: {
        keyBits: 256,
        name: "SHA-256"
    }
};
var macFormatVersion = "2";
var macPrefix = "Fe26.2";
var randomBytes = (_crypto, size)=>{
    const bytes = new Uint8Array(size);
    _crypto.getRandomValues(bytes);
    return bytes;
};
var randomBits = (_crypto, bits)=>{
    if (bits < 1) throw new Error("Invalid random bits count");
    const bytes = Math.ceil(bits / 8);
    return randomBytes(_crypto, bytes);
};
var pbkdf2 = async (_crypto, password, salt, iterations, keyLength, hash)=>{
    const passwordBuffer = stringToBuffer(password);
    const importedKey = await _crypto.subtle.importKey("raw", passwordBuffer, {
        name: "PBKDF2"
    }, false, [
        "deriveBits"
    ]);
    const saltBuffer = stringToBuffer(salt);
    const params = {
        name: "PBKDF2",
        hash,
        salt: saltBuffer,
        iterations
    };
    const derivation = await _crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
    return derivation;
};
var generateKey = async (_crypto, password, options)=>{
    var _a;
    if (!(password == null ? void 0 : password.length)) throw new Error("Empty password");
    if (options == null || typeof options !== "object") throw new Error("Bad options");
    if (!(options.algorithm in algorithms)) throw new Error(`Unknown algorithm: ${options.algorithm}`);
    const algorithm = algorithms[options.algorithm];
    const result = {};
    const hmac = (_a = options.hmac) != null ? _a : false;
    const id = hmac ? {
        name: "HMAC",
        hash: algorithm.name
    } : {
        name: algorithm.name
    };
    const usage = hmac ? [
        "sign",
        "verify"
    ] : [
        "encrypt",
        "decrypt"
    ];
    if (typeof password === "string") {
        if (password.length < options.minPasswordlength) throw new Error(`Password string too short (min ${options.minPasswordlength} characters required)`);
        let { salt = "" } = options;
        if (!salt) {
            const { saltBits = 0 } = options;
            if (!saltBits) throw new Error("Missing salt and saltBits options");
            const randomSalt = randomBits(_crypto, saltBits);
            salt = [
                ...new Uint8Array(randomSalt)
            ].map((x)=>x.toString(16).padStart(2, "0")).join("");
        }
        const derivedKey = await pbkdf2(_crypto, password, salt, options.iterations, algorithm.keyBits / 8, "SHA-1");
        const importedEncryptionKey = await _crypto.subtle.importKey("raw", derivedKey, id, false, usage);
        result.key = importedEncryptionKey;
        result.salt = salt;
    } else {
        if (password.length < algorithm.keyBits / 8) throw new Error("Key buffer (password) too small");
        result.key = await _crypto.subtle.importKey("raw", password, id, false, usage);
        result.salt = "";
    }
    if (options.iv) result.iv = options.iv;
    else if ("ivBits" in algorithm) result.iv = randomBits(_crypto, algorithm.ivBits);
    return result;
};
var getEncryptParams = (algorithm, key, data)=>{
    return [
        algorithm === "aes-128-ctr" ? {
            name: "AES-CTR",
            counter: key.iv,
            length: 128
        } : {
            name: "AES-CBC",
            iv: key.iv
        },
        key.key,
        typeof data === "string" ? stringToBuffer(data) : data
    ];
};
var encrypt = async (_crypto, password, options, data)=>{
    const key = await generateKey(_crypto, password, options);
    const encrypted = await _crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
    return {
        encrypted: new Uint8Array(encrypted),
        key
    };
};
var decrypt = async (_crypto, password, options, data)=>{
    const key = await generateKey(_crypto, password, options);
    const decrypted = await _crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
    return bufferToString(new Uint8Array(decrypted));
};
var hmacWithPassword = async (_crypto, password, options, data)=>{
    const key = await generateKey(_crypto, password, {
        ...options,
        hmac: true
    });
    const textBuffer = stringToBuffer(data);
    const signed = await _crypto.subtle.sign({
        name: "HMAC"
    }, key.key, textBuffer);
    const digest = base64urlEncode(new Uint8Array(signed));
    return {
        digest,
        salt: key.salt
    };
};
var normalizePassword = (password)=>{
    if (typeof password === "string" || password instanceof Uint8Array) return {
        encryption: password,
        integrity: password
    };
    if ("secret" in password) return {
        id: password.id,
        encryption: password.secret,
        integrity: password.secret
    };
    return {
        id: password.id,
        encryption: password.encryption,
        integrity: password.integrity
    };
};
var seal = async (_crypto, object, password, options)=>{
    if (!password) throw new Error("Empty password");
    const opts = clone(options);
    const now = Date.now() + (opts.localtimeOffsetMsec || 0);
    const objectString = JSON.stringify(object);
    const pass = normalizePassword(password);
    const { id = "", encryption, integrity } = pass;
    if (id && !/^\w+$/.test(id)) throw new Error("Invalid password id");
    const { encrypted, key } = await encrypt(_crypto, encryption, opts.encryption, objectString);
    const encryptedB64 = base64urlEncode(new Uint8Array(encrypted));
    const iv = base64urlEncode(key.iv);
    const expiration = opts.ttl ? now + opts.ttl : "";
    const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
    const mac = await hmacWithPassword(_crypto, integrity, opts.integrity, macBaseString);
    const sealed = `${macBaseString}*${mac.salt}*${mac.digest}`;
    return sealed;
};
var fixedTimeComparison = (a, b)=>{
    let mismatch = a.length === b.length ? 0 : 1;
    if (mismatch) b = a;
    for(let i = 0; i < a.length; i += 1)mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return mismatch === 0;
};
var unseal = async (_crypto, sealed, password, options)=>{
    if (!password) throw new Error("Empty password");
    const opts = clone(options);
    const now = Date.now() + (opts.localtimeOffsetMsec || 0);
    const parts = sealed.split("*");
    if (parts.length !== 8) throw new Error("Incorrect number of sealed components");
    const prefix = parts[0];
    let passwordId = parts[1];
    const encryptionSalt = parts[2];
    const encryptionIv = parts[3];
    const encryptedB64 = parts[4];
    const expiration = parts[5];
    const hmacSalt = parts[6];
    const hmac = parts[7];
    const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
    if (macPrefix !== prefix) throw new Error("Wrong mac prefix");
    if (expiration) {
        if (!/^\d+$/.test(expiration)) throw new Error("Invalid expiration");
        const exp = Number.parseInt(expiration, 10);
        if (exp <= now - opts.timestampSkewSec * 1e3) throw new Error("Expired seal");
    }
    let pass = "";
    passwordId = passwordId || "default";
    if (typeof password === "string" || password instanceof Uint8Array) pass = password;
    else if (passwordId in password) {
        pass = password[passwordId];
    } else {
        throw new Error(`Cannot find password: ${passwordId}`);
    }
    pass = normalizePassword(pass);
    const macOptions = opts.integrity;
    macOptions.salt = hmacSalt;
    const mac = await hmacWithPassword(_crypto, pass.integrity, macOptions, macBaseString);
    if (!fixedTimeComparison(mac.digest, hmac)) throw new Error("Bad hmac value");
    const encrypted = base64urlDecode(encryptedB64);
    const decryptOptions = opts.encryption;
    decryptOptions.salt = encryptionSalt;
    decryptOptions.iv = base64urlDecode(encryptionIv);
    const decrypted = await decrypt(_crypto, pass.encryption, decryptOptions, encrypted);
    if (decrypted) return JSON.parse(decrypted);
    return null;
};
;
}),
"[project]/node_modules/uncrypto/dist/crypto.node.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>_crypto,
    "getRandomValues",
    ()=>getRandomValues,
    "randomUUID",
    ()=>randomUUID,
    "subtle",
    ()=>subtle
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const subtle = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].webcrypto?.subtle || {};
const randomUUID = ()=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomUUID();
};
const getRandomValues = (array)=>{
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].webcrypto.getRandomValues(array);
};
const _crypto = {
    randomUUID,
    getRandomValues,
    subtle
};
;
}),
"[project]/node_modules/iron-session/dist/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getIronSession",
    ()=>getIronSession,
    "sealData",
    ()=>sealData,
    "unsealData",
    ()=>unsealData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cookie/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iron$2d$webcrypto$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/iron-webcrypto/dist/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uncrypto$2f$dist$2f$crypto$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/uncrypto/dist/crypto.node.mjs [app-route] (ecmascript)");
;
;
;
// src/core.ts
var timestampSkewSec = 60;
var fourteenDaysInSeconds = 14 * 24 * 3600;
var currentMajorVersion = 2;
var versionDelimiter = "~";
var defaultOptions = {
    ttl: fourteenDaysInSeconds,
    cookieOptions: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/"
    }
};
function normalizeStringPasswordToMap(password) {
    return typeof password === "string" ? {
        1: password
    } : password;
}
function parseSeal(seal) {
    const [sealWithoutVersion, tokenVersionAsString] = seal.split(versionDelimiter);
    const tokenVersion = tokenVersionAsString == null ? null : parseInt(tokenVersionAsString, 10);
    return {
        sealWithoutVersion,
        tokenVersion
    };
}
function computeCookieMaxAge(ttl) {
    if (ttl === 0) {
        return 2147483647;
    }
    return ttl - timestampSkewSec;
}
function getCookie(req, cookieName) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parse"])(("headers" in req && typeof req.headers.get === "function" ? req.headers.get("cookie") : req.headers.cookie) ?? "")[cookieName] ?? "";
}
function getServerActionCookie(cookieName, cookieHandler) {
    const cookieObject = cookieHandler.get(cookieName);
    const cookie = cookieObject?.value;
    if (typeof cookie === "string") {
        return cookie;
    }
    return "";
}
function setCookie(res, cookieValue) {
    if ("headers" in res && typeof res.headers.append === "function") {
        res.headers.append("set-cookie", cookieValue);
        return;
    }
    let existingSetCookie = res.getHeader("set-cookie") ?? [];
    if (!Array.isArray(existingSetCookie)) {
        existingSetCookie = [
            existingSetCookie.toString()
        ];
    }
    res.setHeader("set-cookie", [
        ...existingSetCookie,
        cookieValue
    ]);
}
function createSealData(_crypto) {
    return async function sealData2(data, { password, ttl = fourteenDaysInSeconds }) {
        const passwordsMap = normalizeStringPasswordToMap(password);
        const mostRecentPasswordId = Math.max(...Object.keys(passwordsMap).map(Number));
        const passwordForSeal = {
            id: mostRecentPasswordId.toString(),
            secret: passwordsMap[mostRecentPasswordId]
        };
        const seal$1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iron$2d$webcrypto$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["seal"])(_crypto, data, passwordForSeal, {
            ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iron$2d$webcrypto$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaults"],
            ttl: ttl * 1e3
        });
        return `${seal$1}${versionDelimiter}${currentMajorVersion}`;
    };
}
function createUnsealData(_crypto) {
    return async function unsealData2(seal, { password, ttl = fourteenDaysInSeconds }) {
        const passwordsMap = normalizeStringPasswordToMap(password);
        const { sealWithoutVersion, tokenVersion } = parseSeal(seal);
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iron$2d$webcrypto$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["unseal"])(_crypto, sealWithoutVersion, passwordsMap, {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$iron$2d$webcrypto$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["defaults"],
                ttl: ttl * 1e3
            }) ?? {};
            if (tokenVersion === 2) {
                return data;
            }
            return {
                ...data.persistent
            };
        } catch (error) {
            if (error instanceof Error && /^(Expired seal|Bad hmac value|Cannot find password|Incorrect number of sealed components)/.test(error.message)) {
                return {};
            }
            throw error;
        }
    };
}
function getSessionConfig(sessionOptions) {
    const options = {
        ...defaultOptions,
        ...sessionOptions,
        cookieOptions: {
            ...defaultOptions.cookieOptions,
            ...sessionOptions.cookieOptions || {}
        }
    };
    if (sessionOptions.cookieOptions && "maxAge" in sessionOptions.cookieOptions) {
        if (sessionOptions.cookieOptions.maxAge === void 0) {
            options.ttl = 0;
        }
    } else {
        options.cookieOptions.maxAge = computeCookieMaxAge(options.ttl);
    }
    return options;
}
var badUsageMessage = "iron-session: Bad usage: use getIronSession(req, res, options) or getIronSession(cookieStore, options).";
function createGetIronSession(sealData2, unsealData2) {
    return getIronSession2;
    //TURBOPACK unreachable
    ;
    async function getIronSession2(reqOrCookieStore, resOrsessionOptions, sessionOptions) {
        if (!reqOrCookieStore) {
            throw new Error(badUsageMessage);
        }
        if (!resOrsessionOptions) {
            throw new Error(badUsageMessage);
        }
        if (!sessionOptions) {
            return getIronSessionFromCookieStore(reqOrCookieStore, resOrsessionOptions, sealData2, unsealData2);
        }
        const req = reqOrCookieStore;
        const res = resOrsessionOptions;
        if (!sessionOptions) {
            throw new Error(badUsageMessage);
        }
        if (!sessionOptions.cookieName) {
            throw new Error("iron-session: Bad usage. Missing cookie name.");
        }
        if (!sessionOptions.password) {
            throw new Error("iron-session: Bad usage. Missing password.");
        }
        const passwordsMap = normalizeStringPasswordToMap(sessionOptions.password);
        if (Object.values(passwordsMap).some((password)=>password.length < 32)) {
            throw new Error("iron-session: Bad usage. Password must be at least 32 characters long.");
        }
        let sessionConfig = getSessionConfig(sessionOptions);
        const sealFromCookies = getCookie(req, sessionConfig.cookieName);
        const session = sealFromCookies ? await unsealData2(sealFromCookies, {
            password: passwordsMap,
            ttl: sessionConfig.ttl
        }) : {};
        Object.defineProperties(session, {
            updateConfig: {
                value: function updateConfig(newSessionOptions) {
                    sessionConfig = getSessionConfig(newSessionOptions);
                }
            },
            save: {
                value: async function save() {
                    if ("headersSent" in res && res.headersSent) {
                        throw new Error("iron-session: Cannot set session cookie: session.save() was called after headers were sent. Make sure to call it before any res.send() or res.end()");
                    }
                    const seal = await sealData2(session, {
                        password: passwordsMap,
                        ttl: sessionConfig.ttl
                    });
                    const cookieValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serialize"])(sessionConfig.cookieName, seal, sessionConfig.cookieOptions);
                    if (cookieValue.length > 4096) {
                        throw new Error(`iron-session: Cookie length is too big (${cookieValue.length} bytes), browsers will refuse it. Try to remove some data.`);
                    }
                    setCookie(res, cookieValue);
                }
            },
            destroy: {
                value: function destroy() {
                    Object.keys(session).forEach((key)=>{
                        delete session[key];
                    });
                    const cookieValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cookie$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serialize"])(sessionConfig.cookieName, "", {
                        ...sessionConfig.cookieOptions,
                        maxAge: 0
                    });
                    setCookie(res, cookieValue);
                }
            }
        });
        return session;
    }
}
async function getIronSessionFromCookieStore(cookieStore, sessionOptions, sealData2, unsealData2) {
    if (!sessionOptions.cookieName) {
        throw new Error("iron-session: Bad usage. Missing cookie name.");
    }
    if (!sessionOptions.password) {
        throw new Error("iron-session: Bad usage. Missing password.");
    }
    const passwordsMap = normalizeStringPasswordToMap(sessionOptions.password);
    if (Object.values(passwordsMap).some((password)=>password.length < 32)) {
        throw new Error("iron-session: Bad usage. Password must be at least 32 characters long.");
    }
    let sessionConfig = getSessionConfig(sessionOptions);
    const sealFromCookies = getServerActionCookie(sessionConfig.cookieName, cookieStore);
    const session = sealFromCookies ? await unsealData2(sealFromCookies, {
        password: passwordsMap,
        ttl: sessionConfig.ttl
    }) : {};
    Object.defineProperties(session, {
        updateConfig: {
            value: function updateConfig(newSessionOptions) {
                sessionConfig = getSessionConfig(newSessionOptions);
            }
        },
        save: {
            value: async function save() {
                const seal = await sealData2(session, {
                    password: passwordsMap,
                    ttl: sessionConfig.ttl
                });
                const cookieLength = sessionConfig.cookieName.length + seal.length + JSON.stringify(sessionConfig.cookieOptions).length;
                if (cookieLength > 4096) {
                    throw new Error(`iron-session: Cookie length is too big (${cookieLength} bytes), browsers will refuse it. Try to remove some data.`);
                }
                cookieStore.set(sessionConfig.cookieName, seal, sessionConfig.cookieOptions);
            }
        },
        destroy: {
            value: function destroy() {
                Object.keys(session).forEach((key)=>{
                    delete session[key];
                });
                const cookieOptions = {
                    ...sessionConfig.cookieOptions,
                    maxAge: 0
                };
                cookieStore.set(sessionConfig.cookieName, "", cookieOptions);
            }
        }
    });
    return session;
}
var sealData = createSealData(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uncrypto$2f$dist$2f$crypto$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__);
var unsealData = createUnsealData(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uncrypto$2f$dist$2f$crypto$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__);
var getIronSession = createGetIronSession(sealData, unsealData);
;
 //# sourceMappingURL=index.js.map
 //# sourceMappingURL=index.js.map
}),
"[project]/node_modules/postgres/src/query.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CLOSE",
    ()=>CLOSE,
    "Query",
    ()=>Query
]);
const originCache = new Map(), originStackCache = new Map(), originError = Symbol('OriginError');
const CLOSE = {};
class Query extends Promise {
    constructor(strings, args, handler, canceller, options = {}){
        let resolve, reject;
        super((a, b)=>{
            resolve = a;
            reject = b;
        });
        this.tagged = Array.isArray(strings.raw);
        this.strings = strings;
        this.args = args;
        this.handler = handler;
        this.canceller = canceller;
        this.options = options;
        this.state = null;
        this.statement = null;
        this.resolve = (x)=>(this.active = false, resolve(x));
        this.reject = (x)=>(this.active = false, reject(x));
        this.active = false;
        this.cancelled = null;
        this.executed = false;
        this.signature = '';
        this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
    }
    get origin() {
        return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || '';
    }
    static get [Symbol.species]() {
        return Promise;
    }
    cancel() {
        return this.canceller && (this.canceller(this), this.canceller = null);
    }
    simple() {
        this.options.simple = true;
        this.options.prepare = false;
        return this;
    }
    async readable() {
        this.simple();
        this.streaming = true;
        return this;
    }
    async writable() {
        this.simple();
        this.streaming = true;
        return this;
    }
    cursor(rows = 1, fn) {
        this.options.simple = false;
        if (typeof rows === 'function') {
            fn = rows;
            rows = 1;
        }
        this.cursorRows = rows;
        if (typeof fn === 'function') return this.cursorFn = fn, this;
        let prev;
        return {
            [Symbol.asyncIterator]: ()=>({
                    next: ()=>{
                        if (this.executed && !this.active) return {
                            done: true
                        };
                        prev && prev();
                        const promise = new Promise((resolve, reject)=>{
                            this.cursorFn = (value)=>{
                                resolve({
                                    value,
                                    done: false
                                });
                                return new Promise((r)=>prev = r);
                            };
                            this.resolve = ()=>(this.active = false, resolve({
                                    done: true
                                }));
                            this.reject = (x)=>(this.active = false, reject(x));
                        });
                        this.execute();
                        return promise;
                    },
                    return () {
                        prev && prev(CLOSE);
                        return {
                            done: true
                        };
                    }
                })
        };
    }
    describe() {
        this.options.simple = false;
        this.onlyDescribe = this.options.prepare = true;
        return this;
    }
    stream() {
        throw new Error('.stream has been renamed to .forEach');
    }
    forEach(fn) {
        this.forEachFn = fn;
        this.handle();
        return this;
    }
    raw() {
        this.isRaw = true;
        return this;
    }
    values() {
        this.isRaw = 'values';
        return this;
    }
    async handle() {
        !this.executed && (this.executed = true) && await 1 && this.handler(this);
    }
    execute() {
        this.handle();
        return this;
    }
    then() {
        this.handle();
        return super.then.apply(this, arguments);
    }
    catch() {
        this.handle();
        return super.catch.apply(this, arguments);
    }
    finally() {
        this.handle();
        return super.finally.apply(this, arguments);
    }
}
function cachedError(xs) {
    if (originCache.has(xs)) return originCache.get(xs);
    const x = Error.stackTraceLimit;
    Error.stackTraceLimit = 4;
    originCache.set(xs, new Error());
    Error.stackTraceLimit = x;
    return originCache.get(xs);
}
}),
"[project]/node_modules/postgres/src/errors.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Errors",
    ()=>Errors,
    "PostgresError",
    ()=>PostgresError
]);
class PostgresError extends Error {
    constructor(x){
        super(x.message);
        this.name = this.constructor.name;
        Object.assign(this, x);
    }
}
const Errors = {
    connection,
    postgres,
    generic,
    notSupported
};
function connection(x, options, socket) {
    const { host, port } = socket || options;
    const error = Object.assign(new Error('write ' + x + ' ' + (options.path || host + ':' + port)), {
        code: x,
        errno: x,
        address: options.path || host
    }, options.path ? {} : {
        port: port
    });
    Error.captureStackTrace(error, connection);
    return error;
}
function postgres(x) {
    const error = new PostgresError(x);
    Error.captureStackTrace(error, postgres);
    return error;
}
function generic(code, message) {
    const error = Object.assign(new Error(code + ': ' + message), {
        code
    });
    Error.captureStackTrace(error, generic);
    return error;
}
/* c8 ignore next 10 */ function notSupported(x) {
    const error = Object.assign(new Error(x + ' (B) is not supported'), {
        code: 'MESSAGE_NOT_SUPPORTED',
        name: x
    });
    Error.captureStackTrace(error, notSupported);
    return error;
}
}),
"[project]/node_modules/postgres/src/types.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Builder",
    ()=>Builder,
    "END",
    ()=>END,
    "Identifier",
    ()=>Identifier,
    "Parameter",
    ()=>Parameter,
    "arrayParser",
    ()=>arrayParser,
    "arraySerializer",
    ()=>arraySerializer,
    "camel",
    ()=>camel,
    "escapeIdentifier",
    ()=>escapeIdentifier,
    "fromCamel",
    ()=>fromCamel,
    "fromKebab",
    ()=>fromKebab,
    "fromPascal",
    ()=>fromPascal,
    "handleValue",
    ()=>handleValue,
    "inferType",
    ()=>inferType,
    "kebab",
    ()=>kebab,
    "mergeUserTypes",
    ()=>mergeUserTypes,
    "parsers",
    ()=>parsers,
    "pascal",
    ()=>pascal,
    "serializers",
    ()=>serializers,
    "stringify",
    ()=>stringify,
    "toCamel",
    ()=>toCamel,
    "toKebab",
    ()=>toKebab,
    "toPascal",
    ()=>toPascal,
    "types",
    ()=>types
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/query.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/errors.js [app-route] (ecmascript)");
;
;
const types = {
    string: {
        to: 25,
        from: null,
        serialize: (x)=>'' + x
    },
    number: {
        to: 0,
        from: [
            21,
            23,
            26,
            700,
            701
        ],
        serialize: (x)=>'' + x,
        parse: (x)=>+x
    },
    json: {
        to: 114,
        from: [
            114,
            3802
        ],
        serialize: (x)=>JSON.stringify(x),
        parse: (x)=>JSON.parse(x)
    },
    boolean: {
        to: 16,
        from: 16,
        serialize: (x)=>x === true ? 't' : 'f',
        parse: (x)=>x === 't'
    },
    date: {
        to: 1184,
        from: [
            1082,
            1114,
            1184
        ],
        serialize: (x)=>(x instanceof Date ? x : new Date(x)).toISOString(),
        parse: (x)=>new Date(x)
    },
    bytea: {
        to: 17,
        from: 17,
        serialize: (x)=>'\\x' + Buffer.from(x).toString('hex'),
        parse: (x)=>Buffer.from(x.slice(2), 'hex')
    }
};
class NotTagged {
    then() {
        notTagged();
    }
    catch() {
        notTagged();
    }
    finally() {
        notTagged();
    }
}
class Identifier extends NotTagged {
    constructor(value){
        super();
        this.value = escapeIdentifier(value);
    }
}
class Parameter extends NotTagged {
    constructor(value, type, array){
        super();
        this.value = value;
        this.type = type;
        this.array = array;
    }
}
class Builder extends NotTagged {
    constructor(first, rest){
        super();
        this.first = first;
        this.rest = rest;
    }
    build(before, parameters, types, options) {
        const keyword = builders.map(([x, fn])=>({
                fn,
                i: before.search(x)
            })).sort((a, b)=>a.i - b.i).pop();
        return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types, options);
    }
}
function handleValue(x, parameters, types, options) {
    let value = x instanceof Parameter ? x.value : x;
    if (value === undefined) {
        x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
        if (value === undefined) throw __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('UNDEFINED_VALUE', 'Undefined values are not allowed');
    }
    return '$' + types.push(x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x)));
}
const defaultHandlers = typeHandlers(types);
function stringify(q, string, value, parameters, types, options) {
    for(let i = 1; i < q.strings.length; i++){
        string += stringifyValue(string, value, parameters, types, options) + q.strings[i];
        value = q.args[i];
    }
    return string;
}
function stringifyValue(string, value, parameters, types, o) {
    return value instanceof Builder ? value.build(string, parameters, types, o) : value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"] ? fragment(value, parameters, types, o) : value instanceof Identifier ? value.value : value && value[0] instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"] ? value.reduce((acc, x)=>acc + ' ' + fragment(x, parameters, types, o), '') : handleValue(value, parameters, types, o);
}
function fragment(q, parameters, types, options) {
    q.fragment = true;
    return stringify(q, q.strings[0], q.args[0], parameters, types, options);
}
function valuesBuilder(first, parameters, types, columns, options) {
    return first.map((row)=>'(' + columns.map((column)=>stringifyValue('values', row[column], parameters, types, options)).join(',') + ')').join(',');
}
function values(first, rest, parameters, types, options) {
    const multi = Array.isArray(first[0]);
    const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
    return valuesBuilder(multi ? first : [
        first
    ], parameters, types, columns, options);
}
function select(first, rest, parameters, types, options) {
    typeof first === 'string' && (first = [
        first
    ].concat(rest));
    if (Array.isArray(first)) return escapeIdentifiers(first, options);
    let value;
    const columns = rest.length ? rest.flat() : Object.keys(first);
    return columns.map((x)=>{
        value = first[x];
        return (value instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"] ? fragment(value, parameters, types, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types, options)) + ' as ' + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
    }).join(',');
}
const builders = Object.entries({
    values,
    in: (...xs)=>{
        const x = values(...xs);
        return x === '()' ? '(null)' : x;
    },
    select,
    as: select,
    returning: select,
    '\\(': select,
    update (first, rest, parameters, types, options) {
        return (rest.length ? rest.flat() : Object.keys(first)).map((x)=>escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + '=' + stringifyValue('values', first[x], parameters, types, options));
    },
    insert (first, rest, parameters, types, options) {
        const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
        return '(' + escapeIdentifiers(columns, options) + ')values' + valuesBuilder(Array.isArray(first) ? first : [
            first
        ], parameters, types, columns, options);
    }
}).map(([x, fn])=>[
        new RegExp('((?:^|[\\s(])' + x + '(?:$|[\\s(]))(?![\\s\\S]*\\1)', 'i'),
        fn
    ]);
function notTagged() {
    throw __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('NOT_TAGGED_CALL', 'Query not called as a tagged template literal');
}
const serializers = defaultHandlers.serializers;
const parsers = defaultHandlers.parsers;
const END = {};
function firstIsString(x) {
    if (Array.isArray(x)) return firstIsString(x[0]);
    return typeof x === 'string' ? 1009 : 0;
}
const mergeUserTypes = function(types) {
    const user = typeHandlers(types || {});
    return {
        serializers: Object.assign({}, serializers, user.serializers),
        parsers: Object.assign({}, parsers, user.parsers)
    };
};
function typeHandlers(types) {
    return Object.keys(types).reduce((acc, k)=>{
        types[k].from && [].concat(types[k].from).forEach((x)=>acc.parsers[x] = types[k].parse);
        if (types[k].serialize) {
            acc.serializers[types[k].to] = types[k].serialize;
            types[k].from && [].concat(types[k].from).forEach((x)=>acc.serializers[x] = types[k].serialize);
        }
        return acc;
    }, {
        parsers: {},
        serializers: {}
    });
}
function escapeIdentifiers(xs, { transform: { column } }) {
    return xs.map((x)=>escapeIdentifier(column.to ? column.to(x) : x)).join(',');
}
const escapeIdentifier = function escape(str) {
    return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
};
const inferType = function inferType(x) {
    return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === 'bigint' ? 20 : Array.isArray(x) ? inferType(x[0]) : 0;
};
const escapeBackslash = /\\/g;
const escapeQuote = /"/g;
function arrayEscape(x) {
    return x.replace(escapeBackslash, '\\\\').replace(escapeQuote, '\\"');
}
const arraySerializer = function arraySerializer(xs, serializer, options, typarray) {
    if (Array.isArray(xs) === false) return xs;
    if (!xs.length) return '{}';
    const first = xs[0];
    // Only _box (1020) has the ';' delimiter for arrays, all other types use the ',' delimiter
    const delimiter = typarray === 1020 ? ';' : ',';
    if (Array.isArray(first) && !first.type) return '{' + xs.map((x)=>arraySerializer(x, serializer, options, typarray)).join(delimiter) + '}';
    return '{' + xs.map((x)=>{
        if (x === undefined) {
            x = options.transform.undefined;
            if (x === undefined) throw __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('UNDEFINED_VALUE', 'Undefined values are not allowed');
        }
        return x === null ? 'null' : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : '' + x) + '"';
    }).join(delimiter) + '}';
};
const arrayParserState = {
    i: 0,
    char: null,
    str: '',
    quoted: false,
    last: 0
};
const arrayParser = function arrayParser(x, parser, typarray) {
    arrayParserState.i = arrayParserState.last = 0;
    return arrayParserLoop(arrayParserState, x, parser, typarray);
};
function arrayParserLoop(s, x, parser, typarray) {
    const xs = [];
    // Only _box (1020) has the ';' delimiter for arrays, all other types use the ',' delimiter
    const delimiter = typarray === 1020 ? ';' : ',';
    for(; s.i < x.length; s.i++){
        s.char = x[s.i];
        if (s.quoted) {
            if (s.char === '\\') {
                s.str += x[++s.i];
            } else if (s.char === '"') {
                xs.push(parser ? parser(s.str) : s.str);
                s.str = '';
                s.quoted = x[s.i + 1] === '"';
                s.last = s.i + 2;
            } else {
                s.str += s.char;
            }
        } else if (s.char === '"') {
            s.quoted = true;
        } else if (s.char === '{') {
            s.last = ++s.i;
            xs.push(arrayParserLoop(s, x, parser, typarray));
        } else if (s.char === '}') {
            s.quoted = false;
            s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
            s.last = s.i + 1;
            break;
        } else if (s.char === delimiter && s.p !== '}' && s.p !== '"') {
            xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
            s.last = s.i + 1;
        }
        s.p = s.char;
    }
    s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
    return xs;
}
const toCamel = (x)=>{
    let str = x[0];
    for(let i = 1; i < x.length; i++)str += x[i] === '_' ? x[++i].toUpperCase() : x[i];
    return str;
};
const toPascal = (x)=>{
    let str = x[0].toUpperCase();
    for(let i = 1; i < x.length; i++)str += x[i] === '_' ? x[++i].toUpperCase() : x[i];
    return str;
};
const toKebab = (x)=>x.replace(/_/g, '-');
const fromCamel = (x)=>x.replace(/([A-Z])/g, '_$1').toLowerCase();
const fromPascal = (x)=>(x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, '_$1')).toLowerCase();
const fromKebab = (x)=>x.replace(/-/g, '_');
function createJsonTransform(fn) {
    return function jsonTransform(x, column) {
        return typeof x === 'object' && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x)=>jsonTransform(x, column)) : Object.entries(x).reduce((acc, [k, v])=>Object.assign(acc, {
                [fn(k)]: jsonTransform(v, column)
            }), {}) : x;
    };
}
toCamel.column = {
    from: toCamel
};
toCamel.value = {
    from: createJsonTransform(toCamel)
};
fromCamel.column = {
    to: fromCamel
};
const camel = {
    ...toCamel
};
camel.column.to = fromCamel;
toPascal.column = {
    from: toPascal
};
toPascal.value = {
    from: createJsonTransform(toPascal)
};
fromPascal.column = {
    to: fromPascal
};
const pascal = {
    ...toPascal
};
pascal.column.to = fromPascal;
toKebab.column = {
    from: toKebab
};
toKebab.value = {
    from: createJsonTransform(toKebab)
};
fromKebab.column = {
    to: fromKebab
};
const kebab = {
    ...toKebab
};
kebab.column.to = fromKebab;
}),
"[project]/node_modules/postgres/src/result.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Result
]);
class Result extends Array {
    constructor(){
        super();
        Object.defineProperties(this, {
            count: {
                value: null,
                writable: true
            },
            state: {
                value: null,
                writable: true
            },
            command: {
                value: null,
                writable: true
            },
            columns: {
                value: null,
                writable: true
            },
            statement: {
                value: null,
                writable: true
            }
        });
    }
    static get [Symbol.species]() {
        return Array;
    }
}
}),
"[project]/node_modules/postgres/src/queue.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const __TURBOPACK__default__export__ = Queue;
function Queue(initial = []) {
    let xs = initial.slice();
    let index = 0;
    return {
        get length () {
            return xs.length - index;
        },
        remove: (x)=>{
            const index = xs.indexOf(x);
            return index === -1 ? null : (xs.splice(index, 1), x);
        },
        push: (x)=>(xs.push(x), x),
        shift: ()=>{
            const out = xs[index++];
            if (index === xs.length) {
                index = 0;
                xs = [];
            } else {
                xs[index - 1] = undefined;
            }
            return out;
        }
    };
}
}),
"[project]/node_modules/postgres/src/bytes.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
const size = 256;
let buffer = Buffer.allocUnsafe(size);
const messages = 'BCcDdEFfHPpQSX'.split('').reduce((acc, x)=>{
    const v = x.charCodeAt(0);
    acc[x] = ()=>{
        buffer[0] = v;
        b.i = 5;
        return b;
    };
    return acc;
}, {});
const b = Object.assign(reset, messages, {
    N: String.fromCharCode(0),
    i: 0,
    inc (x) {
        b.i += x;
        return b;
    },
    str (x) {
        const length = Buffer.byteLength(x);
        fit(length);
        b.i += buffer.write(x, b.i, length, 'utf8');
        return b;
    },
    i16 (x) {
        fit(2);
        buffer.writeUInt16BE(x, b.i);
        b.i += 2;
        return b;
    },
    i32 (x, i) {
        if (i || i === 0) {
            buffer.writeUInt32BE(x, i);
            return b;
        }
        fit(4);
        buffer.writeUInt32BE(x, b.i);
        b.i += 4;
        return b;
    },
    z (x) {
        fit(x);
        buffer.fill(0, b.i, b.i + x);
        b.i += x;
        return b;
    },
    raw (x) {
        buffer = Buffer.concat([
            buffer.subarray(0, b.i),
            x
        ]);
        b.i = buffer.length;
        return b;
    },
    end (at = 1) {
        buffer.writeUInt32BE(b.i - at, at);
        const out = buffer.subarray(0, b.i);
        b.i = 0;
        buffer = Buffer.allocUnsafe(size);
        return out;
    }
});
const __TURBOPACK__default__export__ = b;
function fit(x) {
    if (buffer.length - b.i < x) {
        const prev = buffer, length = prev.length;
        buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
        prev.copy(buffer);
    }
}
function reset() {
    b.i = 0;
    return b;
}
}),
"[project]/node_modules/postgres/src/connection.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/net [external] (net, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$tls__$5b$external$5d$__$28$tls$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/tls [external] (tls, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$perf_hooks__$5b$external$5d$__$28$perf_hooks$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/perf_hooks [external] (perf_hooks, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/errors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$result$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/result.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/queue.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/query.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/bytes.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const __TURBOPACK__default__export__ = Connection;
let uid = 1;
const Sync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().S().end(), Flush = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().H().end(), SSLRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().i32(8).i32(80877103).end(8), ExecuteUnnamed = Buffer.concat([
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().E().str(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).i32(0).end(),
    Sync
]), DescribeUnnamed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().D().str('S').str(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end(), noop = ()=>{};
const retryRoutines = new Set([
    'FetchPreparedStatement',
    'RevalidateCachedQuery',
    'transformAssignedExpr'
]);
const errorFields = {
    83: 'severity_local',
    86: 'severity',
    67: 'code',
    77: 'message',
    68: 'detail',
    72: 'hint',
    80: 'position',
    112: 'internal_position',
    113: 'internal_query',
    87: 'where',
    115: 'schema_name',
    116: 'table_name',
    99: 'column_name',
    100: 'data type_name',
    110: 'constraint_name',
    70: 'file',
    76: 'line',
    82: 'routine' // R
};
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
    const { sslnegotiation, ssl, max, user, host, port, database, parsers, transform, onnotice, onnotify, onparameter, max_pipeline, keep_alive, backoff, target_session_attrs } = options;
    const sent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), id = uid++, backend = {
        pid: null,
        secret: null
    }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
    let socket = null, cancelMessage, errorResponse = null, result = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$result$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
    const connection = {
        queue: queues.closed,
        idleTimer,
        connect (query) {
            initial = query;
            reconnect();
        },
        terminate,
        execute,
        cancel,
        end,
        count: 0,
        id
    };
    queues.closed && queues.closed.push(connection);
    return connection;
    //TURBOPACK unreachable
    ;
    async function createSocket() {
        let x;
        try {
            x = options.socket ? await Promise.resolve(options.socket(options)) : new __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].Socket();
        } catch (e) {
            error(e);
            return;
        }
        x.on('error', error);
        x.on('close', closed);
        x.on('drain', drain);
        return x;
    }
    async function cancel({ pid, secret }, resolve, reject) {
        try {
            cancelMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
            await connect();
            socket.once('error', reject);
            socket.once('close', resolve);
        } catch (error) {
            reject(error);
        }
    }
    function execute(q) {
        if (terminated) return queryError(q, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_DESTROYED', options));
        if (stream) return queryError(q, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('COPY_IN_PROGRESS', 'You cannot execute queries during copy'));
        if (q.cancelled) return;
        try {
            q.state = backend;
            query ? sent.push(q) : (query = q, query.active = true);
            build(q);
            return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection));
        } catch (error) {
            sent.length === 0 && write(Sync);
            errored(error);
            return true;
        }
    }
    function toBuffer(q) {
        if (q.parameters.length >= 65534) throw __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('MAX_PARAMETERS_EXCEEDED', 'Max number of parameters (65534) exceeded');
        return q.options.simple ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().Q().str(q.statement.string + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end() : q.describeFirst ? Buffer.concat([
            describe(q),
            Flush
        ]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([
            describe(q),
            prepared(q)
        ]) : unnamed(q);
    }
    function describe(q) {
        return Buffer.concat([
            Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
            Describe('S', q.statement.name)
        ]);
    }
    function prepared(q) {
        return Buffer.concat([
            Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
            q.cursorFn ? Execute('', q.cursorRows) : ExecuteUnnamed
        ]);
    }
    function unnamed(q) {
        return Buffer.concat([
            Parse(q.statement.string, q.parameters, q.statement.types),
            DescribeUnnamed,
            prepared(q)
        ]);
    }
    function build(q) {
        const parameters = [], types = [];
        const string = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stringify"])(q, q.strings[0], q.args[0], parameters, types, options);
        !q.tagged && q.args.forEach((x)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handleValue"])(x, parameters, types, options));
        q.prepare = options.prepare && ('prepare' in q.options ? q.options.prepare : true);
        q.string = string;
        q.signature = q.prepare && types + string;
        q.onlyDescribe && delete statements[q.signature];
        q.parameters = q.parameters || parameters;
        q.prepared = q.prepare && q.signature in statements;
        q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
        q.statement = q.prepared ? statements[q.signature] : {
            string,
            types,
            name: q.prepare ? statementId + statementCount++ : ''
        };
        typeof options.debug === 'function' && options.debug(id, string, parameters, types);
    }
    function write(x, fn) {
        chunk = chunk ? Buffer.concat([
            chunk,
            x
        ]) : Buffer.from(x);
        if (fn || chunk.length >= 1024) return nextWrite(fn);
        nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
        return true;
    }
    function nextWrite(fn) {
        const x = socket.write(chunk, fn);
        nextWriteTimer !== null && clearImmediate(nextWriteTimer);
        chunk = nextWriteTimer = null;
        return x;
    }
    function connectTimedOut() {
        errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECT_TIMEOUT', options, socket));
        socket.destroy();
    }
    async function secure() {
        if (sslnegotiation !== 'direct') {
            write(SSLRequest);
            const canSSL = await new Promise((r)=>socket.once('data', (x)=>r(x[0] === 83))) // S
            ;
            if (!canSSL && ssl === 'prefer') return connected();
        }
        const options = {
            socket,
            servername: __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].isIP(socket.host) ? undefined : socket.host
        };
        if (sslnegotiation === 'direct') options.ALPNProtocols = [
            'postgresql'
        ];
        if (ssl === 'require' || ssl === 'allow' || ssl === 'prefer') options.rejectUnauthorized = false;
        else if (typeof ssl === 'object') Object.assign(options, ssl);
        socket.removeAllListeners();
        socket = __TURBOPACK__imported__module__$5b$externals$5d2f$tls__$5b$external$5d$__$28$tls$2c$__cjs$29$__["default"].connect(options);
        socket.on('secureConnect', connected);
        socket.on('error', error);
        socket.on('close', closed);
        socket.on('drain', drain);
    }
    /* c8 ignore next 3 */ function drain() {
        !query && onopen(connection);
    }
    function data(x) {
        if (incomings) {
            incomings.push(x);
            remaining -= x.length;
            if (remaining > 0) return;
        }
        incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([
            incoming,
            x
        ], incoming.length + x.length);
        while(incoming.length > 4){
            length = incoming.readUInt32BE(1);
            if (length >= incoming.length) {
                remaining = length - incoming.length;
                incomings = [
                    incoming
                ];
                break;
            }
            try {
                handle(incoming.subarray(0, length + 1));
            } catch (e) {
                query && (query.cursorFn || query.describeFirst) && write(Sync);
                errored(e);
            }
            incoming = incoming.subarray(length + 1);
            remaining = 0;
            incomings = null;
        }
    }
    async function connect() {
        terminated = false;
        backendParameters = {};
        socket || (socket = await createSocket());
        if (!socket) return;
        connectTimer.start();
        if (options.socket) return ssl ? secure() : connected();
        socket.on('connect', ssl ? secure : connected);
        if (options.path) return socket.connect(options.path);
        socket.ssl = ssl;
        socket.connect(port[hostIndex], host[hostIndex]);
        socket.host = host[hostIndex];
        socket.port = port[hostIndex];
        hostIndex = (hostIndex + 1) % port.length;
    }
    function reconnect() {
        setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - __TURBOPACK__imported__module__$5b$externals$5d2f$perf_hooks__$5b$external$5d$__$28$perf_hooks$2c$__cjs$29$__["performance"].now()) : 0);
    }
    function connected() {
        try {
            statements = {};
            needsTypes = options.fetch_types;
            statementId = Math.random().toString(36).slice(2);
            statementCount = 1;
            lifeTimer.start();
            socket.on('data', data);
            keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1000 * keep_alive);
            const s = StartupMessage();
            write(s);
        } catch (err) {
            error(err);
        }
    }
    function error(err) {
        if (connection.queue === queues.connecting && options.host[retries + 1]) return;
        errored(err);
        while(sent.length)queryError(sent.shift(), err);
    }
    function errored(err) {
        stream && (stream.destroy(err), stream = null);
        query && queryError(query, err);
        initial && (queryError(initial, err), initial = null);
    }
    function queryError(query, err) {
        if (query.reserve) return query.reject(err);
        if (!err || typeof err !== 'object') err = new Error(err);
        'query' in err || 'parameters' in err || Object.defineProperties(err, {
            stack: {
                value: err.stack + query.origin.replace(/.*\n/, '\n'),
                enumerable: options.debug
            },
            query: {
                value: query.string,
                enumerable: options.debug
            },
            parameters: {
                value: query.parameters,
                enumerable: options.debug
            },
            args: {
                value: query.args,
                enumerable: options.debug
            },
            types: {
                value: query.statement && query.statement.types,
                enumerable: options.debug
            }
        });
        query.reject(err);
    }
    function end() {
        return ending || (!connection.reserved && onend(connection), !connection.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r)=>socket && socket.readyState !== 'closed' ? socket.once('close', r) : r())) : ending = new Promise((r)=>ended = r));
    }
    function terminate() {
        terminated = true;
        if (stream || query || initial || sent.length) error(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_DESTROYED', options));
        clearImmediate(nextWriteTimer);
        if (socket) {
            socket.removeListener('data', data);
            socket.removeListener('connect', connected);
            socket.readyState === 'open' && socket.end((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().X().end());
        }
        ended && (ended(), ending = ended = null);
    }
    async function closed(hadError) {
        incoming = Buffer.alloc(0);
        remaining = 0;
        incomings = null;
        clearImmediate(nextWriteTimer);
        socket.removeListener('data', data);
        socket.removeListener('connect', connected);
        idleTimer.cancel();
        lifeTimer.cancel();
        connectTimer.cancel();
        socket.removeAllListeners();
        socket = null;
        if (initial) return reconnect();
        !hadError && (query || sent.length) && error(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_CLOSED', options, socket));
        closedTime = __TURBOPACK__imported__module__$5b$externals$5d2f$perf_hooks__$5b$external$5d$__$28$perf_hooks$2c$__cjs$29$__["performance"].now();
        hadError && options.shared.retries++;
        delay = (typeof backoff === 'function' ? backoff(options.shared.retries) : backoff) * 1000;
        onclose(connection, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_CLOSED', options, socket));
    }
    /* Handlers */ function handle(xs, x = xs[0]) {
        (x === 68 ? DataRow : x === 100 ? CopyData : x === 65 ? NotificationResponse : x === 83 ? ParameterStatus : x === 90 ? ReadyForQuery : x === 67 ? CommandComplete : x === 50 ? BindComplete : x === 49 ? ParseComplete : x === 116 ? ParameterDescription : x === 84 ? RowDescription : x === 82 ? Authentication : x === 110 ? NoData : x === 75 ? BackendKeyData : x === 69 ? ErrorResponse : x === 115 ? PortalSuspended : x === 51 ? CloseComplete : x === 71 ? CopyInResponse : x === 78 ? NoticeResponse : x === 72 ? CopyOutResponse : x === 99 ? CopyDone : x === 73 ? EmptyQueryResponse : x === 86 ? FunctionCallResponse : x === 118 ? NegotiateProtocolVersion : x === 87 ? CopyBothResponse : /* c8 ignore next */ UnknownMessage)(xs);
    }
    function DataRow(x) {
        let index = 7;
        let length;
        let column;
        let value;
        const row = query.isRaw ? new Array(query.statement.columns.length) : {};
        for(let i = 0; i < query.statement.columns.length; i++){
            column = query.statement.columns[i];
            length = x.readInt32BE(index);
            index += 4;
            value = length === -1 ? null : query.isRaw === true ? x.subarray(index, index += length) : column.parser === undefined ? x.toString('utf8', index, index += length) : column.parser.array === true ? column.parser(x.toString('utf8', index + 1, index += length)) : column.parser(x.toString('utf8', index, index += length));
            query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
        }
        query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
    }
    function ParameterStatus(x) {
        const [k, v] = x.toString('utf8', 5, x.length - 1).split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N);
        backendParameters[k] = v;
        if (options.parameters[k] !== v) {
            options.parameters[k] = v;
            onparameter && onparameter(k, v);
        }
    }
    function ReadyForQuery(x) {
        if (query) {
            if (errorResponse) {
                query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse.routine) ? retry(query, errorResponse) : errored(errorResponse);
            } else {
                query.resolve(results || result);
            }
        } else if (errorResponse) {
            errored(errorResponse);
        }
        query = results = errorResponse = null;
        result = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$result$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]();
        connectTimer.cancel();
        if (initial) {
            if (target_session_attrs) {
                if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only) return fetchState();
                else if (tryNext(target_session_attrs, backendParameters)) return terminate();
            }
            if (needsTypes) {
                initial.reserve && (initial = null);
                return fetchArrayTypes();
            }
            initial && !initial.reserve && execute(initial);
            options.shared.retries = retries = 0;
            initial = null;
            return;
        }
        while(sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
        if (query) return; // Consider opening if able and sent.length < 50
        connection.reserved ? !connection.reserved.release && x[5] === 73 // I
         ? ending ? terminate() : (connection.reserved = null, onopen(connection)) : connection.reserved() : ending ? terminate() : onopen(connection);
    }
    function CommandComplete(x) {
        rows = 0;
        for(let i = x.length - 1; i > 0; i--){
            if (x[i] === 32 && x[i + 1] < 58 && result.count === null) result.count = +x.toString('utf8', i + 1, x.length - 1);
            if (x[i - 1] >= 65) {
                result.command = x.toString('utf8', 5, i);
                result.state = backend;
                break;
            }
        }
        final && (final(), final = null);
        if (result.command === 'BEGIN' && max !== 1 && !connection.reserved) return errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('UNSAFE_TRANSACTION', 'Only use sql.begin, sql.reserved or max: 1'));
        if (query.options.simple) return BindComplete();
        if (query.cursorFn) {
            result.count && query.cursorFn(result);
            write(Sync);
        }
    }
    function ParseComplete() {
        query.parsing = false;
    }
    function BindComplete() {
        !result.statement && (result.statement = query.statement);
        result.columns = query.statement.columns;
    }
    function ParameterDescription(x) {
        const length = x.readUInt16BE(5);
        for(let i = 0; i < length; ++i)!query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
        query.prepare && (statements[query.signature] = query.statement);
        query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
    }
    function RowDescription(x) {
        if (result.command) {
            results = results || [
                result
            ];
            results.push(result = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$result$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]());
            result.count = null;
            query.statement.columns = null;
        }
        const length = x.readUInt16BE(5);
        let index = 7;
        let start;
        query.statement.columns = Array(length);
        for(let i = 0; i < length; ++i){
            start = index;
            while(x[index++] !== 0);
            const table = x.readUInt32BE(index);
            const number = x.readUInt16BE(index + 4);
            const type = x.readUInt32BE(index + 6);
            query.statement.columns[i] = {
                name: transform.column.from ? transform.column.from(x.toString('utf8', start, index - 1)) : x.toString('utf8', start, index - 1),
                parser: parsers[type],
                table,
                number,
                type
            };
            index += 18;
        }
        result.statement = query.statement;
        if (query.onlyDescribe) return query.resolve(query.statement), write(Sync);
    }
    async function Authentication(x, type = x.readUInt32BE(5)) {
        (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
    }
    /* c8 ignore next 5 */ async function AuthenticationCleartextPassword() {
        const payload = await Pass();
        write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().p().str(payload).z(1).end());
    }
    async function AuthenticationMD5Password(x) {
        const payload = 'md5' + await md5(Buffer.concat([
            Buffer.from(await md5(await Pass() + user)),
            x.subarray(9)
        ]));
        write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().p().str(payload).z(1).end());
    }
    async function SASL() {
        nonce = (await __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(18)).toString('base64');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().p().str('SCRAM-SHA-256' + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N);
        const i = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i;
        write(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].inc(4).str('n,,n=*,r=' + nonce).i32(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i - i - 4, i).end());
    }
    async function SASLContinue(x) {
        const res = x.toString('utf8', 9).split(',').reduce((acc, x)=>(acc[x[0]] = x.slice(2), acc), {});
        const saltedPassword = await __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].pbkdf2Sync(await Pass(), Buffer.from(res.s, 'base64'), parseInt(res.i), 32, 'sha256');
        const clientKey = await hmac(saltedPassword, 'Client Key');
        const auth = 'n=*,r=' + nonce + ',' + 'r=' + res.r + ',s=' + res.s + ',i=' + res.i + ',c=biws,r=' + res.r;
        serverSignature = (await hmac(await hmac(saltedPassword, 'Server Key'), auth)).toString('base64');
        const payload = 'c=biws,r=' + res.r + ',p=' + xor(clientKey, Buffer.from(await hmac(await sha256(clientKey), auth))).toString('base64');
        write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().p().str(payload).end());
    }
    function SASLFinal(x) {
        if (x.toString('utf8', 9).split(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N, 1)[0].slice(2) === serverSignature) return;
        /* c8 ignore next 5 */ errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('SASL_SIGNATURE_MISMATCH', 'The server did not return the correct signature'));
        socket.destroy();
    }
    function Pass() {
        return Promise.resolve(typeof options.pass === 'function' ? options.pass() : options.pass);
    }
    function NoData() {
        result.statement = query.statement;
        result.statement.columns = [];
        if (query.onlyDescribe) return query.resolve(query.statement), write(Sync);
    }
    function BackendKeyData(x) {
        backend.pid = x.readUInt32BE(5);
        backend.secret = x.readUInt32BE(9);
    }
    async function fetchArrayTypes() {
        needsTypes = false;
        const types = await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"]([
            `
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `
        ], [], execute);
        types.forEach(({ oid, typarray })=>addArrayType(oid, typarray));
    }
    function addArrayType(oid, typarray) {
        if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
        const parser = options.parsers[oid];
        options.shared.typeArrayMap[oid] = typarray;
        options.parsers[typarray] = (xs)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arrayParser"])(xs, parser, typarray);
        options.parsers[typarray].array = true;
        options.serializers[typarray] = (xs)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["arraySerializer"])(xs, options.serializers[oid], options, typarray);
    }
    function tryNext(x, xs) {
        return x === 'read-write' && xs.default_transaction_read_only === 'on' || x === 'read-only' && xs.default_transaction_read_only === 'off' || x === 'primary' && xs.in_hot_standby === 'on' || x === 'standby' && xs.in_hot_standby === 'off' || x === 'prefer-standby' && xs.in_hot_standby === 'off' && options.host[retries];
    }
    function fetchState() {
        const query = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"]([
            `
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `
        ], [], execute, null, {
            simple: true
        });
        query.resolve = ([[a], [b]])=>{
            backendParameters.default_transaction_read_only = a.transaction_read_only;
            backendParameters.in_hot_standby = b.pg_is_in_recovery ? 'on' : 'off';
        };
        query.execute();
    }
    function ErrorResponse(x) {
        if (query) {
            (query.cursorFn || query.describeFirst) && write(Sync);
            errorResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].postgres(parseError(x));
        } else {
            errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].postgres(parseError(x)));
        }
    }
    function retry(q, error) {
        delete statements[q.signature];
        q.retried = error;
        execute(q);
    }
    function NotificationResponse(x) {
        if (!onnotify) return;
        let index = 9;
        while(x[index++] !== 0);
        onnotify(x.toString('utf8', 9, index - 1), x.toString('utf8', index, x.length - 1));
    }
    async function PortalSuspended() {
        try {
            const x = await Promise.resolve(query.cursorFn(result));
            rows = 0;
            x === __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOSE"] ? write(Close(query.portal)) : (result = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$result$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"](), write(Execute('', query.cursorRows)));
        } catch (err) {
            write(Sync);
            query.reject(err);
        }
    }
    function CloseComplete() {
        result.count && query.cursorFn(result);
        query.resolve(result);
    }
    function CopyInResponse() {
        stream = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Writable({
            autoDestroy: true,
            write (chunk, encoding, callback) {
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().d().raw(chunk).end(), callback);
            },
            destroy (error, callback) {
                callback(error);
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().f().str(error + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end());
                stream = null;
            },
            final (callback) {
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().c().end());
                final = callback;
                stream = null;
            }
        });
        query.resolve(stream);
    }
    function CopyOutResponse() {
        stream = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Readable({
            read () {
                socket.resume();
            }
        });
        query.resolve(stream);
    }
    /* c8 ignore next 3 */ function CopyBothResponse() {
        stream = new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Duplex({
            autoDestroy: true,
            read () {
                socket.resume();
            },
            /* c8 ignore next 11 */ write (chunk, encoding, callback) {
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().d().raw(chunk).end(), callback);
            },
            destroy (error, callback) {
                callback(error);
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().f().str(error + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end());
                stream = null;
            },
            final (callback) {
                socket.write((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().c().end());
                final = callback;
            }
        });
        query.resolve(stream);
    }
    function CopyData(x) {
        stream && (stream.push(x.subarray(5)) || socket.pause());
    }
    function CopyDone() {
        stream && stream.push(null);
        stream = null;
    }
    function NoticeResponse(x) {
        onnotice ? onnotice(parseError(x)) : console.log(parseError(x)); // eslint-disable-line
    }
    /* c8 ignore next 3 */ function EmptyQueryResponse() {
    /* noop */ }
    /* c8 ignore next 3 */ function FunctionCallResponse() {
        errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].notSupported('FunctionCallResponse'));
    }
    /* c8 ignore next 3 */ function NegotiateProtocolVersion() {
        errored(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].notSupported('NegotiateProtocolVersion'));
    }
    /* c8 ignore next 3 */ function UnknownMessage(x) {
        console.error('Postgres.js : Unknown Message:', x[0]); // eslint-disable-line
    }
    /* c8 ignore next 3 */ function UnknownAuth(x, type) {
        console.error('Postgres.js : Unknown Auth:', type); // eslint-disable-line
    }
    /* Messages */ function Bind(parameters, types, statement = '', portal = '') {
        let prev, type;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().B().str(portal + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).str(statement + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).i16(0).i16(parameters.length);
        parameters.forEach((x, i)=>{
            if (x === null) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i32(0xFFFFFFFF);
            type = types[i];
            parameters[i] = x = type in options.serializers ? options.serializers[type](x) : '' + x;
            prev = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].inc(4).str(x).i32(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i - prev - 4, prev);
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i16(0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].end();
    }
    function Parse(str, parameters, types, name = '') {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().P().str(name + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).str(str + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).i16(parameters.length);
        parameters.forEach((x, i)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].i32(types[i] || 0));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].end();
    }
    function Describe(x, name = '') {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().D().str(x).str(name + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end();
    }
    function Execute(portal = '', rows = 0) {
        return Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().E().str(portal + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).i32(rows).end(),
            Flush
        ]);
    }
    function Close(portal = '') {
        return Buffer.concat([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().C().str('P').str(portal + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N).end(),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().S().end()
        ]);
    }
    function StartupMessage() {
        return cancelMessage || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])().inc(4).i16(3).z(2).str(Object.entries(Object.assign({
            user,
            database,
            client_encoding: 'UTF8'
        }, options.connection)).filter(([, v])=>v).map(([k, v])=>k + __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N + v).join(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$bytes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].N)).z(2).end(0);
    }
}
function parseError(x) {
    const error = {};
    let start = 5;
    for(let i = 5; i < x.length - 1; i++){
        if (x[i] === 0) {
            error[errorFields[x[start]]] = x.toString('utf8', start + 1, i);
            start = i + 1;
        }
    }
    return error;
}
function md5(x) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('md5').update(x).digest('hex');
}
function hmac(key, x) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHmac('sha256', key).update(x).digest();
}
function sha256(x) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(x).digest();
}
function xor(a, b) {
    const length = Math.max(a.length, b.length);
    const buffer = Buffer.allocUnsafe(length);
    for(let i = 0; i < length; i++)buffer[i] = a[i] ^ b[i];
    return buffer;
}
function timer(fn, seconds) {
    seconds = typeof seconds === 'function' ? seconds() : seconds;
    if (!seconds) return {
        cancel: noop,
        start: noop
    };
    let timer;
    return {
        cancel () {
            timer && (clearTimeout(timer), timer = null);
        },
        start () {
            timer && clearTimeout(timer);
            timer = setTimeout(done, seconds * 1000, arguments);
        }
    };
    //TURBOPACK unreachable
    ;
    function done(args) {
        fn.apply(null, args);
        timer = null;
    }
}
}),
"[project]/node_modules/postgres/src/subscribe.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Subscribe
]);
const noop = ()=>{};
function Subscribe(postgres, options) {
    const subscribers = new Map(), slot = 'postgresjs_' + Math.random().toString(36).slice(2), state = {};
    let connection, stream, ended = false;
    const sql = subscribe.sql = postgres({
        ...options,
        transform: {
            column: {},
            value: {},
            row: {}
        },
        max: 1,
        fetch_types: false,
        idle_timeout: null,
        max_lifetime: null,
        connection: {
            ...options.connection,
            replication: 'database'
        },
        onclose: async function() {
            if (ended) return;
            stream = null;
            state.pid = state.secret = undefined;
            connected(await init(sql, slot, options.publications));
            subscribers.forEach((event)=>event.forEach(({ onsubscribe })=>onsubscribe()));
        },
        no_subscribe: true
    });
    const end = sql.end, close = sql.close;
    sql.end = async ()=>{
        ended = true;
        stream && await new Promise((r)=>(stream.once('close', r), stream.end()));
        return end();
    };
    sql.close = async ()=>{
        stream && await new Promise((r)=>(stream.once('close', r), stream.end()));
        return close();
    };
    return subscribe;
    //TURBOPACK unreachable
    ;
    async function subscribe(event, fn, onsubscribe = noop, onerror = noop) {
        event = parseEvent(event);
        if (!connection) connection = init(sql, slot, options.publications);
        const subscriber = {
            fn,
            onsubscribe
        };
        const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, new Set([
            subscriber
        ])).get(event);
        const unsubscribe = ()=>{
            fns.delete(subscriber);
            fns.size === 0 && subscribers.delete(event);
        };
        return connection.then((x)=>{
            connected(x);
            onsubscribe();
            stream && stream.on('error', onerror);
            return {
                unsubscribe,
                state,
                sql
            };
        });
    }
    function connected(x) {
        stream = x.stream;
        state.pid = x.state.pid;
        state.secret = x.state.secret;
    }
    async function init(sql, slot, publications) {
        if (!publications) throw new Error('Missing publication names');
        const xs = await sql.unsafe(`CREATE_REPLICATION_SLOT ${slot} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`);
        const [x] = xs;
        const stream = await sql.unsafe(`START_REPLICATION SLOT ${slot} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`).writable();
        const state = {
            lsn: Buffer.concat(x.consistent_point.split('/').map((x)=>Buffer.from(('00000000' + x).slice(-8), 'hex')))
        };
        stream.on('data', data);
        stream.on('error', error);
        stream.on('close', sql.close);
        return {
            stream,
            state: xs.state
        };
        //TURBOPACK unreachable
        ;
        function error(e) {
            console.error('Unexpected error during logical streaming - reconnecting', e); // eslint-disable-line
        }
        function data(x) {
            if (x[0] === 0x77) {
                parse(x.subarray(25), state, sql.options.parsers, handle, options.transform);
            } else if (x[0] === 0x6b && x[17]) {
                state.lsn = x.subarray(1, 9);
                pong();
            }
        }
        function handle(a, b) {
            const path = b.relation.schema + '.' + b.relation.table;
            call('*', a, b);
            call('*:' + path, a, b);
            b.relation.keys.length && call('*:' + path + '=' + b.relation.keys.map((x)=>a[x.name]), a, b);
            call(b.command, a, b);
            call(b.command + ':' + path, a, b);
            b.relation.keys.length && call(b.command + ':' + path + '=' + b.relation.keys.map((x)=>a[x.name]), a, b);
        }
        function pong() {
            const x = Buffer.alloc(34);
            x[0] = 'r'.charCodeAt(0);
            x.fill(state.lsn, 1);
            x.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2000, 0, 1)) * BigInt(1000), 25);
            stream.write(x);
        }
    }
    function call(x, a, b) {
        subscribers.has(x) && subscribers.get(x).forEach(({ fn })=>fn(a, b, x));
    }
}
function Time(x) {
    return new Date(Date.UTC(2000, 0, 1) + Number(x / BigInt(1000)));
}
function parse(x, state, parsers, handle, transform) {
    const char = (acc, [k, v])=>(acc[k.charCodeAt(0)] = v, acc);
    Object.entries({
        R: (x)=>{
            let i = 1;
            const r = state[x.readUInt32BE(i)] = {
                schema: x.toString('utf8', i += 4, i = x.indexOf(0, i)) || 'pg_catalog',
                table: x.toString('utf8', i + 1, i = x.indexOf(0, i + 1)),
                columns: Array(x.readUInt16BE(i += 2)),
                keys: []
            };
            i += 2;
            let columnIndex = 0, column;
            while(i < x.length){
                column = r.columns[columnIndex++] = {
                    key: x[i++],
                    name: transform.column.from ? transform.column.from(x.toString('utf8', i, i = x.indexOf(0, i))) : x.toString('utf8', i, i = x.indexOf(0, i)),
                    type: x.readUInt32BE(i += 1),
                    parser: parsers[x.readUInt32BE(i)],
                    atttypmod: x.readUInt32BE(i += 4)
                };
                column.key && r.keys.push(column);
                i += 4;
            }
        },
        Y: ()=>{},
        O: ()=>{},
        B: (x)=>{
            state.date = Time(x.readBigInt64BE(9));
            state.lsn = x.subarray(1, 9);
        },
        I: (x)=>{
            let i = 1;
            const relation = state[x.readUInt32BE(i)];
            const { row } = tuples(x, relation.columns, i += 7, transform);
            handle(row, {
                command: 'insert',
                relation
            });
        },
        D: (x)=>{
            let i = 1;
            const relation = state[x.readUInt32BE(i)];
            i += 4;
            const key = x[i] === 75;
            handle(key || x[i] === 79 ? tuples(x, relation.columns, i += 3, transform).row : null, {
                command: 'delete',
                relation,
                key
            });
        },
        U: (x)=>{
            let i = 1;
            const relation = state[x.readUInt32BE(i)];
            i += 4;
            const key = x[i] === 75;
            const xs = key || x[i] === 79 ? tuples(x, relation.columns, i += 3, transform) : null;
            xs && (i = xs.i);
            const { row } = tuples(x, relation.columns, i + 3, transform);
            handle(row, {
                command: 'update',
                relation,
                key,
                old: xs && xs.row
            });
        },
        T: ()=>{},
        C: ()=>{} // Commit
    }).reduce(char, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
    let type, column, value;
    const row = transform.raw ? new Array(columns.length) : {};
    for(let i = 0; i < columns.length; i++){
        type = x[xi++];
        column = columns[i];
        value = type === 110 // n
         ? null : type === 117 // u
         ? undefined : column.parser === undefined ? x.toString('utf8', xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString('utf8', xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString('utf8', xi + 4, xi += 4 + x.readUInt32BE(xi)));
        transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    return {
        i: xi,
        row: transform.row.from ? transform.row.from(row) : row
    };
}
function parseEvent(x) {
    const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const [, command, path, key] = xs;
    return (command || '*') + (path ? ':' + (path.indexOf('.') === -1 ? 'public.' + path : path) : '') + (key ? '=' + key : '');
}
}),
"[project]/node_modules/postgres/src/large.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>largeObject
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/stream [external] (stream, cjs)");
;
function largeObject(sql, oid, mode = 0x00020000 | 0x00040000) {
    return new Promise(async (resolve, reject)=>{
        await sql.begin(async (sql)=>{
            let finish;
            !oid && ([{ oid }] = await sql`select lo_creat(-1) as oid`);
            const [{ fd }] = await sql`select lo_open(${oid}, ${mode}) as fd`;
            const lo = {
                writable,
                readable,
                close: ()=>sql`select lo_close(${fd})`.then(finish),
                tell: ()=>sql`select lo_tell64(${fd})`,
                read: (x)=>sql`select loread(${fd}, ${x}) as data`,
                write: (x)=>sql`select lowrite(${fd}, ${x})`,
                truncate: (x)=>sql`select lo_truncate64(${fd}, ${x})`,
                seek: (x, whence = 0)=>sql`select lo_lseek64(${fd}, ${x}, ${whence})`,
                size: ()=>sql`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
            };
            resolve(lo);
            return new Promise(async (r)=>finish = r);
            //TURBOPACK unreachable
            ;
            async function readable({ highWaterMark = 2048 * 8, start = 0, end = Infinity } = {}) {
                let max = end - start;
                start && await lo.seek(start);
                return new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Readable({
                    highWaterMark,
                    async read (size) {
                        const l = size > max ? size - max : size;
                        max -= size;
                        const [{ data }] = await lo.read(l);
                        this.push(data);
                        if (data.length < size) this.push(null);
                    }
                });
            }
            async function writable({ highWaterMark = 2048 * 8, start = 0 } = {}) {
                start && await lo.seek(start);
                return new __TURBOPACK__imported__module__$5b$externals$5d2f$stream__$5b$external$5d$__$28$stream$2c$__cjs$29$__["default"].Writable({
                    highWaterMark,
                    write (chunk, encoding, callback) {
                        lo.write(chunk).then(()=>callback(), callback);
                    }
                });
            }
        }).catch(reject);
    });
}
}),
"[project]/node_modules/postgres/src/index.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/types.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$connection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/connection.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/query.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/queue.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/errors.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$subscribe$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/subscribe.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$large$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postgres/src/large.js [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
;
Object.assign(Postgres, {
    PostgresError: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresError"],
    toPascal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPascal"],
    pascal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pascal"],
    toCamel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toCamel"],
    camel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["camel"],
    toKebab: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toKebab"],
    kebab: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kebab"],
    fromPascal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromPascal"],
    fromCamel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromCamel"],
    fromKebab: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fromKebab"],
    BigInt: {
        to: 20,
        from: [
            20
        ],
        parse: (x)=>BigInt(x),
        serialize: (x)=>x.toString()
    }
});
const __TURBOPACK__default__export__ = Postgres;
function Postgres(a, b) {
    const options = parseOptions(a, b), subscribe = options.no_subscribe || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$subscribe$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(Postgres, {
        ...options
    });
    let ending = false;
    const queries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), connecting = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), reserved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), closed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), ended = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), open = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), busy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), full = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(), queues = {
        connecting,
        reserved,
        closed,
        ended,
        open,
        busy,
        full
    };
    const connections = [
        ...Array(options.max)
    ].map(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$connection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(options, queues, {
            onopen,
            onend,
            onclose
        }));
    const sql = Sql(handler);
    Object.assign(sql, {
        get parameters () {
            return options.parameters;
        },
        largeObject: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$large$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].bind(null, sql),
        subscribe,
        CLOSE: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOSE"],
        END: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["CLOSE"],
        PostgresError: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresError"],
        options,
        reserve,
        listen,
        begin,
        close,
        end
    });
    return sql;
    //TURBOPACK unreachable
    ;
    function Sql(handler) {
        handler.debug = options.debug;
        Object.entries(options.types).reduce((acc, [name, type])=>{
            acc[name] = (x)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Parameter"](x, type.to);
            return acc;
        }, typed);
        Object.assign(sql, {
            types: typed,
            typed,
            unsafe,
            notify,
            array,
            json,
            file
        });
        return sql;
        //TURBOPACK unreachable
        ;
        function typed(value, type) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Parameter"](value, type);
        }
        function sql(strings, ...args) {
            const query = strings && Array.isArray(strings.raw) ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"](strings, args, handler, cancel) : typeof strings === 'string' && !args.length ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Identifier"](options.transform.column.to ? options.transform.column.to(strings) : strings) : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Builder"](strings, args);
            return query;
        }
        function unsafe(string, args = [], options = {}) {
            arguments.length === 2 && !Array.isArray(args) && (options = args, args = []);
            const query = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"]([
                string
            ], args, handler, cancel, {
                prepare: false,
                ...options,
                simple: 'simple' in options ? options.simple : args.length === 0
            });
            return query;
        }
        function file(path, args = [], options = {}) {
            arguments.length === 2 && !Array.isArray(args) && (options = args, args = []);
            const query = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$query$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Query"]([], args, (query)=>{
                __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFile(path, 'utf8', (err, string)=>{
                    if (err) return query.reject(err);
                    query.strings = [
                        string
                    ];
                    handler(query);
                });
            }, cancel, {
                ...options,
                simple: 'simple' in options ? options.simple : args.length === 0
            });
            return query;
        }
    }
    async function listen(name, fn, onlisten) {
        const listener = {
            fn,
            onlisten
        };
        const sql = listen.sql || (listen.sql = Postgres({
            ...options,
            max: 1,
            idle_timeout: null,
            max_lifetime: null,
            fetch_types: false,
            onclose () {
                Object.entries(listen.channels).forEach(([name, { listeners }])=>{
                    delete listen.channels[name];
                    Promise.all(listeners.map((l)=>listen(name, l.fn, l.onlisten).catch(()=>{})));
                });
            },
            onnotify (c, x) {
                c in listen.channels && listen.channels[c].listeners.forEach((l)=>l.fn(x));
            }
        }));
        const channels = listen.channels || (listen.channels = {}), exists = name in channels;
        if (exists) {
            channels[name].listeners.push(listener);
            const result = await channels[name].result;
            listener.onlisten && listener.onlisten();
            return {
                state: result.state,
                unlisten
            };
        }
        channels[name] = {
            result: sql`listen ${sql.unsafe('"' + name.replace(/"/g, '""') + '"')}`,
            listeners: [
                listener
            ]
        };
        const result = await channels[name].result;
        listener.onlisten && listener.onlisten();
        return {
            state: result.state,
            unlisten
        };
        //TURBOPACK unreachable
        ;
        async function unlisten() {
            if (name in channels === false) return;
            channels[name].listeners = channels[name].listeners.filter((x)=>x !== listener);
            if (channels[name].listeners.length) return;
            delete channels[name];
            return sql`unlisten ${sql.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
        }
    }
    async function notify(channel, payload) {
        return await sql`select pg_notify(${channel}, ${'' + payload})`;
    }
    async function reserve() {
        const queue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const c = open.length ? open.shift() : await new Promise((resolve, reject)=>{
            const query = {
                reserve: resolve,
                reject
            };
            queries.push(query);
            closed.length && connect(closed.shift(), query);
        });
        move(c, reserved);
        c.reserved = ()=>queue.length ? c.execute(queue.shift()) : move(c, reserved);
        c.reserved.release = true;
        const sql = Sql(handler);
        sql.release = ()=>{
            c.reserved = null;
            onopen(c);
        };
        return sql;
        //TURBOPACK unreachable
        ;
        function handler(q) {
            c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
        }
    }
    async function begin(options, fn) {
        !fn && (fn = options, options = '');
        const queries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$queue$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        let savepoints = 0, connection, prepare = null;
        try {
            await sql.unsafe('begin ' + options.replace(/[^a-z ]/ig, ''), [], {
                onexecute
            }).execute();
            return await Promise.race([
                scope(connection, fn),
                new Promise((_, reject)=>connection.onclose = reject)
            ]);
        } catch (error) {
            throw error;
        }
        async function scope(c, fn, name) {
            const sql = Sql(handler);
            sql.savepoint = savepoint;
            sql.prepare = (x)=>prepare = x.replace(/[^a-z0-9$-_. ]/gi);
            let uncaughtError, result;
            name && await sql`savepoint ${sql(name)}`;
            try {
                result = await new Promise((resolve, reject)=>{
                    const x = fn(sql);
                    Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
                });
                if (uncaughtError) throw uncaughtError;
            } catch (e) {
                await (name ? sql`rollback to ${sql(name)}` : sql`rollback`);
                throw e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PostgresError"] && e.code === '25P02' && uncaughtError || e;
            }
            if (!name) {
                prepare ? await sql`prepare transaction '${sql.unsafe(prepare)}'` : await sql`commit`;
            }
            return result;
            //TURBOPACK unreachable
            ;
            function savepoint(name, fn) {
                if (name && Array.isArray(name.raw)) return savepoint((sql)=>sql.apply(sql, arguments));
                arguments.length === 1 && (fn = name, name = null);
                return scope(c, fn, 's' + savepoints++ + (name ? '_' + name : ''));
            }
            function handler(q) {
                q.catch((e)=>uncaughtError || (uncaughtError = e));
                c.queue === full ? queries.push(q) : c.execute(q) || move(c, full);
            }
        }
        function onexecute(c) {
            connection = c;
            move(c, reserved);
            c.reserved = ()=>queries.length ? c.execute(queries.shift()) : move(c, reserved);
        }
    }
    function move(c, queue) {
        c.queue.remove(c);
        queue.push(c);
        c.queue = queue;
        queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
        return c;
    }
    function json(x) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Parameter"](x, 3802);
    }
    function array(x, type) {
        if (!Array.isArray(x)) return array(Array.from(arguments));
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Parameter"](x, type || (x.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inferType"])(x) || 25 : 0), options.shared.typeArrayMap);
    }
    function handler(query) {
        if (ending) return query.reject(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_ENDED', options, options));
        if (open.length) return go(open.shift(), query);
        if (closed.length) return connect(closed.shift(), query);
        busy.length ? go(busy.shift(), query) : queries.push(query);
    }
    function go(c, query) {
        return c.execute(query) ? move(c, busy) : move(c, full);
    }
    function cancel(query) {
        return new Promise((resolve, reject)=>{
            query.state ? query.active ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$connection$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(options).cancel(query.state, resolve, reject) : query.cancelled = {
                resolve,
                reject
            } : (queries.remove(query), query.cancelled = true, query.reject(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].generic('57014', 'canceling statement due to user request')), resolve());
        });
    }
    async function end({ timeout = null } = {}) {
        if (ending) return ending;
        await 1;
        let timer;
        return ending = Promise.race([
            new Promise((r)=>timeout !== null && (timer = setTimeout(destroy, timeout * 1000, r))),
            Promise.all(connections.map((c)=>c.end()).concat(listen.sql ? listen.sql.end({
                timeout: 0
            }) : [], subscribe.sql ? subscribe.sql.end({
                timeout: 0
            }) : []))
        ]).then(()=>clearTimeout(timer));
    }
    async function close() {
        await Promise.all(connections.map((c)=>c.end()));
    }
    async function destroy(resolve) {
        await Promise.all(connections.map((c)=>c.terminate()));
        while(queries.length)queries.shift().reject(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$errors$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Errors"].connection('CONNECTION_DESTROYED', options));
        resolve();
    }
    function connect(c, query) {
        move(c, connecting);
        c.connect(query);
        return c;
    }
    function onend(c) {
        move(c, ended);
    }
    function onopen(c) {
        if (queries.length === 0) return move(c, open);
        let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
        while(ready && queries.length && max-- > 0){
            const query = queries.shift();
            if (query.reserve) return query.reserve(c);
            ready = c.execute(query);
        }
        ready ? move(c, busy) : move(c, full);
    }
    function onclose(c, e) {
        move(c, closed);
        c.reserved = null;
        c.onclose && (c.onclose(e), c.onclose = null);
        options.onclose && options.onclose(c.id);
        queries.length && connect(c, queries.shift());
    }
}
function parseOptions(a, b) {
    if (a && a.shared) return a;
    const env = process.env // eslint-disable-line
    , o = (!a || typeof a === 'string' ? b : a) || {}, { url, multihost } = parseUrl(a), query = [
        ...url.searchParams
    ].reduce((a, [b, c])=>(a[b] = c, a), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || 'localhost', port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
    o.no_prepare && (o.prepare = false);
    query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
    'timeout' in o && (console.log('The timeout option is deprecated, use idle_timeout instead'), o.idle_timeout = o.timeout); // eslint-disable-line
    query.sslrootcert === 'system' && (query.ssl = 'verify-full');
    const ints = [
        'idle_timeout',
        'connect_timeout',
        'max_lifetime',
        'max_pipeline',
        'backoff',
        'keep_alive'
    ];
    const defaults = {
        max: globalThis.Cloudflare ? 3 : 10,
        ssl: false,
        sslnegotiation: null,
        idle_timeout: null,
        connect_timeout: 30,
        max_lifetime: max_lifetime,
        max_pipeline: 100,
        backoff: backoff,
        keep_alive: 60,
        prepare: true,
        debug: false,
        fetch_types: true,
        publications: 'alltables',
        target_session_attrs: null
    };
    return {
        host: Array.isArray(host) ? host : host.split(',').map((x)=>x.split(':')[0]),
        port: Array.isArray(port) ? port : host.split(',').map((x)=>parseInt(x.split(':')[1] || port)),
        path: o.path || host.indexOf('/') > -1 && host + '/.s.PGSQL.' + port,
        database: o.database || o.db || (url.pathname || '').slice(1) || env.PGDATABASE || user,
        user: user,
        pass: o.pass || o.password || url.password || env.PGPASSWORD || '',
        ...Object.entries(defaults).reduce((acc, [k, d])=>{
            const value = k in o ? o[k] : k in query ? query[k] === 'disable' || query[k] === 'false' ? false : query[k] : env['PG' + k.toUpperCase()] || d;
            acc[k] = typeof value === 'string' && ints.includes(k) ? +value : value;
            return acc;
        }, {}),
        connection: {
            application_name: env.PGAPPNAME || 'postgres.js',
            ...o.connection,
            ...Object.entries(query).reduce((acc, [k, v])=>(k in defaults || (acc[k] = v), acc), {})
        },
        types: o.types || {},
        target_session_attrs: tsa(o, url, env),
        onnotice: o.onnotice,
        onnotify: o.onnotify,
        onclose: o.onclose,
        onparameter: o.onparameter,
        socket: o.socket,
        transform: parseTransform(o.transform || {
            undefined: undefined
        }),
        parameters: {},
        shared: {
            retries: 0,
            typeArrayMap: {}
        },
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postgres$2f$src$2f$types$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mergeUserTypes"])(o.types)
    };
}
function tsa(o, url, env) {
    const x = o.target_session_attrs || url.searchParams.get('target_session_attrs') || env.PGTARGETSESSIONATTRS;
    if (!x || [
        'read-write',
        'read-only',
        'primary',
        'standby',
        'prefer-standby'
    ].includes(x)) return x;
    throw new Error('target_session_attrs ' + x + ' is not supported');
}
function backoff(retries) {
    return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
    return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
    return {
        undefined: x.undefined,
        column: {
            from: typeof x.column === 'function' ? x.column : x.column && x.column.from,
            to: x.column && x.column.to
        },
        value: {
            from: typeof x.value === 'function' ? x.value : x.value && x.value.from,
            to: x.value && x.value.to
        },
        row: {
            from: typeof x.row === 'function' ? x.row : x.row && x.row.from,
            to: x.row && x.row.to
        }
    };
}
function parseUrl(url) {
    if (!url || typeof url !== 'string') return {
        url: {
            searchParams: new Map()
        }
    };
    let host = url;
    host = host.slice(host.indexOf('://') + 3).split(/[?/]/)[0];
    host = decodeURIComponent(host.slice(host.indexOf('@') + 1));
    const urlObj = new URL(url.replace(host, host.split(',')[0]));
    return {
        url: {
            username: decodeURIComponent(urlObj.username),
            password: decodeURIComponent(urlObj.password),
            host: urlObj.host,
            hostname: urlObj.hostname,
            port: urlObj.port,
            pathname: urlObj.pathname,
            searchParams: urlObj.searchParams
        },
        multihost: host.indexOf(',') > -1 && host
    };
}
function osUsername() {
    try {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].userInfo().username // eslint-disable-line
        ;
    } catch (_) {
        return process.env.USERNAME || process.env.USER || process.env.LOGNAME // eslint-disable-line
        ;
    }
}
}),
"[project]/node_modules/drizzle-zod/index.mjs [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createInsertSchema",
    ()=>createInsertSchema,
    "createSchemaFactory",
    ()=>createSchemaFactory,
    "createSelectSchema",
    ()=>createSelectSchema,
    "createUpdateSchema",
    ()=>createUpdateSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/utils.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$entity$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/entity.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$column$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/column.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-route] (ecmascript)");
;
;
const CONSTANTS = {
    INT8_MIN: -128,
    INT8_MAX: 127,
    INT8_UNSIGNED_MAX: 255,
    INT16_MIN: -32768,
    INT16_MAX: 32767,
    INT16_UNSIGNED_MAX: 65535,
    INT24_MIN: -8388608,
    INT24_MAX: 8388607,
    INT24_UNSIGNED_MAX: 16777215,
    INT32_MIN: -2147483648,
    INT32_MAX: 2147483647,
    INT32_UNSIGNED_MAX: 4294967295,
    INT48_MIN: -140737488355328,
    INT48_MAX: 140737488355327,
    INT48_UNSIGNED_MAX: 281474976710655,
    INT64_MIN: -9223372036854775808n,
    INT64_MAX: 9223372036854775807n,
    INT64_UNSIGNED_MAX: 18446744073709551615n
};
function isColumnType(column, columnTypes) {
    return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
    return 'enumValues' in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
const isPgEnum = isWithEnum;
const literalSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].union([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].boolean(),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].null()
]);
const jsonSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].union([
    literalSchema,
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].any()),
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].any())
]);
const bufferSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].custom((v)=>v instanceof Buffer); // eslint-disable-line no-instanceof/no-instanceof
function columnToSchema(column, factory) {
    const z$1 = factory?.zodInstance ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"];
    const coerce = factory?.coerce ?? {};
    let schema;
    if (isWithEnum(column)) {
        schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
    }
    if (!schema) {
        // Handle specific types
        if (isColumnType(column, [
            'PgGeometry',
            'PgPointTuple'
        ])) {
            schema = z$1.tuple([
                z$1.number(),
                z$1.number()
            ]);
        } else if (isColumnType(column, [
            'PgGeometryObject',
            'PgPointObject'
        ])) {
            schema = z$1.object({
                x: z$1.number(),
                y: z$1.number()
            });
        } else if (isColumnType(column, [
            'PgHalfVector',
            'PgVector'
        ])) {
            schema = z$1.array(z$1.number());
            schema = column.dimensions ? schema.length(column.dimensions) : schema;
        } else if (isColumnType(column, [
            'PgLine'
        ])) {
            schema = z$1.tuple([
                z$1.number(),
                z$1.number(),
                z$1.number()
            ]);
        } else if (isColumnType(column, [
            'PgLineABC'
        ])) {
            schema = z$1.object({
                a: z$1.number(),
                b: z$1.number(),
                c: z$1.number()
            });
        } else if (isColumnType(column, [
            'PgArray'
        ])) {
            schema = z$1.array(columnToSchema(column.baseColumn, z$1));
            schema = column.size ? schema.length(column.size) : schema;
        } else if (column.dataType === 'array') {
            schema = z$1.array(z$1.any());
        } else if (column.dataType === 'number') {
            schema = numberColumnToSchema(column, z$1, coerce);
        } else if (column.dataType === 'bigint') {
            schema = bigintColumnToSchema(column, z$1, coerce);
        } else if (column.dataType === 'boolean') {
            schema = coerce === true || coerce.boolean ? z$1.coerce.boolean() : z$1.boolean();
        } else if (column.dataType === 'date') {
            schema = coerce === true || coerce.date ? z$1.coerce.date() : z$1.date();
        } else if (column.dataType === 'string') {
            schema = stringColumnToSchema(column, z$1, coerce);
        } else if (column.dataType === 'json') {
            schema = jsonSchema;
        } else if (column.dataType === 'custom') {
            schema = z$1.any();
        } else if (column.dataType === 'buffer') {
            schema = bufferSchema;
        }
    }
    if (!schema) {
        schema = z$1.any();
    }
    return schema;
}
function numberColumnToSchema(column, z, coerce) {
    let unsigned = column.getSQLType().includes('unsigned');
    let min;
    let max;
    let integer = false;
    if (isColumnType(column, [
        'MySqlTinyInt',
        'SingleStoreTinyInt'
    ])) {
        min = unsigned ? 0 : CONSTANTS.INT8_MIN;
        max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
        integer = true;
    } else if (isColumnType(column, [
        'PgSmallInt',
        'PgSmallSerial',
        'MySqlSmallInt',
        'SingleStoreSmallInt'
    ])) {
        min = unsigned ? 0 : CONSTANTS.INT16_MIN;
        max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
        integer = true;
    } else if (isColumnType(column, [
        'PgReal',
        'MySqlFloat',
        'MySqlMediumInt',
        'SingleStoreMediumInt',
        'SingleStoreFloat'
    ])) {
        min = unsigned ? 0 : CONSTANTS.INT24_MIN;
        max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
        integer = isColumnType(column, [
            'MySqlMediumInt',
            'SingleStoreMediumInt'
        ]);
    } else if (isColumnType(column, [
        'PgInteger',
        'PgSerial',
        'MySqlInt',
        'SingleStoreInt'
    ])) {
        min = unsigned ? 0 : CONSTANTS.INT32_MIN;
        max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
        integer = true;
    } else if (isColumnType(column, [
        'PgDoublePrecision',
        'MySqlReal',
        'MySqlDouble',
        'SingleStoreReal',
        'SingleStoreDouble',
        'SQLiteReal'
    ])) {
        min = unsigned ? 0 : CONSTANTS.INT48_MIN;
        max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
    } else if (isColumnType(column, [
        'PgBigInt53',
        'PgBigSerial53',
        'MySqlBigInt53',
        'MySqlSerial',
        'SingleStoreBigInt53',
        'SingleStoreSerial',
        'SQLiteInteger'
    ])) {
        unsigned = unsigned || isColumnType(column, [
            'MySqlSerial',
            'SingleStoreSerial'
        ]);
        min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
        max = Number.MAX_SAFE_INTEGER;
        integer = true;
    } else if (isColumnType(column, [
        'MySqlYear',
        'SingleStoreYear'
    ])) {
        min = 1901;
        max = 2155;
        integer = true;
    } else {
        min = Number.MIN_SAFE_INTEGER;
        max = Number.MAX_SAFE_INTEGER;
    }
    let schema = coerce === true || coerce?.number ? z.coerce.number() : z.number();
    schema = schema.min(min).max(max);
    return integer ? schema.int() : schema;
}
function bigintColumnToSchema(column, z, coerce) {
    const unsigned = column.getSQLType().includes('unsigned');
    const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
    const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
    const schema = coerce === true || coerce?.bigint ? z.coerce.bigint() : z.bigint();
    return schema.min(min).max(max);
}
function stringColumnToSchema(column, z, coerce) {
    if (isColumnType(column, [
        'PgUUID'
    ])) {
        return z.string().uuid();
    }
    let max;
    let regex;
    let fixed = false;
    if (isColumnType(column, [
        'PgVarchar',
        'SQLiteText'
    ])) {
        max = column.length;
    } else if (isColumnType(column, [
        'MySqlVarChar',
        'SingleStoreVarChar'
    ])) {
        max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
    } else if (isColumnType(column, [
        'MySqlText',
        'SingleStoreText'
    ])) {
        if (column.textType === 'longtext') {
            max = CONSTANTS.INT32_UNSIGNED_MAX;
        } else if (column.textType === 'mediumtext') {
            max = CONSTANTS.INT24_UNSIGNED_MAX;
        } else if (column.textType === 'text') {
            max = CONSTANTS.INT16_UNSIGNED_MAX;
        } else {
            max = CONSTANTS.INT8_UNSIGNED_MAX;
        }
    }
    if (isColumnType(column, [
        'PgChar',
        'MySqlChar',
        'SingleStoreChar'
    ])) {
        max = column.length;
        fixed = true;
    }
    if (isColumnType(column, [
        'PgBinaryVector'
    ])) {
        regex = /^[01]+$/;
        max = column.dimensions;
    }
    let schema = coerce === true || coerce?.string ? z.coerce.string() : z.string();
    schema = regex ? schema.regex(regex) : schema;
    return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTable"])(tableLike) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTableColumns"])(tableLike) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$utils$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getViewSelectedFields"])(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
    const columnSchemas = {};
    for (const [key, selected] of Object.entries(columns)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$entity$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["is"])(selected, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$column$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Column"]) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$entity$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["is"])(selected, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SQL"]) && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$entity$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["is"])(selected, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SQL"].Aliased) && typeof selected === 'object') {
            const columns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isTable"])(selected) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isView"])(selected) ? getColumns(selected) : selected;
            columnSchemas[key] = handleColumns(columns, refinements[key] ?? {}, conditions, factory);
            continue;
        }
        const refinement = refinements[key];
        if (refinement !== undefined && typeof refinement !== 'function') {
            columnSchemas[key] = refinement;
            continue;
        }
        const column = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$entity$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["is"])(selected, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$column$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Column"]) ? selected : undefined;
        const schema = column ? columnToSchema(column, factory) : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].any();
        const refined = typeof refinement === 'function' ? refinement(schema) : schema;
        if (conditions.never(column)) {
            continue;
        } else {
            columnSchemas[key] = refined;
        }
        if (column) {
            if (conditions.nullable(column)) {
                columnSchemas[key] = columnSchemas[key].nullable();
            }
            if (conditions.optional(column)) {
                columnSchemas[key] = columnSchemas[key].optional();
            }
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object(columnSchemas);
}
function handleEnum(enum_, factory) {
    const zod = factory?.zodInstance ?? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"];
    return zod.enum(enum_.enumValues);
}
const selectConditions = {
    never: ()=>false,
    optional: ()=>false,
    nullable: (column)=>!column.notNull
};
const insertConditions = {
    never: (column)=>column?.generated?.type === 'always' || column?.generatedIdentity?.type === 'always',
    optional: (column)=>!column.notNull || column.notNull && column.hasDefault,
    nullable: (column)=>!column.notNull
};
const updateConditions = {
    never: (column)=>column?.generated?.type === 'always' || column?.generatedIdentity?.type === 'always',
    optional: ()=>true,
    nullable: (column)=>!column.notNull
};
const createSelectSchema = (entity, refine)=>{
    if (isPgEnum(entity)) {
        return handleEnum(entity);
    }
    const columns = getColumns(entity);
    return handleColumns(columns, refine ?? {}, selectConditions);
};
const createInsertSchema = (entity, refine)=>{
    const columns = getColumns(entity);
    return handleColumns(columns, refine ?? {}, insertConditions);
};
const createUpdateSchema = (entity, refine)=>{
    const columns = getColumns(entity);
    return handleColumns(columns, refine ?? {}, updateConditions);
};
function createSchemaFactory(options) {
    const createSelectSchema = (entity, refine)=>{
        if (isPgEnum(entity)) {
            return handleEnum(entity, options);
        }
        const columns = getColumns(entity);
        return handleColumns(columns, refine ?? {}, selectConditions, options);
    };
    const createInsertSchema = (entity, refine)=>{
        const columns = getColumns(entity);
        return handleColumns(columns, refine ?? {}, insertConditions, options);
    };
    const createUpdateSchema = (entity, refine)=>{
        const columns = getColumns(entity);
        return handleColumns(columns, refine ?? {}, updateConditions, options);
    };
    return {
        createSelectSchema,
        createInsertSchema,
        createUpdateSchema
    };
}
;
 //# sourceMappingURL=index.mjs.map
}),
"[externals]/bcrypt [external] (bcrypt, cjs, [project]/node_modules/bcrypt)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("bcrypt-a3fecf8c027c10c9", () => require("bcrypt-a3fecf8c027c10c9"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5e8c7af._.js.map