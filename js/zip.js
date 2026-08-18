/* ==========================================================================
   Vecode — zip.js · dependency-free ZIP writer (STORE method, UTF-8 names)
   Produces a valid .zip that any OS / Netlify Drop can open.
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
    // Fallback for very old engines
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      out.push(code < 128 ? code : code < 2048 ? [192 | (code >> 6), 128 | (code & 63)] : [224 | (code >> 12), 128 | ((code >> 6) & 63), 128 | (code & 63)]);
    }
    return Uint8Array.from(out.flat());
  }

  function decodeBase64(input) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const clean = String(input).replace(/\s/g, "").replace(/=+$/, "");
    const out = [];
    let buffer = 0;
    let bits = 0;
    for (const char of clean) {
      const value = alphabet.indexOf(char);
      if (value < 0) throw new Error("Invalid base64 data URI");
      buffer = (buffer << 6) | value;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((buffer >> bits) & 0xff);
      }
    }
    return Uint8Array.from(out);
  }

  function contentBytes(value) {
    if (typeof value !== "string") return value;
    const match = value.match(/^data:([^,]*?),(.*)$/is);
    if (!match) return encodeText(value);
    if (/;base64(?:;|$)/i.test(match[1])) return decodeBase64(match[2]);
    try { return encodeText(decodeURIComponent(match[2])); }
    catch (e) { return encodeText(match[2]); }
  }

  /**
   * Build a ZIP from { filename: string|Uint8Array } — returns a Blob.
   * Base64 data-URI values (used by binary imports) are decoded to raw bytes.
   * Uses STORE (no compression) so it is fast and dependency-free.
   */
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

      // Local file header
      const local = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true); // signature
      dv.setUint16(4, 20, true); // version needed
      dv.setUint16(6, 0x0800, true); // flags: UTF-8 names
      dv.setUint16(8, 0, true); // method: store
      dv.setUint16(10, 0, true); // mod time
      dv.setUint16(12, 0x21, true); // mod date
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true); // extra len
      local.set(nameBytes, 30);
      chunks.push(local, data);

      // Central directory record
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
      cd.setUint32(38, 0, true); // external attributes
      cd.setUint32(42, localOffset, true); // relative local-header offset
      cen.set(nameBytes, 46);
      central.push(cen);
      offset += local.length + data.length;
    }

    // End of central directory
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
