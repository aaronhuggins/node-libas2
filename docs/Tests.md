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
;async () => {
  const composer = new core_1.AS2Composer(options)
  composer.setHeaders({ 'fake-header': 'not-a-real-header' })
  composer.setHeaders([{ key: 'fake-header', value: 'not-a-real-header' }])
}
```

should produce a valid AS2 message.

```js
;async () => {
  const composer = new core_1.AS2Composer(options)
  const compiled = await composer.compile()
  const decrypted = await core_1.AS2Crypto.decrypt(compiled, {
    cert: Helpers_1.LIBAS2_CERT,
    key: Helpers_1.LIBAS2_KEY
  })
  const decryptedContent = decrypted.childNodes[0].content.toString('utf8')
  if (decryptedContent !== Helpers_1.LIBAS2_EDI) {
    throw new Error(
      `Mime section not correctly signed.\nExpected: '${Helpers_1.LIBAS2_EDI}'\nReceived: '${decryptedContent}'`
    )
  }
}
```

should make a valid AS2 exchange.

```js
;async () => {
  // Test using ArcESB; this is a Drummond certified product.
  const composer = new core_1.AS2Composer({
    message: options.message,
    agreement: {
      sender: 'libas2community',
      recipient: 'as2testing',
      sign: {
        cert: Helpers_1.LIBAS2_CERT,
        key: Helpers_1.LIBAS2_KEY,
        micalg: core_1.AS2Constants.SIGNING.SHA256
      },
      encrypt: {
        cert: Helpers_1.AS2_TESTING_CERT,
        encryption: core_1.AS2Constants.ENCRYPTION.DES3
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
  })
  const result = await core_1.request(
    await composer.toRequestOptions(
      'https://as2testing.centralus.cloudapp.azure.com/pub/Receive.rsb'
    )
  )
  const mdn = await result.mime()
  const message = await mdn.verify({ cert: Helpers_1.AS2_TESTING_CERT })
  if (!message) {
    throw new Error('Signed MDN could not be verified.')
  }
}
```

<a name="as2crypto"></a>

# AS2Crypto

should decrypt contents of parsed mime message.

```js
;async () => {
  const result = await core_1.AS2Parser.parse(Helpers_1.ENCRYPTED_CONTENT)
  const decrypted = await result.decrypt({
    cert: Helpers_1.LIBAS2_CERT,
    key: Helpers_1.LIBAS2_KEY
  })
  const decryptedContent = decrypted.content.toString('utf8')
  if (decryptedContent !== Helpers_1.LIBAS2_EDI) {
    throw new Error(
      `Mime section not correctly decrypted.\nExpected: '${Helpers_1.LIBAS2_EDI}'\nReceived: '${decryptedContent}'`
    )
  }
}
```

should verify signed contents of parsed mime message.

```js
;async () => {
  const result = await core_1.AS2Parser.parse(Helpers_1.SIGNED_CONTENT)
  const verified = await core_1.AS2Crypto.verify(result, {
    cert: Helpers_1.LIBAS2_CERT
  })
  if (!verified) {
    throw new Error('Mime section could not be verified.')
  }
}
```

<a name="as2disposition"></a>

# AS2Disposition

should construct disposition from plain object options..

```js
;async () => {
  const opts = {
    explanation:
      'Sample explanation. An error or a success message in human readable form might go here.',
    notification: {
      disposition: {
        type: 'automatic-action',
        processed: true
      },
      finalRecipient: 'some-recipient'
    }
  }
  const disposition = new core_1.AS2Disposition(opts)
  const mime = disposition.toMimeNode()
  assert.strictEqual(mime instanceof core_1.AS2MimeNode, true)
}
```

should construct disposition from complete options..

```js
;async () => {
  const opts = {
    explanation:
      'Sample explanation. An error or a success message in human readable form might go here.',
    notification: new AS2Disposition_1.AS2DispositionNotification({
      disposition: {
        type: 'automatic-action',
        processed: true
      },
      finalRecipient: 'some-recipient',
      originalMessageId: core_1.AS2MimeNode.generateMessageId(),
      mdnGateway: 'NOPE.FAKE.NOTREAL',
      receivedContentMic: {
        mic:
          'VGhlc2UgYXJlIHRoZSB2b3lhZ2VzIG9mIHRoZSBzdGFyc2hpcCBFbnRlcnByaXNlLg==',
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
  }
  const disposition = new core_1.AS2Disposition(opts)
  const mime = disposition.toMimeNode()
  assert.strictEqual(mime instanceof core_1.AS2MimeNode, true)
}
```

<a name="as2mimenode"></a>

# AS2MimeNode

should be verified by openssl.

```js
;async () => {
  const smime = new core_1.AS2MimeNode({
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    sign: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY },
    content: Helpers_1.LIBAS2_EDI
  })
  const signed = await smime.build()
  const verified = await Helpers_1.openssl({
    command: 'cms',
    input: signed,
    arguments: {
      verify: true,
      noverify: true,
      certfile: Helpers_1.LIBAS2_CERT_PATH
    }
  })
  if (!verified) {
    throw new Error('Mime section not correctly signed.')
  }
}
```

should be decrypted by openssl.

```js
;async () => {
  const smime = new core_1.AS2MimeNode({
    filename: 'message.edi',
    contentType: 'application/edi-x12',
    sign: { cert: Helpers_1.LIBAS2_CERT, key: Helpers_1.LIBAS2_KEY },
    encrypt: {
      cert: Helpers_1.LIBAS2_CERT,
      encryption: core_1.AS2Constants.ENCRYPTION._3DES
    },
    content: Helpers_1.LIBAS2_EDI
  })
  const encrypted = await smime.build()
  const output = await Helpers_1.openssl({
    command: 'cms',
    input: encrypted,
    arguments: {
      decrypt: true,
      recip: Helpers_1.LIBAS2_CERT_PATH,
      inkey: Helpers_1.LIBAS2_KEY_PATH,
      des3: true
    }
  })
  const parsed = await core_1.AS2Parser.parse(output)
  const opensslContent = parsed.childNodes[0].content.toString('utf8')
  if (opensslContent !== Helpers_1.LIBAS2_EDI) {
    throw new Error(
      `Mime section not correctly encrypted.\nExpected: '${Helpers_1.LIBAS2_EDI}'\nReceived: '${opensslContent}'`
    )
  }
}
```

<a name="as2parser"></a>

# AS2Parser

should parse mime message to AS2MimeNode and match parsed contents.

```js
;async () => {
  const result = await core_1.AS2Parser.parse(Helpers_1.ENCRYPTED_CONTENT)
  if (!(result instanceof core_1.AS2MimeNode)) {
    throw new Error(
      `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`
    )
  }
  if (Helpers_1.ENCRYPTED_CONTENT !== result.raw) {
    throw new Error(
      `Mime section not correctly parsed.\nExpected: '${Helpers_1.ENCRYPTED_CONTENT}'\nReceived: '${result.raw}'`
    )
  }
}
```

should parse stream to AS2MimeNode.

```js
;async () => {
  const stream = new stream_1.Duplex()
  stream.push(Helpers_1.ENCRYPTED_CONTENT)
  stream.push(null)
  const result = await core_1.AS2Parser.parse(stream)
  if (!(result instanceof core_1.AS2MimeNode)) {
    throw new Error(
      `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`
    )
  }
  if (Helpers_1.ENCRYPTED_CONTENT !== result.raw) {
    throw new Error(
      `Mime section not correctly parsed.\nExpected: '${Helpers_1.ENCRYPTED_CONTENT}'\nReceived: '${result.raw}'`
    )
  }
}
```

should parse mdn to AS2MimeNode and generate an AS2Disposition.

```js
;async () => {
  const result = await core_1.AS2Parser.parse(Helpers_1.SIGNED_MDN)
  if (!(result instanceof core_1.AS2MimeNode)) {
    throw new Error(
      `Result was not an AS2MimeNode.\nExpected: 'AS2MimeNode'\nReceived: '${result.constructor.name}'`
    )
  }
  // console.log(result)
  const mdn = new core_1.AS2Disposition(result)
  if (result.messageId() !== mdn.messageId) {
    throw new Error(
      `Mime section not correctly parsed.\nExpected: '${result.messageId()}'\nReceived: '${
        mdn.messageId
      }'`
    )
  }
}
```
