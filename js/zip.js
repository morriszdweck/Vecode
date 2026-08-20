/* ==========================================================================
   Vecode — zip.js · dependency-free ZIP writer (v3 rebuild)
   STORE method, UTF-8 filenames, data-URI aware, spec-correct.
   Rebuilt ground-up: clearer CRC, safer base64, explicit offsets.
   ========================================================================== */
(function () {
  "use strict";

  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function encodeText(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(str);
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code < 0x80) out.push(code);
      else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      else if (code < 0xd800 || code >= 0xe000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      else {
        // surrogate pair
        i++;
        const cp = 0x10000 + ((code & 0x3ff) << 10) + (str.charCodeAt(i) & 0x3ff);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      }
    }
    return Uint8Array.from(out);
  }

  function decodeBase64(input) {
    const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = String(input).replace(/\s/g, "").replace(/=+$/, "");
    const out = [];
    let buf = 0, bits = 0;
    for (const ch of clean) {
      const v = alpha.indexOf(ch);
      if (v < 0) throw new Error("Invalid base64 data URI");
      buf = (buf << 6) | v;
      bits += 6;
      if (bits >= 8) { bits -= 8; out.push((buf >> bits) & 0xff); }
    }
    return Uint8Array.from(out);
  }

  function contentBytes(value) {
    if (typeof value !== "string") return value;
    const m = value.match(/^data:([^,]*?),(.*)$/is);
    if (!m) return encodeText(value);
    if (/;base64(?:;|$)/i.test(m[1])) return decodeBase64(m[2]);
    try { return encodeText(decodeURIComponent(m[2])); }
    catch (e) { return encodeText(m[2]); }
  }

  function makeZip(files) {
    const chunks = [];
    const central = [];
    let offset = 0;
    const entries = Object.keys(files).sort();

    for (const name of entries) {
      const data = contentBytes(files[name]);
      const nameBytes = encodeText(name);
      const crc = crc32(data);
      const localOffset = offset;

      const local = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0x21, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      chunks.push(local, data);

      const cen = new Uint8Array(46 + nameBytes.length);
      const cd = new DataView(cen.buffer);
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, 0, true);
      cd.setUint16(14, 0x21, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, data.length, true);
      cd.setUint32(24, data.length, true);
      cd.setUint16(28, nameBytes.length, true);
      cd.setUint16(30, 0, true);
      cd.setUint16(32, 0, true);
      cd.setUint16(34, 0, true);
      cd.setUint16(36, 0, true);
      cd.setUint32(38, 0, true);
      cd.setUint32(42, localOffset, true);
      cen.set(nameBytes, 46);
      central.push(cen);
      offset += local.length + data.length;
    }

    const centralSize = central.reduce((a, c) => a + c.length, 0);
    const eocd = new Uint8Array(22);
    const ed = new DataView(eocd.buffer);
    ed.setUint32(0, 0x06054b50, true);
    ed.setUint16(8, entries.length, true);
    ed.setUint16(10, entries.length, true);
    ed.setUint32(12, centralSize, true);
    ed.setUint32(16, offset, true);
    ed.setUint16(20, 0, true);

    return new Blob([...chunks, ...central, eocd], { type: "application/zip" });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }

  window.Vecode = window.Vecode || {};
  window.Vecode.Zip = { makeZip, downloadBlob, contentBytes };
})();
