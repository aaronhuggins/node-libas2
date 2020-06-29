# TOC
   - [AS2Composer](#as2composer)
   - [AS2Crypto](#as2crypto)
   - [AS2Disposition](#as2disposition)
   - [AS2MimeNode](#as2mimenode)
   - [AS2Parser](#as2parser)
<a name=""></a>
 
<a name="as2composer"></a>
# AS2Composer
should set headers on AS2 message without error.

```js
async () => {
        const composer = new core_1.AS2Composer(options);
        composer.setHeaders({ 'fake-header': 'not-a-real-header' });
        composer.setHeaders([{ key: 'fake-header', value: 'not-a-real-header' }]);
    }
```

should produce a valid AS2 message.

```js
async () => {
        const composer = new core_1.AS2Composer(options);
        const compiled = await composer.compile();
        const decrypted = await core_1.AS2Crypto.decrypt(compiled, {
            cert: Helpers_1.LIBAS2_CERT,
            key: Helpers_1.LIBAS2_KEY
        });
        const decryptedContent = decrypted.childNodes[0].content.toString('utf8');
        assert.strictEqual(decryptedContent, Helpers_1.LIBAS2_EDI);
    }
```

should make a valid AS2 exchange.

```js
async () => {
        // AS2 testing server is only available between 5:30 AM and 7 PM, Central time.
        // Main development takes place in time zone America/Chicago.
        const now = luxon_1.DateTime.utc().setZone('America/Chicago');
        const startTime = now.set({ hour: 5, minute: 30, second: 0 });
        const endTime = now.set({ hour: 19, minute: 0, second: 0 });
        const inServiceHours = now > startTime && now < endTime;
        if (!inServiceHours) {
            // If now is outside the service hours, nock is used to provide a pre-defined mdn.
            const [headers, ...body] = Helpers_1.SIGNED_MDN.split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu);
            nock('https://as2testing.centralus.cloudapp.azure.com')
                .post('/pub/Receive.rsb')
                .reply(200, body.join('').trimLeft(), Helpers_2.parseHeaderString(headers));
        }
        // Test using ArcESB; this is a Drummond certified product.
        const composer = new core_1.AS2Composer({
            message: options.message,
            agreement: {
                sender: 'libas2community',
                recipient: 'as2testing',
                sign: {
                    cert: Helpers_1.LIBAS2_CERT,
                    key: Helpers_1.LIBAS2_KEY,
                    algorithm: core_1.AS2Constants.SIGNING.SHA256
                },
                encrypt: {
                    cert: Helpers_1.AS2_TESTING_CERT,
                    encryption: core_1.AS2Constants.ENCRYPTION.AES128
                },
                mdn: {
                    to: 'mycompanyAS2@example-message.net',
                    sign: {
                        importance: 'required',
                        protocol: 'pkcs7-signature',
                        micalg: core_1.AS2Constants.SIGNING.SHA256
                    }
                }
            }
        });
        const result = await core_1.request(await composer.toRequestOptions('https://as2testing.centralus.cloudapp.azure.com/pub/Receive.rsb'));
        const mdn = inServiceHours
            ? await result.mime()
            : await AS2Parser_1.AS2Parser.parse({
                headers: result.rawHeaders,
                content: result.rawBody
            });
        const message = await mdn.verify({ cert: Helpers_1.AS2_TESTING_CERT });
        assert.strictEqual(message instanceof core_1.AS2MimeNode, true, 'Signed MDN could not be verified.');
    }
```

<a name="as2crypto"></a>
# AS2Crypto
should decrypt contents of parsed mime message.

```js
async () => {
        const result = await core_1.AS2Parser.parse(Helpers_1.ENCRYPTED_CONTENT);
        const decrypted = await result.decrypt({
            cert: Helpers_1.LIBAS2_CERT,
            key: Helpers_1.LIBAS2_KEY
        });
        const decryptedContent = decrypted.content.toString('utf8');
        assert.strictEqual(decryptedContent, Helpers_1.LIBAS2_EDI);
    }
```

should verify signed contents of parsed mime message.

```js
async () => {
        const result = await core_1.AS2Parser.parse(Helpers_1.SIGNED_CONTENT);
        const verified = await core_1.AS2Crypto.verify(result, { cert: Helpers_1.LIBAS2_CERT });
        assert.strictEqual(verified, true, 'Mime section could not be verified.');
    }
```

should verify cms message produced by openssl.

```js
async () => {
        /*
         * Issue: https://github.com/ahuggins-nhs/node-libas2/issues/9
         * Payload MUST be canonicalized to CRLF in order for libraries to verify.
         * OpenSSL command line will ALWAYS canonicalize payloads as a convenience.
         * Thus, if "echo Something to Sign > payload" is ran on Linux, OpenSSL will
         * sign different content then what is read in by Javascript.
         * This is the reason that an SMIME signature or a signature with the payload
         * attached can be verified; the content accompanies the signature in the
         * form it was signed.
         */
        fs_1.writeFileSync('test/temp-data/payload', 'Something to Sign\r\n');
        await Helpers_1.openssl({
            command: 'req',
            arguments: {
                new: true,
                x509: true,
                nodes: true,
                keyout: 'test/temp-data/x509.key',
                out: 'test/temp-data/x509.pub',
                subj: '/CN=SampleCert'
            }
        });
        await Helpers_1.openssl({
            command: 'cms',
            arguments: {
                sign: true,
                signer: 'test/temp-data/x509.pub',
                inkey: 'test/temp-data/x509.key',
                outform: 'DER',
                out: 'test/temp-data/signature-cms.bin',
                in: 'test/temp-data/payload'
            }
        });
        const osslVerified = await Helpers_1.openssl({
            command: 'cms',
            arguments: {
                verify: true,
                CAfile: 'test/temp-data/x509.pub',
                inkey: 'test/temp-data/x509.pub',
                inform: 'DER',
                in: 'test/temp-data/signature-cms.bin',
                content: 'test/temp-data/payload'
            }
        });
        assert.strictEqual(osslVerified, true, 'OpenSSL verification');
        const certAsPem = fs_1.readFileSync('test/temp-data/x509.pub');
        const payloadAsBin = fs_1.readFileSync('test/temp-data/payload');
        const sig_as_der = fs_1.readFileSync('test/temp-data/signature-cms.bin');
        const signedData = new AS2SignedData_1.AS2SignedData(payloadAsBin, sig_as_der);
        const pkijsVerified = await signedData.verify(certAsPem);
        assert.strictEqual(pkijsVerified, true, 'PKIjs verification');
    }
```

should look up cms oid info by name and id.

```js
const byId = core_1.objectIds.byId('1.2.840.113549.1.7.1');
const byName = core_1.objectIds.byName('encryptedData');
const objectId = new core_1.ObjectID({ id: '1.2.840.113549.1.7.6' });
const exists = core_1.objectIds.has('unreal');
assert.strictEqual(byId.name, 'data');
assert.strictEqual(byName.id, '1.2.840.113549.1.7.6');
assert.strictEqual(objectId.name, 'encryptedData');
assert.strictEqual(exists, false);
assert.throws(() => {
    new core_1.ObjectID({});
});
```

should parse a pem file to der and infer type.

```js
const undefinedOrNullPem = new core_1.PemFile(null);
const keyPem = new core_1.PemFile(Helpers_1.LIBAS2_KEY.replace('PRIVATE KEY', 'PUBLIC KEY'));
const certificateDerPem = Buffer.from(Helpers_1.LIBAS2_CERT.split('\n') // Split on new line
    .filter(line => !line.includes('-BEGIN') && !line.includes('-END')) // Remove header/trailer
    .map(line => line.trim()) // Trim extra white space
    .join(''), 'base64');
const fromDerPem = core_1.PemFile.fromDer(certificateDerPem, 'CERTIFICATE');
assert.strictEqual(fromDerPem.data instanceof ArrayBuffer, true);
assert.strictEqual(keyPem.type, 'PUBLIC_KEY');
assert.strictEqual(typeof undefinedOrNullPem.type, 'undefined');
assert.doesNotThrow(() => {
    core_1.PemFile.fromDer(certificateDerPem);
});
```

should throw error on compression methods.

```js
async () => {
        await assert.rejects(async () => {
            await core_1.AS2Crypto.compress(new core_1.AS2MimeNode({}), {});
        });
        await assert.rejects(async () => {
            await core_1.AS2Crypto.decompress(new core_1.AS2MimeNode({}), {});
        });
    }
```

<a name="as2disposition"></a>
# AS2Disposition
should construct disposition from plain object options..

```js
async () => {
        const opts = {
            explanation: 'Sample explanation. An error or a success message in human readable form might go here.',
            notification: {
                disposition: {
                    type: 'automatic-action',
                    processed: true
                },
                finalRecipient: 'some-recipient'
            }
        };
        const disposition = new core_1.AS2Disposition(opts);
        const mime = disposition.toMimeNode();
        assert.strictEqual(mime instanceof core_1.AS2MimeNode, true);
    }
```

should construct disposition from complete options..

```js
async () => {
        const opts = {
            explanation: 'Sample explanation. An error or a success message in human readable form might go here.',
            notification: new core_1.AS2DispositionNotification({
                disposition: {
                    type: 'automatic-action',
                    processed: true
                },
                finalRecipient: 'some-recipient',
                originalMessageId: core_1.AS2MimeNode.generateMessageId(),
                mdnGateway: 'NOPE.FAKE.NOTREAL',
                receivedContentMic: {
                    mic: 'VGhlc2UgYXJlIHRoZSB2b3lhZ2VzIG9mIHRoZSBzdGFyc2hpcCBFbnRlcnByaXNlLg==',
                    algorithm: core_1.AS2Constants.SIGNING.SHA256
                },
                headers: {
                    'X-CUSTOM-DATA': 'Some MDNs might have custom headers.'
                }
            }),
            returned: new core_1.AS2MimeNode({
                content: 'Example',
                contentType: 'text/plain'
            })
        };
        const disposition = new core_1.AS2Disposition(opts);
        const mime = disposition.toMimeNode();
        assert.strictEqual(mime instanceof core_1.AS2MimeNode, true);
    }
```

should derive disposition from incoming disposition.

```js
async () => {
        const mime = await AS2Parser_1.AS2Parser.parse(Helpers_1.SIGNED_MDN);
        const disposition = await mime.dispositionIn({ cert: Helpers_1.AS2_TESTING_CERT });
        assert.strictEqual(disposition instanceof core_1.AS2Disposition, true);
        await assert.rejects(async () => {
            await core_1.AS2Disposition.incoming(mime, { cert: Helpers_1.LIBAS2_CERT });
        });
        await assert.rejects(async () => {
            await core_1.AS2Disposition.incoming(null, { cert: Helpers_1.LIBAS2_CERT });
        });
    }
```

should generate outgoing disposition from incoming message.

```js
async () => {
        // Fake header is only for testing purposes; real AS2 messages should already posess this header.
        const fakeAs2Header = 'AS2-To: fake@recipient.unreal\r\n';
        const mime = await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.SIGNED_CONTENT);
        const dispositionSignedMime = await mime.dispositionOut({
            returnNode: true,
            signDisposition: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY },
            signed: { cert: Helpers_1.LIBAS2_CERT }
        });
        await core_1.AS2Disposition.outgoing({
            node: await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.MIME_CONTENT)
        });
        await core_1.AS2Disposition.outgoing({
            node: await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.ENCRYPTED_CONTENT),
            encrypted: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY }
        });
        // Force a disposition decryption failure message
        await core_1.AS2Disposition.outgoing({
            node: await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.ENCRYPTED_CONTENT),
            encrypted: { cert: Helpers_1.AS2_TESTING_CERT, key: Helpers_1.LIBAS2_CERT }
        });
        // Force a disposition verification failure message
        await core_1.AS2Disposition.outgoing({
            node: await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.SIGNED_CONTENT),
            signed: { cert: Helpers_1.AS2_TESTING_CERT }
        });
        // Force a disposition generic failure message
        await core_1.AS2Disposition.outgoing({
            node: await AS2Parser_1.AS2Parser.parse(fakeAs2Header + Helpers_1.MIME_CONTENT),
            signed: { cert: Helpers_1.AS2_TESTING_CERT }
        });
        assert.strictEqual(dispositionSignedMime instanceof core_1.AS2MimeNode, true);
        await assert.rejects(async () => {
            await core_1.AS2Disposition.outgoing({ node: null });
        });
        await assert.rejects(async () => {
            await core_1.AS2Disposition.outgoing({
                node: await AS2Parser_1.AS2Parser.parse(Helpers_1.SIGNED_CONTENT)
            });
        });
    }
```

<a name="as2mimenode"></a>
# AS2MimeNode
should be verified by openssl.

```js
async () => {
        const smime = new core_1.AS2MimeNode({
            filename: 'message.edi',
            contentType: 'application/edi-x12',
            sign: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY },
            content: Helpers_1.LIBAS2_EDI
        });
        const signed = await smime.build();
        const verified = await Helpers_1.openssl({
            command: 'cms',
            input: signed,
            arguments: {
                verify: true,
                noverify: true,
                certfile: Helpers_1.LIBAS2_CERT_PATH
            }
        });
        assert.strictEqual(verified, true, 'Mime section not correctly signed.');
    }
```

should be decrypted by openssl.

```js
async () => {
        const smime = new core_1.AS2MimeNode({
            filename: 'message.edi',
            contentType: 'application/edi-x12',
            sign: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY },
            encrypt: {
                cert: Helpers_1.LIBAS2_CERT,
                encryption: core_1.AS2Constants.ENCRYPTION.AES128
            },
            content: Helpers_1.LIBAS2_EDI
        });
        const encrypted = await smime.build();
        const output = await Helpers_1.openssl({
            command: 'cms',
            input: encrypted,
            arguments: {
                decrypt: true,
                recip: Helpers_1.LIBAS2_CERT_PATH,
                inkey: Helpers_1.LIBAS2_KEY_PATH,
                des3: true
            }
        });
        const parsed = await core_1.AS2Parser.parse(output);
        const opensslContent = parsed.childNodes[0].content.toString('utf8');
        assert.strictEqual(opensslContent, Helpers_1.LIBAS2_EDI);
    }
```

should pass helper tests.

```js
const reportNode = core_1.getReportNode(null);
const parseHeaderResult = core_1.parseHeaderString(null);
const parseHeaderMultiple = core_1.parseHeaderString(`Header: 1\r\n
      Header: 2\r\n
      Header: 3\r\n`, true);
assert.strictEqual(typeof reportNode === 'undefined', true);
assert.deepStrictEqual(parseHeaderResult, {});
assert.deepStrictEqual(parseHeaderMultiple, { header: ['1', '2', '3'] });
assert.throws(() => {
    core_1.getProtocol(null);
});
```

<a name="as2parser"></a>
# AS2Parser
should parse mime message to AS2MimeNode and match parsed contents.

```js
async () => {
        const result = await core_1.AS2Parser.parse(Helpers_1.ENCRYPTED_CONTENT);
        if (!(result instanceof core_1.AS2MimeNode)) {
            throw new Error(`Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`);
        }
        assert.strictEqual(result.raw, Helpers_1.ENCRYPTED_CONTENT);
    }
```

should parse stream to AS2MimeNode.

```js
async () => {
        const stream = new stream_1.Duplex();
        stream.push(Helpers_1.ENCRYPTED_CONTENT);
        stream.push(null);
        const result = await core_1.AS2Parser.parse(stream);
        assert.strictEqual(result instanceof core_1.AS2MimeNode, true, `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`);
    }
```

should parse options to AS2MimeNode.

```js
async () => {
        const [headers, ...body] = Helpers_1.ENCRYPTED_CONTENT.split(/(\r\n|\n\r|\n)(\r\n|\n\r|\n)/gu);
        const stream = new stream_1.Duplex();
        stream.push(body.join('').trimLeft());
        stream.push(null);
        // Should handle header object like Node IncomingMessage.headers
        const resultWithHeaderObject = await core_1.AS2Parser.parse({
            headers: core_1.parseHeaderString(headers),
            content: stream
        });
        // Should handle header object like Node IncomingMessage.rawHeaders
        const resultWithHeaderArray = await core_1.AS2Parser.parse({
            headers: headers
                .replace(/(\r\n|\n\r|\n)( |\t)/gu, ' ')
                .split(/\n|: /gu)
                .map(line => line.trim())
                .filter(line => line !== ''),
            content: body.join('').trimLeft()
        });
        assert.strictEqual(resultWithHeaderObject instanceof core_1.AS2MimeNode, true);
        assert.strictEqual(resultWithHeaderArray instanceof core_1.AS2MimeNode, true);
    }
```

should parse mdn to AS2MimeNode and generate an AS2Disposition.

```js
async () => {
        const result = await core_1.AS2Parser.parse(Helpers_1.SIGNED_MDN);
        assert.strictEqual(result instanceof core_1.AS2MimeNode, true, `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`);
        const mdn = new core_1.AS2Disposition(result);
        assert.strictEqual(result.messageId(), mdn.messageId);
    }
```

