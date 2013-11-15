/*
Original Copyright 2013 Nam T. Nguyen
Distributed under the GPL license version 2 or later.

Changes Copyright 2013 Steven M. Glick
Distributed under the GPL v3 license.
*/

EndOfHeader = 0;
Comment = 1;
CipherID = 2;
CompressionFlags = 3;
MasterSeed = 4;
TransformSeed = 5;
TransformRounds = 6;
EncryptionIV = 7;
ProtectedStreamKey = 8;
StreamStartBytes = 9;
InnerRandomStreamID = 10;

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

// copied from https://developer.mozilla.org/en-US/docs/Using_XPath
function evaluateXPath(aNode, aExpr) {
    var xpe = new XPathEvaluator();
    var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?
      aNode.documentElement : aNode.ownerDocument.documentElement);
    var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
    var found = [];
    var res;
    while (res = result.iterateNext())
        found.push(res);
    return found;
}

function readPassword(password) {
    return CryptoJS.SHA256(password);
}

function readKeyFile(dataView) {
    var file_data = dataView.getString();
    var xml = (new DOMParser()).parseFromString(file_data, "text/xml");
    var key_data = evaluateXPath(xml, "//KeyFile/Key/Data");
    if (key_data.length > 0) {
        // test XML key file
        key_data = atob(key_data[0].textContent);
        if (key_data.length == 32) {
            key_data = CryptoJS.enc.Latin1.parse(key_data);
        } else {
            key_data = null;
        }
    } else {
        key_data = null;
    }
    if (key_data == null) {
        // not XML key file
        if (file_data.length == 32) {
            // test 32-byte key file
            key_data = CryptoJS.enc.Latin1.parse(file_data);
        } else if (file_data.length == 64) {
            // not 32-byte key, test 64-byte hex encoded
            key_data = CryptoJS.enc.Hex.parse(file_data);
            if (key_data.length != 32) {
                key_data = null;
            }
        }
    }
    if (key_data == null) {
        // not XML and not key file
        key_data = CryptoJS.enc.Latin1.parse(file_data);
        key_data = CryptoJS.SHA256(key_data);
    }
    return key_data;
}

/*Parameters:
    * dataView: a jDataView instance of the byte array
                representing a KeePass file
    * filePasswords: the passwords (array of strings) to open this file*/
function readKeePassFile(dataView, filePasswords) {
    var sig1 = dataView.getUint32();
    var sig2 = dataView.getUint32();
    assert(sig1 == 0x9AA2D903, "Invalid version");
    assert(sig2 == 0xB54BFB67, "Invalid version");
    var fileVersion = dataView.getUint32();
    assert(fileVersion == 0x00030001, "Invalid file version");

    var header = {};
    while (true) {
        var fieldId = dataView.getUint8();
        var fieldSize = dataView.getUint16();
        var data = dataView.getString(fieldSize);
        if (fieldId == EndOfHeader) {
            break;
        }
        switch (fieldId) {
            case TransformRounds:
                var v = new jDataView(data, 0, data.length, true);
                header[fieldId] = v.getUint64();
                break;
            default:
                header[fieldId] = data;
        }
    }
    assert(header[MasterSeed].length == 32,
      "Master seed not 32 bytes");
    assert(header[TransformSeed].length == 32,
      "Transform seed not 32 bytes");
    assert(header[InnerRandomStreamID] == "\x02\x00\x00\x00",
      "Not Salsa20 CrsAlgorithm");
    assert(header[CipherID] == ("\x31\xC1\xF2\xE6\xBF\x71\x43\x50" +
      "\xBE\x58\x05\x21\x6A\xFC\x5A\xFF"), "Not AES");

    var compositeKey = "";
    for (var i = 0; i < filePasswords.length; ++i) {
        var regular = filePasswords[i];
        compositeKey += regular.toString(CryptoJS.enc.Hex);
    }
    compositeKey = CryptoJS.enc.Hex.parse(compositeKey);
    compositeKey = CryptoJS.SHA256(compositeKey).toString(CryptoJS.enc.Hex);
    compositeKey = compositeKey.toString(CryptoJS.enc.Hex);
    var tmpKey = {};
    tmpKey[0] = CryptoJS.enc.Hex.parse(compositeKey.substring(0, 32));
    tmpKey[1] = CryptoJS.enc.Hex.parse(compositeKey.substring(32, 64));
    var key = CryptoJS.enc.Latin1.parse(header[TransformSeed]);
    var iv = CryptoJS.enc.Hex.parse((new Array(16)).join("\x00"));
    for (var i = 0; i < header[TransformRounds]; ++i) {
        for (var j = 0; j < 2; ++j) {
            var encrypted = CryptoJS.AES.encrypt(tmpKey[j], key,
              {
                  mode: CryptoJS.mode.ECB, iv: iv,
                  padding: CryptoJS.pad.NoPadding
              });
            tmpKey[j] = encrypted.ciphertext;
        }
    }
    tmpKey = CryptoJS.enc.Hex.parse(
      tmpKey[0].toString(CryptoJS.enc.Hex) +
      tmpKey[1].toString(CryptoJS.enc.Hex)
    );
    var transformedKey = CryptoJS.SHA256(tmpKey).toString(CryptoJS.enc.Hex);
    var masterSeed = CryptoJS.enc.Latin1.parse(header[MasterSeed]);
    masterSeed = masterSeed.toString(CryptoJS.enc.Hex);
    var combinedKey = CryptoJS.enc.Hex.parse(masterSeed + transformedKey);
    var aesKey = CryptoJS.SHA256(combinedKey);
    var aesIV = CryptoJS.enc.Latin1.parse(header[EncryptionIV]);
    var encryptedData = dataView.getString();
    encryptedData = CryptoJS.enc.Latin1.parse(encryptedData);
    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: encryptedData,
    });
    var decryptedData = CryptoJS.AES.decrypt(cipherParams, aesKey,
      {
          mode: CryptoJS.mode.CBC, iv: aesIV,
          padding: CryptoJS.pad.Pkcs7
      });
    decryptedData = decryptedData.toString(CryptoJS.enc.Latin1);

    dataView = new jDataView(decryptedData, 0, decryptedData.length, true);
    var decryptedStartBytes = dataView.getString(32);
    assert(decryptedStartBytes == header[StreamStartBytes],
      "Start bytes do not match");

    var gzipData = "";
    var blockId = 0;
    while (true) {
        assert(dataView.getUint32() == blockId, "Wrong block from gzip stream");
        ++blockId;
        var blockHash = dataView.getString(32);
        var blockSize = dataView.getUint32();
        if (blockSize == 0) {
            for (var i = 0; i < 32; ++i) {
                assert(blockHash[i] == "\x00", "blockHash not all zeroes");
            }
            break;
        }
        var blockData = dataView.getString(blockSize);
        var computedHash = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(blockData));
        assert(blockHash == computedHash.toString(CryptoJS.enc.Latin1),
          "Block hash does not match");
        gzipData += blockData;
    }
    // ignore first 10 bytes (GZip header)
    gzipData = gzipData.substring(10);
    var xmlData = zip_inflate(gzipData);
    assert(xmlData.indexOf("<?xml") == 0, "XML data is not valid");

    var hashedProtectedStreamKey = CryptoJS.SHA256(
    CryptoJS.enc.Latin1.parse(header[ProtectedStreamKey]));
    hashedProtectedStreamKey = hashedProtectedStreamKey.toString(
      CryptoJS.enc.Latin1);
    assert(hashedProtectedStreamKey.length == 32,
      "hashedProtectedStreamKey invalid");
    var salsaKey = new Array(32);
    for (var i = 0; i < 32; ++i) {
        salsaKey[i] = hashedProtectedStreamKey.charCodeAt(i) & 0xFF;
    }
    var iv = new Uint8Array([0xE8, 0x30, 0x09, 0x4B, 0x97, 0x20, 0x5D, 0x2A]);
    var salsa = new Salsa20(salsaKey, iv);

    var xml = (new DOMParser()).parseFromString(xmlData, "text/xml");
    function keepassGroup(name) {
        this.name = name;
        this.entries = [];
    }
    var skip_keys = ["KPRPC JSON"];
    var groups = [];
    var xmlGroups = evaluateXPath(xml, "//Root/Group/Group");
    for (var i in xmlGroups) {
        var g = new keepassGroup(evaluateXPath(xmlGroups[i], "Name")[0].textContent);
        var xmlEntries = evaluateXPath(xmlGroups[i], "Entry");
        for (var j in xmlEntries) {
            var keys = evaluateXPath(xmlEntries[j], "String/Key");
            var values = evaluateXPath(xmlEntries[j], "String/Value");
            assert(keys.length == values.length, "different key and value sizes");
            var e = {};
            for (var k in keys) {
                if ($.inArray(keys[k].textContent, skip_keys) > -1) {
                    continue;
                }
                key = keys[k].textContent;
                value = values[k].textContent;
                if (values[k].getAttribute("Protected") == "True") {
                    value = atob(value);
                    var xorbuf = salsa.getBytes(value.length);
                    var r = new Array();
                    for (var l = 0; l < value.length; ++l) {
                        r[l] = String.fromCharCode(value.charCodeAt(l) ^ xorbuf[l]);
                    }
                    value = r.join("");
                }
                e[key] = value;
            }
            g.entries.push(e);
        }
        groups.push(g);
    }
    return groups;
}
