## Classes

<dl>
<dt><a href="#AS2Agreement">AS2Agreement</a></dt>
<dd><p>Class for describing and handling partner agreements.</p></dd>
<dt><a href="#AS2Composer">AS2Composer</a></dt>
<dd><p>Class for composing AS2 messages.</p></dd>
<dt><a href="#AS2Crypto">AS2Crypto</a></dt>
<dd><p>Class for cryptography methods supported by AS2.</p></dd>
<dt><a href="#PemFile">PemFile</a></dt>
<dd><p>Method for constructing an object from PEM data.</p></dd>
<dt><a href="#AS2Disposition">AS2Disposition</a></dt>
<dd><p>Class for describing and constructing a Message Disposition Notification.</p></dd>
<dt><a href="#AS2DispositionNotification">AS2DispositionNotification</a></dt>
<dd><p>Class for dealing with disposition notification headers.</p></dd>
<dt><a href="#AS2MimeNode">AS2MimeNode</a></dt>
<dd><p>Class for describing and constructing a MIME document.</p></dd>
<dt><a href="#AS2Parser">AS2Parser</a></dt>
<dd><p>Class for parsing a MIME document to an AS2MimeNode tree.</p></dd>
</dl>

## Objects

<dl>
<dt><a href="#PEM_FILETYPE">PEM_FILETYPE</a> : <code>object</code></dt>
<dd><p>Constants used in libas2.</p></dd>
<dt><a href="#AS2Constants">AS2Constants</a> : <code>object</code></dt>
<dd><p>Constants used in libas2.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#getReportNode">getReportNode(node)</a> ⇒ <code><a href="#AS2MimeNode">AS2MimeNode</a></code></dt>
<dd><p>Get the multipart/report disposition-notification, if any.</p></dd>
<dt><a href="#isMdn">isMdn(node)</a> ⇒ <code>boolean</code></dt>
<dd><p>Answers if the AS2MimeNode is a Message Disposition Notification.</p></dd>
<dt><a href="#parseHeaderString">parseHeaderString(headers, [keyToLowerCase], [callback])</a> ⇒ <code>object</code></dt>
<dd><p>Method for converting a string of headers into key:value pairs.</p></dd>
<dt><a href="#getProtocol">getProtocol(url)</a> ⇒ <code>string</code></dt>
<dd><p>Method for retrieving the protocol of a URL, dynamically.</p></dd>
<dt><a href="#isNullOrUndefined">isNullOrUndefined(value)</a> ⇒ <code>boolean</code></dt>
<dd><p>Convenience method for null-checks.</p></dd>
<dt><a href="#isSMime">isSMime(value)</a> ⇒ <code>boolean</code></dt>
<dd><p>Determine if a given string is one of PKCS7 MIME types.</p></dd>
<dt><a href="#canonicalTransform">canonicalTransform(node)</a></dt>
<dd><p>Transforms a payload into a canonical text format per RFC 5751 section 3.1.1.</p></dd>
<dt><a href="#getSigningOptions">getSigningOptions(sign)</a> ⇒ <code><a href="#SigningOptions">SigningOptions</a></code></dt>
<dd><p>Normalizes certificate signing options.</p></dd>
<dt><a href="#getEncryptionOptions">getEncryptionOptions(encrypt)</a> ⇒ <code><a href="#EncryptionOptions">EncryptionOptions</a></code></dt>
<dd><p>Normalizes encryption options.</p></dd>
<dt><a href="#getAgreementOptions">getAgreementOptions(agreement)</a> ⇒ <code><a href="#AS2Agreement">AS2Agreement</a></code></dt>
<dd><p>Normalizes agreement options.</p></dd>
<dt><a href="#request">request(options)</a> ⇒ <code>IncomingMessage</code></dt>
<dd><p>Convenience method for making AS2 HTTP/S requests. Makes a POST request by default.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AS2ComposerOptions">AS2ComposerOptions</a> : <code>object</code></dt>
<dd><p>Options for composing an AS2 message.</p></dd>
<dt><a href="#AgreementOptions">AgreementOptions</a> : <code>object</code></dt>
<dd><p>Options for composing an AS2 message.</p></dd>
<dt><a href="#AS2Signing">AS2Signing</a> : <code>&#x27;sha-1&#x27;</code> | <code>&#x27;sha-256&#x27;</code> | <code>&#x27;sha-384&#x27;</code> | <code>&#x27;sha-512&#x27;</code></dt>
<dd><p>List of supported signing algorithms.</p></dd>
<dt><a href="#AS2Encryption">AS2Encryption</a> : <code>&#x27;des-EDE3-CBC&#x27;</code> | <code>&#x27;aes128-CBC&#x27;</code> | <code>&#x27;aes192-CBC&#x27;</code> | <code>&#x27;aes256-CBC&#x27;</code> | <code>&#x27;aes128-GCM&#x27;</code> | <code>&#x27;aes192-GCM&#x27;</code> | <code>&#x27;aes256-GCM&#x27;</code></dt>
<dd><p>List of supported encryption algorithms.</p></dd>
<dt><a href="#EncryptionOptions">EncryptionOptions</a> : <code>object</code></dt>
<dd><p>Options for encrypting payloads.</p></dd>
<dt><a href="#DecryptionOptions">DecryptionOptions</a> : <code>object</code></dt>
<dd><p>Options for decrypting payloads.</p></dd>
<dt><a href="#SigningOptions">SigningOptions</a> : <code>object</code></dt>
<dd><p>Options for decrypting payloads.</p></dd>
<dt><a href="#VerificationOptions">VerificationOptions</a> : <code>object</code></dt>
<dd><p>Options for decrypting payloads.</p></dd>
<dt><a href="#AS2DispositionOptions">AS2DispositionOptions</a> : <code>object</code></dt>
<dd><p>Options for composing a message disposition notification (MDN).</p></dd>
<dt><a href="#OutgoingDispositionOptions">OutgoingDispositionOptions</a> : <code>object</code></dt>
<dd><p>Options for generating an outgoing MDN.</p></dd>
<dt><a href="#ParseOptions">ParseOptions</a> : <code>object</code></dt>
<dd><p>Options for parsing a MIME document; useful if there is no access to the underlying raw response.</p></dd>
</dl>

<a name="AS2Agreement"></a>

## AS2Agreement

<p>Class for describing and handling partner agreements.</p>

**Kind**: global class  
**Implements**: [<code>AgreementOptions</code>](#AgreementOptions)  
<a name="new_AS2Agreement_new"></a>

### new AS2Agreement(agreement)

| Param     | Type                                               | Description                                                      |
| --------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| agreement | [<code>AgreementOptions</code>](#AgreementOptions) | <p>The partner agreement for sending and receiving over AS2.</p> |

<a name="AS2Composer"></a>

## AS2Composer

<p>Class for composing AS2 messages.</p>

**Kind**: global class

- [AS2Composer](#AS2Composer)
  - [new AS2Composer(options)](#new_AS2Composer_new)
  - [.setAgreement(agreement)](#AS2Composer+setAgreement)
  - [.compile()](#AS2Composer+compile) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.toRequestOptions([url])](#AS2Composer+toRequestOptions) ⇒ <code>Promise.&lt;RequestOptions&gt;</code>

<a name="new_AS2Composer_new"></a>

### new AS2Composer(options)

| Param   | Type                                                   | Description                                    |
| ------- | ------------------------------------------------------ | ---------------------------------------------- |
| options | [<code>AS2ComposerOptions</code>](#AS2ComposerOptions) | <p>The options for composing AS2 messages.</p> |

<a name="AS2Composer+setAgreement"></a>

### aS2Composer.setAgreement(agreement)

<p>Set the agreement for this composer instance.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)

| Param     | Type                                               |
| --------- | -------------------------------------------------- |
| agreement | [<code>AgreementOptions</code>](#AgreementOptions) |

<a name="AS2Composer+compile"></a>

### aS2Composer.compile() ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Compile the composed message into an instance of AS2MimeNode.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>This composer instance as an AS2MimeNode.</p>  
<a name="AS2Composer+toRequestOptions"></a>

### aS2Composer.toRequestOptions([url]) ⇒ <code>Promise.&lt;RequestOptions&gt;</code>

<p>Create a Node.js-compatible RequestOptions object from the composed message.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)  
**Returns**: <code>Promise.&lt;RequestOptions&gt;</code> - <p>This composer instance as request options for Node.js.</p>

| Param | Type                | Description                                                                                                              |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [url] | <code>string</code> | <p>Optional: The URL of the AS2 endpoint receiving this AS2 message; will use agreement partner url if not provided.</p> |

<a name="AS2Crypto"></a>

## AS2Crypto

<p>Class for cryptography methods supported by AS2.</p>

**Kind**: global class

- [AS2Crypto](#AS2Crypto)
  - [.generateUniqueId()](#AS2Crypto.generateUniqueId) ⇒ <code>string</code>
  - [.decrypt(node, options)](#AS2Crypto.decrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.encrypt(node, options)](#AS2Crypto.encrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.verify(node, options, [getDigest])](#AS2Crypto.verify) ⇒ <code>Promise.&lt;(boolean\|object)&gt;</code>
  - [.sign(node, options)](#AS2Crypto.sign) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.compress()](#AS2Crypto.compress)
  - [.decompress()](#AS2Crypto.decompress)

<a name="AS2Crypto.generateUniqueId"></a>

### AS2Crypto.generateUniqueId() ⇒ <code>string</code>

<p>Crux to generate UUID-like random strings</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: <code>string</code> - <p>A UUID-like random string.</p>  
<a name="AS2Crypto.decrypt"></a>

### AS2Crypto.decrypt(node, options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Method to decrypt an AS2MimeNode from a PKCS7 encrypted AS2MimeNode.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The decrypted MIME as an AS2MimeNode.</p>

| Param   | Type                                                 | Description                                 |
| ------- | ---------------------------------------------------- | ------------------------------------------- |
| node    | [<code>AS2MimeNode</code>](#AS2MimeNode)             | <p>The AS2MimeNode to decrypt.</p>          |
| options | [<code>DecryptionOptions</code>](#DecryptionOptions) | <p>Options to decrypt the MIME message.</p> |

<a name="AS2Crypto.encrypt"></a>

### AS2Crypto.encrypt(node, options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Method to envelope an AS2MimeNode in an encrypted AS2MimeNode.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The encrypted MIME as an AS2MimeNode.</p>

| Param   | Type                                                 | Description                                 |
| ------- | ---------------------------------------------------- | ------------------------------------------- |
| node    | [<code>AS2MimeNode</code>](#AS2MimeNode)             | <p>The AS2MimeNode to encrypt.</p>          |
| options | [<code>EncryptionOptions</code>](#EncryptionOptions) | <p>Options to encrypt the MIME message.</p> |

<a name="AS2Crypto.verify"></a>

### AS2Crypto.verify(node, options, [getDigest]) ⇒ <code>Promise.&lt;(boolean\|object)&gt;</code>

<p>Method to verify data has not been modified from a signature.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: <code>Promise.&lt;(boolean\|object)&gt;</code> - <p>A boolean or digest object indicating if the message was verified.</p>

| Param       | Type                                                     | Description                                                                           |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| node        | [<code>AS2MimeNode</code>](#AS2MimeNode)                 | <p>The AS2MimeNode to verify.</p>                                                     |
| options     | [<code>VerificationOptions</code>](#VerificationOptions) | <p>Options to verify the MIME message.</p>                                            |
| [getDigest] | <code>boolean</code>                                     | <p>Optional argument to return a message digest if verified instead of a boolean.</p> |

<a name="AS2Crypto.sign"></a>

### AS2Crypto.sign(node, options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Method to sign data against a certificate and key pair.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The signed MIME as a multipart AS2MimeNode.</p>

| Param   | Type                                                 | Description                              |
| ------- | ---------------------------------------------------- | ---------------------------------------- |
| node    | [<code>AS2MimeNode</code>](#AS2MimeNode)             | <p>The AS2MimeNode to sign.</p>          |
| options | [<code>EncryptionOptions</code>](#EncryptionOptions) | <p>Options to sign the MIME message.</p> |

<a name="AS2Crypto.compress"></a>

### AS2Crypto.compress()

<p>Not yet implemented; do not use.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Throws**:

- <p>ERROR.NOT_IMPLEMENTED</p>

<a name="AS2Crypto.decompress"></a>

### AS2Crypto.decompress()

<p>Not yet implemented; do not use.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Throws**:

- <p>ERROR.NOT_IMPLEMENTED</p>

<a name="PemFile"></a>

## PemFile

<p>Method for constructing an object from PEM data.</p>

**Kind**: global class

- [PemFile](#PemFile)
  - [new PemFile(data)](#new_PemFile_new)
  - [.fromDer(data, [type])](#PemFile.fromDer) ⇒ [<code>PemFile</code>](#PemFile)

<a name="new_PemFile_new"></a>

### new PemFile(data)

| Param | Type                                                                           | Description                                    |
| ----- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| data  | <code>string</code> \| <code>Buffer</code> \| [<code>PemFile</code>](#PemFile) | <p>Data for constructing a PemFile object.</p> |

<a name="PemFile.fromDer"></a>

### PemFile.fromDer(data, [type]) ⇒ [<code>PemFile</code>](#PemFile)

<p>Convenience method for creating a PemFile from a DER/BER Buffer.</p>

**Kind**: static method of [<code>PemFile</code>](#PemFile)  
**Returns**: [<code>PemFile</code>](#PemFile) - <p>The data as a PemFile object.</p>

| Param  | Type                     | Default                          | Description                         |
| ------ | ------------------------ | -------------------------------- | ----------------------------------- |
| data   | <code>Buffer</code>      |                                  | <p>DER or BER data in a Buffer.</p> |
| [type] | <code>PemFileType</code> | <code>&#x27;UNKNOWN&#x27;</code> | <p>The type of PEM file.</p>        |

<a name="AS2Disposition"></a>

## AS2Disposition

<p>Class for describing and constructing a Message Disposition Notification.</p>

**Kind**: global class

- [AS2Disposition](#AS2Disposition)
  - _instance_
    - [.toMimeNode()](#AS2Disposition+toMimeNode) ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)
  - _static_
    - [.outgoing(options)](#AS2Disposition.outgoing) ⇒ <code>Promise.&lt;object&gt;</code>
    - [.incoming(node, [signed])](#AS2Disposition.incoming) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)

<a name="AS2Disposition+toMimeNode"></a>

### aS2Disposition.toMimeNode() ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)

<p>This instance to an AS2MimeNode.</p>

**Kind**: instance method of [<code>AS2Disposition</code>](#AS2Disposition)  
**Returns**: [<code>AS2MimeNode</code>](#AS2MimeNode) - <ul>

<li>An MDN as an AS2MimeNode.</li>
</ul>  
<a name="AS2Disposition.outgoing"></a>

### AS2Disposition.outgoing(options) ⇒ <code>Promise.&lt;object&gt;</code>

<p>Convenience method to decrypt and/or verify a mime node and construct an outgoing message disposition.</p>

**Kind**: static method of [<code>AS2Disposition</code>](#AS2Disposition)  
**Returns**: <code>Promise.&lt;object&gt;</code> - <ul>

<li>The content node, disposition object, and the generated outgoing MDN as an AS2MimeNode.</li>
</ul>

| Param   | Type                                                                   | Description                                        |
| ------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| options | [<code>OutgoingDispositionOptions</code>](#OutgoingDispositionOptions) | <p>The options for generating an outgoing MDN.</p> |

<a name="AS2Disposition.incoming"></a>

### AS2Disposition.incoming(node, [signed]) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)

<p>Deconstruct a mime node into an incoming message disposition.</p>

**Kind**: static method of [<code>AS2Disposition</code>](#AS2Disposition)  
**Returns**: [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition) - <p>The incoming message disposition notification.</p>

| Param    | Type                                                     | Description                                        |
| -------- | -------------------------------------------------------- | -------------------------------------------------- |
| node     | [<code>AS2MimeNode</code>](#AS2MimeNode)                 | <p>An AS2MimeNode containing an incoming MDN.</p>  |
| [signed] | [<code>VerificationOptions</code>](#VerificationOptions) | <p>Options for verifying the MDN if necessary.</p> |

<a name="AS2DispositionNotification"></a>

## AS2DispositionNotification

<p>Class for dealing with disposition notification headers.</p>

**Kind**: global class

- [AS2DispositionNotification](#AS2DispositionNotification)
  - [new AS2DispositionNotification([notification], [notificationType])](#new_AS2DispositionNotification_new)
  - [.toNotification()](#AS2DispositionNotification+toNotification) ⇒ <code>object</code>
  - [.toString()](#AS2DispositionNotification+toString) ⇒ <code>string</code>

<a name="new_AS2DispositionNotification_new"></a>

### new AS2DispositionNotification([notification], [notificationType])

| Param              | Type                                                                   | Default                           | Description                                             |
| ------------------ | ---------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| [notification]     | [<code>AS2DispositionNotification</code>](#AS2DispositionNotification) |                                   | <p>A raw instance of AS2DispositionNotification.</p>    |
| [notificationType] | <code>&#x27;incoming&#x27;</code> \| <code>&#x27;outgoing&#x27;</code> | <code>&#x27;outgoing&#x27;</code> | <p>The type of notification; default is 'outgoing'.</p> |

<a name="AS2DispositionNotification+toNotification"></a>

### aS2DispositionNotification.toNotification() ⇒ <code>object</code>

<p>Converts this instance to a plain key/value-pair object.</p>

**Kind**: instance method of [<code>AS2DispositionNotification</code>](#AS2DispositionNotification)  
**Returns**: <code>object</code> - <p>This instance as key/value pairs.</p>  
<a name="AS2DispositionNotification+toString"></a>

### aS2DispositionNotification.toString() ⇒ <code>string</code>

<p>This instance to a string.</p>

**Kind**: instance method of [<code>AS2DispositionNotification</code>](#AS2DispositionNotification)  
**Returns**: <code>string</code> - <p>a raw string instance.</p>  
<a name="AS2MimeNode"></a>

## AS2MimeNode

<p>Class for describing and constructing a MIME document.</p>

**Kind**: global class

- [AS2MimeNode](#AS2MimeNode)
  - [new AS2MimeNode(options)](#new_AS2MimeNode_new)
  - _instance_
    - [.setSigning(options)](#AS2MimeNode+setSigning)
    - [.setEncryption(options)](#AS2MimeNode+setEncryption)
    - [.setHeader(keyOrHeaders, [value])](#AS2MimeNode+setHeader) ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)
    - [.messageId([create])](#AS2MimeNode+messageId) ⇒ <code>string</code>
    - [.dispositionOut([options])](#AS2MimeNode+dispositionOut) ⇒ <code>Promise.&lt;object&gt;</code>
    - [.dispositionIn([signed])](#AS2MimeNode+dispositionIn) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)
    - [.sign([options])](#AS2MimeNode+sign) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.verify(options)](#AS2MimeNode+verify) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.decrypt(options)](#AS2MimeNode+decrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.encrypt([options])](#AS2MimeNode+encrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.build()](#AS2MimeNode+build) ⇒ <code>Promise.&lt;Buffer&gt;</code>
    - [.buildObject()](#AS2MimeNode+buildObject) ⇒ <code>Promise.&lt;object&gt;</code>
  - _static_
    - [.generateMessageId([sender], [uniqueId])](#AS2MimeNode.generateMessageId) ⇒ <code>string</code>

<a name="new_AS2MimeNode_new"></a>

### new AS2MimeNode(options)

| Param   | Type                            | Description                                     |
| ------- | ------------------------------- | ----------------------------------------------- |
| options | <code>AS2MimeNodeOptions</code> | <p>Options for constructing an AS2 message.</p> |

<a name="AS2MimeNode+setSigning"></a>

### aS2MimeNode.setSigning(options)

<p>Set the signing options for this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)

| Param   | Type                                           | Description                                  |
| ------- | ---------------------------------------------- | -------------------------------------------- |
| options | [<code>SigningOptions</code>](#SigningOptions) | <p>Options for signing this AS2 message.</p> |

<a name="AS2MimeNode+setEncryption"></a>

### aS2MimeNode.setEncryption(options)

<p>Set the encryption options for this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)

| Param   | Type                                                 | Description                                     |
| ------- | ---------------------------------------------------- | ----------------------------------------------- |
| options | [<code>EncryptionOptions</code>](#EncryptionOptions) | <p>Options for encrypting this AS2 message.</p> |

<a name="AS2MimeNode+setHeader"></a>

### aS2MimeNode.setHeader(keyOrHeaders, [value]) ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)

<p>Set one or more headers on this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>AS2MimeNode</code>](#AS2MimeNode) - <p>This AS2MimeNode instance.</p>

| Param        | Type                                    | Description                                                                   |
| ------------ | --------------------------------------- | ----------------------------------------------------------------------------- |
| keyOrHeaders | <code>string</code> \| <code>any</code> | <p>The key name of the header to set or an array of headers.</p>              |
| [value]      | <code>string</code>                     | <p>The value of the header key; required if providing a simple key/value.</p> |

<a name="AS2MimeNode+messageId"></a>

### aS2MimeNode.messageId([create]) ⇒ <code>string</code>

<p>Sets and/or gets the message ID of the MIME message.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: <code>string</code> - <p>The message ID of the MIME.</p>

| Param    | Type                 | Default            | Description                                          |
| -------- | -------------------- | ------------------ | ---------------------------------------------------- |
| [create] | <code>boolean</code> | <code>false</code> | <p>Set the the message ID if one does not exist.</p> |

<a name="AS2MimeNode+dispositionOut"></a>

### aS2MimeNode.dispositionOut([options]) ⇒ <code>Promise.&lt;object&gt;</code>

<p>Convenience method for generating an outgoing MDN for this message.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: <code>Promise.&lt;object&gt;</code> - <p>The content node and the outgoing MDN as an AS2MimeNode.</p>

| Param     | Type                               | Description                                    |
| --------- | ---------------------------------- | ---------------------------------------------- |
| [options] | <code>DispositionOutOptions</code> | <p>Optional options for generating an MDN.</p> |

<a name="AS2MimeNode+dispositionIn"></a>

### aS2MimeNode.dispositionIn([signed]) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)

<p>Convenience method for consuming this instance as an incoming MDN.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition) - <p>This instance as an incoming AS2Disposition.</p>

| Param    | Type                                                     | Description                                        |
| -------- | -------------------------------------------------------- | -------------------------------------------------- |
| [signed] | [<code>VerificationOptions</code>](#VerificationOptions) | <p>Pass verification options for a signed MDN.</p> |

<a name="AS2MimeNode+sign"></a>

### aS2MimeNode.sign([options]) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method for signing this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>This instance as a new signed multipart AS2MimeNode.</p>

| Param     | Type                                           | Description                                                                                            |
| --------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [options] | [<code>SigningOptions</code>](#SigningOptions) | <p>Options for signing this AS2 message; not required if provided when constructing this instance.</p> |

<a name="AS2MimeNode+verify"></a>

### aS2MimeNode.verify(options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method for verifying this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The content part of this signed message as an AS2MimeNode.</p>

| Param   | Type                                                     | Description                                           |
| ------- | -------------------------------------------------------- | ----------------------------------------------------- |
| options | [<code>VerificationOptions</code>](#VerificationOptions) | <p>Options for verifying this signed AS2 message.</p> |

<a name="AS2MimeNode+decrypt"></a>

### aS2MimeNode.decrypt(options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method for decrypting this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The contents of the encrypted message as an AS2MimeNode.</p>

| Param   | Type                                                 | Description                                               |
| ------- | ---------------------------------------------------- | --------------------------------------------------------- |
| options | [<code>DecryptionOptions</code>](#DecryptionOptions) | <p>Options for decrypting this encrypted AS2 message.</p> |

<a name="AS2MimeNode+encrypt"></a>

### aS2MimeNode.encrypt([options]) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method for encrypting this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>This instance as a new encrypted AS2MimeNode.</p>

| Param     | Type                                                 | Description                                                                                               |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [options] | [<code>EncryptionOptions</code>](#EncryptionOptions) | <p>Options for encrypting this AS2 message; not required if provided when constructing this instance.</p> |

<a name="AS2MimeNode+build"></a>

### aS2MimeNode.build() ⇒ <code>Promise.&lt;Buffer&gt;</code>

<p>Constructs a complete S/MIME or MIME buffer from this instance.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: <code>Promise.&lt;Buffer&gt;</code> - <p>This instance as raw, complete S/MIME or MIME buffer.</p>  
<a name="AS2MimeNode+buildObject"></a>

### aS2MimeNode.buildObject() ⇒ <code>Promise.&lt;object&gt;</code>

<p>Method for getting the headers and body of the MIME message as separate properties.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: <code>Promise.&lt;object&gt;</code> - <p>An object with headers and body properties.</p>  
<a name="AS2MimeNode.generateMessageId"></a>

### AS2MimeNode.generateMessageId([sender], [uniqueId]) ⇒ <code>string</code>

<p>Generates a valid, formatted, random message ID.</p>

**Kind**: static method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: <code>string</code> - <p>A valid message ID for use with MIME.</p>

| Param      | Type                | Default                                                | Description                                                    |
| ---------- | ------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| [sender]   | <code>string</code> | <code>&quot;&#x27;&lt;HOST_NAME&gt;&#x27;&quot;</code> | <p>The sender of this ID.</p>                                  |
| [uniqueId] | <code>string</code> |                                                        | <p>A unique ID may be provided if a real GUID is required.</p> |

<a name="AS2Parser"></a>

## AS2Parser

<p>Class for parsing a MIME document to an AS2MimeNode tree.</p>

**Kind**: global class  
<a name="AS2Parser.parse"></a>

### AS2Parser.parse(content) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Parse a raw MIME document into an AS2MimeNode.</p>

**Kind**: static method of [<code>AS2Parser</code>](#AS2Parser)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>The MIME document as an AS2MimeNode.</p>

| Param   | Type                                                                                                            | Description                                       |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| content | <code>Buffer</code> \| <code>Stream</code> \| <code>string</code> \| [<code>ParseOptions</code>](#ParseOptions) | <p>A raw MIME message or ParseOptions object.</p> |

<a name="PEM_FILETYPE"></a>

## PEM_FILETYPE : <code>object</code>

<p>Constants used in libas2.</p>

**Kind**: global namespace

- [PEM_FILETYPE](#PEM_FILETYPE) : <code>object</code>
  - [.CERTIFICATE](#PEM_FILETYPE.CERTIFICATE) : <code>PemFileType</code>
  - [.PRIVATE_KEY](#PEM_FILETYPE.PRIVATE_KEY) : <code>PemFileType</code>
  - [.PUBLIC_KEY](#PEM_FILETYPE.PUBLIC_KEY) : <code>PemFileType</code>

<a name="PEM_FILETYPE.CERTIFICATE"></a>

### PEM_FILETYPE.CERTIFICATE : <code>PemFileType</code>

**Kind**: static constant of [<code>PEM_FILETYPE</code>](#PEM_FILETYPE)  
**Default**: <code>CERTIFICATE</code>  
<a name="PEM_FILETYPE.PRIVATE_KEY"></a>

### PEM_FILETYPE.PRIVATE_KEY : <code>PemFileType</code>

**Kind**: static constant of [<code>PEM_FILETYPE</code>](#PEM_FILETYPE)  
**Default**: <code>PRIVATE_KEY</code>  
<a name="PEM_FILETYPE.PUBLIC_KEY"></a>

### PEM_FILETYPE.PUBLIC_KEY : <code>PemFileType</code>

**Kind**: static constant of [<code>PEM_FILETYPE</code>](#PEM_FILETYPE)  
**Default**: <code>PUBLIC_KEY</code>  
<a name="AS2Constants"></a>

## AS2Constants : <code>object</code>

<p>Constants used in libas2.</p>

**Kind**: global namespace

- [AS2Constants](#AS2Constants) : <code>object</code>
  - [.ENCRYPTION](#AS2Constants.ENCRYPTION) : <code>object</code>
    - [.AES128_CBC](#AS2Constants.ENCRYPTION.AES128_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
    - [.AES192_CBC](#AS2Constants.ENCRYPTION.AES192_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
    - [.AES256_CBC](#AS2Constants.ENCRYPTION.AES256_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
    - [.AES128_GCM](#AS2Constants.ENCRYPTION.AES128_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)
    - [.AES192_GCM](#AS2Constants.ENCRYPTION.AES192_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)
    - [.AES256_GCM](#AS2Constants.ENCRYPTION.AES256_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.ERROR](#AS2Constants.ERROR) : <code>object</code>
    - [.MISSING_PARTNER_CERT](#AS2Constants.ERROR.MISSING_PARTNER_CERT) : <code>string</code>
    - [.MISSING_PARTNER_KEY](#AS2Constants.ERROR.MISSING_PARTNER_KEY) : <code>string</code>
    - [.WRONG_PEM_FILE](#AS2Constants.ERROR.WRONG_PEM_FILE) : <code>string</code>
    - [.FINAL_RECIPIENT_MISSING](#AS2Constants.ERROR.FINAL_RECIPIENT_MISSING) : <code>string</code>
    - [.CONTENT_VERIFY](#AS2Constants.ERROR.CONTENT_VERIFY) : <code>string</code>
    - [.CERT_DECRYPT](#AS2Constants.ERROR.CERT_DECRYPT) : <code>string</code>
    - [.DISPOSITION_NODE](#AS2Constants.ERROR.DISPOSITION_NODE) : <code>string</code>
    - [.NOT_IMPLEMENTED](#AS2Constants.ERROR.NOT_IMPLEMENTED) : <code>string</code>
  - [.EXPLANATION](#AS2Constants.EXPLANATION) : <code>object</code>
    - [.SUCCESS](#AS2Constants.EXPLANATION.SUCCESS) : <code>string</code>
    - [.FAILED_DECRYPTION](#AS2Constants.EXPLANATION.FAILED_DECRYPTION) : <code>string</code>
    - [.FAILED_VERIFICATION](#AS2Constants.EXPLANATION.FAILED_VERIFICATION) : <code>string</code>
    - [.FAILED_GENERALLY](#AS2Constants.EXPLANATION.FAILED_GENERALLY) : <code>string</code>
  - [.SIGNING](#AS2Constants.SIGNING) : <code>object</code>
    - [.SHA1](#AS2Constants.SIGNING.SHA1) : [<code>AS2Signing</code>](#AS2Signing)
    - [.SHA256](#AS2Constants.SIGNING.SHA256) : [<code>AS2Signing</code>](#AS2Signing)
    - [.SHA384](#AS2Constants.SIGNING.SHA384) : [<code>AS2Signing</code>](#AS2Signing)
    - [.SHA512](#AS2Constants.SIGNING.SHA512) : [<code>AS2Signing</code>](#AS2Signing)
  - [.STANDARD_HEADER](#AS2Constants.STANDARD_HEADER) : <code>object</code>
    - [.VERSION](#AS2Constants.STANDARD_HEADER.VERSION) : <code>string</code>
    - [.TO](#AS2Constants.STANDARD_HEADER.TO) : <code>string</code>
    - [.FROM](#AS2Constants.STANDARD_HEADER.FROM) : <code>string</code>
    - [.MDN_TO](#AS2Constants.STANDARD_HEADER.MDN_TO) : <code>string</code>
    - [.MDN_OPTIONS](#AS2Constants.STANDARD_HEADER.MDN_OPTIONS) : <code>string</code>
    - [.MDN_URL](#AS2Constants.STANDARD_HEADER.MDN_URL) : <code>string</code>
  - [.CRLF](#AS2Constants.CRLF) : <code>string</code>
  - [.MIME_VERSION](#AS2Constants.MIME_VERSION) : <code>string</code>
  - [.AS2_VERSION](#AS2Constants.AS2_VERSION) : <code>string</code>
  - [.SMIME_DESC](#AS2Constants.SMIME_DESC) : <code>string</code>
  - [.SIGNATURE_FILENAME](#AS2Constants.SIGNATURE_FILENAME) : <code>string</code>
  - [.ENCRYPTION_FILENAME](#AS2Constants.ENCRYPTION_FILENAME) : <code>string</code>
  - [.LIBRARY_NAME](#AS2Constants.LIBRARY_NAME) : <code>string</code>
  - [.LIBRARY_VERSION](#AS2Constants.LIBRARY_VERSION) : <code>string</code>
  - [.LIBRAY_NAME_VERSION](#AS2Constants.LIBRAY_NAME_VERSION) : <code>string</code>

<a name="AS2Constants.ENCRYPTION"></a>

### AS2Constants.ENCRYPTION : <code>object</code>

<p>Constants used for signing.</p>

**Kind**: static namespace of [<code>AS2Constants</code>](#AS2Constants)

- [.ENCRYPTION](#AS2Constants.ENCRYPTION) : <code>object</code>
  - [.AES128_CBC](#AS2Constants.ENCRYPTION.AES128_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.AES192_CBC](#AS2Constants.ENCRYPTION.AES192_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.AES256_CBC](#AS2Constants.ENCRYPTION.AES256_CBC) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.AES128_GCM](#AS2Constants.ENCRYPTION.AES128_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.AES192_GCM](#AS2Constants.ENCRYPTION.AES192_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)
  - [.AES256_GCM](#AS2Constants.ENCRYPTION.AES256_GCM) : [<code>AS2Encryption</code>](#AS2Encryption)

<a name="AS2Constants.ENCRYPTION.AES128_CBC"></a>

#### ENCRYPTION.AES128_CBC : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes128-CBC</code>  
<a name="AS2Constants.ENCRYPTION.AES192_CBC"></a>

#### ENCRYPTION.AES192_CBC : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes192-CBC</code>  
<a name="AS2Constants.ENCRYPTION.AES256_CBC"></a>

#### ENCRYPTION.AES256_CBC : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes256-CBC</code>  
<a name="AS2Constants.ENCRYPTION.AES128_GCM"></a>

#### ENCRYPTION.AES128_GCM : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes128-GCM</code>  
<a name="AS2Constants.ENCRYPTION.AES192_GCM"></a>

#### ENCRYPTION.AES192_GCM : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes192-GCM</code>  
<a name="AS2Constants.ENCRYPTION.AES256_GCM"></a>

#### ENCRYPTION.AES256_GCM : [<code>AS2Encryption</code>](#AS2Encryption)

**Kind**: static constant of [<code>ENCRYPTION</code>](#AS2Constants.ENCRYPTION)  
**Default**: <code>aes256-GCM</code>  
<a name="AS2Constants.ERROR"></a>

### AS2Constants.ERROR : <code>object</code>

<p>Constants used for signing.</p>

**Kind**: static namespace of [<code>AS2Constants</code>](#AS2Constants)

- [.ERROR](#AS2Constants.ERROR) : <code>object</code>
  - [.MISSING_PARTNER_CERT](#AS2Constants.ERROR.MISSING_PARTNER_CERT) : <code>string</code>
  - [.MISSING_PARTNER_KEY](#AS2Constants.ERROR.MISSING_PARTNER_KEY) : <code>string</code>
  - [.WRONG_PEM_FILE](#AS2Constants.ERROR.WRONG_PEM_FILE) : <code>string</code>
  - [.FINAL_RECIPIENT_MISSING](#AS2Constants.ERROR.FINAL_RECIPIENT_MISSING) : <code>string</code>
  - [.CONTENT_VERIFY](#AS2Constants.ERROR.CONTENT_VERIFY) : <code>string</code>
  - [.CERT_DECRYPT](#AS2Constants.ERROR.CERT_DECRYPT) : <code>string</code>
  - [.DISPOSITION_NODE](#AS2Constants.ERROR.DISPOSITION_NODE) : <code>string</code>
  - [.NOT_IMPLEMENTED](#AS2Constants.ERROR.NOT_IMPLEMENTED) : <code>string</code>

<a name="AS2Constants.ERROR.MISSING_PARTNER_CERT"></a>

#### ERROR.MISSING_PARTNER_CERT : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;Certificate is required for this partner agreement.&quot;</code>  
<a name="AS2Constants.ERROR.MISSING_PARTNER_KEY"></a>

#### ERROR.MISSING_PARTNER_KEY : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;Private key is required for this partner agreement.&quot;</code>  
<a name="AS2Constants.ERROR.WRONG_PEM_FILE"></a>

#### ERROR.WRONG_PEM_FILE : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;The type of pem file provided was not correct;&quot;</code>  
<a name="AS2Constants.ERROR.FINAL_RECIPIENT_MISSING"></a>

#### ERROR.FINAL_RECIPIENT_MISSING : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;AS2 message is missing the AS2-To header, so there is no final recipient which is required.&quot;</code>  
<a name="AS2Constants.ERROR.CONTENT_VERIFY"></a>

#### ERROR.CONTENT_VERIFY : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;Could not verify signature against contents.&quot;</code>  
<a name="AS2Constants.ERROR.CERT_DECRYPT"></a>

#### ERROR.CERT_DECRYPT : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;Certificate provided was not used to encrypt message.&quot;</code>  
<a name="AS2Constants.ERROR.DISPOSITION_NODE"></a>

#### ERROR.DISPOSITION_NODE : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;Mime node must be provided in order to create outgoing disposition.&quot;</code>  
<a name="AS2Constants.ERROR.NOT_IMPLEMENTED"></a>

#### ERROR.NOT_IMPLEMENTED : <code>string</code>

**Kind**: static constant of [<code>ERROR</code>](#AS2Constants.ERROR)  
**Default**: <code>&quot;NOT YET IMPLEMENTED!&quot;</code>  
<a name="AS2Constants.EXPLANATION"></a>

### AS2Constants.EXPLANATION : <code>object</code>

<p>Constants used for signing.</p>

**Kind**: static namespace of [<code>AS2Constants</code>](#AS2Constants)

- [.EXPLANATION](#AS2Constants.EXPLANATION) : <code>object</code>
  - [.SUCCESS](#AS2Constants.EXPLANATION.SUCCESS) : <code>string</code>
  - [.FAILED_DECRYPTION](#AS2Constants.EXPLANATION.FAILED_DECRYPTION) : <code>string</code>
  - [.FAILED_VERIFICATION](#AS2Constants.EXPLANATION.FAILED_VERIFICATION) : <code>string</code>
  - [.FAILED_GENERALLY](#AS2Constants.EXPLANATION.FAILED_GENERALLY) : <code>string</code>

<a name="AS2Constants.EXPLANATION.SUCCESS"></a>

#### EXPLANATION.SUCCESS : <code>string</code>

**Kind**: static constant of [<code>EXPLANATION</code>](#AS2Constants.EXPLANATION)  
**Default**: <code>&quot;The message was received successfully. This is no guarantee that the message contents have been processed.&quot;</code>  
<a name="AS2Constants.EXPLANATION.FAILED_DECRYPTION"></a>

#### EXPLANATION.FAILED_DECRYPTION : <code>string</code>

**Kind**: static constant of [<code>EXPLANATION</code>](#AS2Constants.EXPLANATION)  
**Default**: <code>&quot;The message was received, but could not be decrypted; the contents cannot be processed.&quot;</code>  
<a name="AS2Constants.EXPLANATION.FAILED_VERIFICATION"></a>

#### EXPLANATION.FAILED_VERIFICATION : <code>string</code>

**Kind**: static constant of [<code>EXPLANATION</code>](#AS2Constants.EXPLANATION)  
**Default**: <code>&quot;The message was received, but could not be verified; the contents cannot be trusted to be the same contents that were sent.&quot;</code>  
<a name="AS2Constants.EXPLANATION.FAILED_GENERALLY"></a>

#### EXPLANATION.FAILED_GENERALLY : <code>string</code>

**Kind**: static constant of [<code>EXPLANATION</code>](#AS2Constants.EXPLANATION)  
**Default**: <code>&quot;The message could not be received or processed.&quot;</code>  
<a name="AS2Constants.SIGNING"></a>

### AS2Constants.SIGNING : <code>object</code>

<p>Constants used for signing.</p>

**Kind**: static namespace of [<code>AS2Constants</code>](#AS2Constants)

- [.SIGNING](#AS2Constants.SIGNING) : <code>object</code>
  - [.SHA1](#AS2Constants.SIGNING.SHA1) : [<code>AS2Signing</code>](#AS2Signing)
  - [.SHA256](#AS2Constants.SIGNING.SHA256) : [<code>AS2Signing</code>](#AS2Signing)
  - [.SHA384](#AS2Constants.SIGNING.SHA384) : [<code>AS2Signing</code>](#AS2Signing)
  - [.SHA512](#AS2Constants.SIGNING.SHA512) : [<code>AS2Signing</code>](#AS2Signing)

<a name="AS2Constants.SIGNING.SHA1"></a>

#### SIGNING.SHA1 : [<code>AS2Signing</code>](#AS2Signing)

**Kind**: static constant of [<code>SIGNING</code>](#AS2Constants.SIGNING)  
**Default**: <code>sha-1</code>  
<a name="AS2Constants.SIGNING.SHA256"></a>

#### SIGNING.SHA256 : [<code>AS2Signing</code>](#AS2Signing)

**Kind**: static constant of [<code>SIGNING</code>](#AS2Constants.SIGNING)  
**Default**: <code>sha-256</code>  
<a name="AS2Constants.SIGNING.SHA384"></a>

#### SIGNING.SHA384 : [<code>AS2Signing</code>](#AS2Signing)

**Kind**: static constant of [<code>SIGNING</code>](#AS2Constants.SIGNING)  
**Default**: <code>sha-384</code>  
<a name="AS2Constants.SIGNING.SHA512"></a>

#### SIGNING.SHA512 : [<code>AS2Signing</code>](#AS2Signing)

**Kind**: static constant of [<code>SIGNING</code>](#AS2Constants.SIGNING)  
**Default**: <code>sha-512</code>  
<a name="AS2Constants.STANDARD_HEADER"></a>

### AS2Constants.STANDARD_HEADER : <code>object</code>

<p>Constants used for signing.</p>

**Kind**: static namespace of [<code>AS2Constants</code>](#AS2Constants)

- [.STANDARD_HEADER](#AS2Constants.STANDARD_HEADER) : <code>object</code>
  - [.VERSION](#AS2Constants.STANDARD_HEADER.VERSION) : <code>string</code>
  - [.TO](#AS2Constants.STANDARD_HEADER.TO) : <code>string</code>
  - [.FROM](#AS2Constants.STANDARD_HEADER.FROM) : <code>string</code>
  - [.MDN_TO](#AS2Constants.STANDARD_HEADER.MDN_TO) : <code>string</code>
  - [.MDN_OPTIONS](#AS2Constants.STANDARD_HEADER.MDN_OPTIONS) : <code>string</code>
  - [.MDN_URL](#AS2Constants.STANDARD_HEADER.MDN_URL) : <code>string</code>

<a name="AS2Constants.STANDARD_HEADER.VERSION"></a>

#### STANDARD_HEADER.VERSION : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;AS2-Version&quot;</code>  
<a name="AS2Constants.STANDARD_HEADER.TO"></a>

#### STANDARD_HEADER.TO : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;AS2-To&quot;</code>  
<a name="AS2Constants.STANDARD_HEADER.FROM"></a>

#### STANDARD_HEADER.FROM : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;AS2-From&quot;</code>  
<a name="AS2Constants.STANDARD_HEADER.MDN_TO"></a>

#### STANDARD_HEADER.MDN_TO : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;Disposition-Notification-To&quot;</code>  
<a name="AS2Constants.STANDARD_HEADER.MDN_OPTIONS"></a>

#### STANDARD_HEADER.MDN_OPTIONS : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;Disposition-Notification-Options&quot;</code>  
<a name="AS2Constants.STANDARD_HEADER.MDN_URL"></a>

#### STANDARD_HEADER.MDN_URL : <code>string</code>

**Kind**: static constant of [<code>STANDARD_HEADER</code>](#AS2Constants.STANDARD_HEADER)  
**Default**: <code>&quot;Receipt-Delivery-Option&quot;</code>  
<a name="AS2Constants.CRLF"></a>

### AS2Constants.CRLF : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;\r\n&quot;</code>  
<a name="AS2Constants.MIME_VERSION"></a>

### AS2Constants.MIME_VERSION : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;1.0&quot;</code>  
<a name="AS2Constants.AS2_VERSION"></a>

### AS2Constants.AS2_VERSION : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;1.0&quot;</code>  
<a name="AS2Constants.SMIME_DESC"></a>

### AS2Constants.SMIME_DESC : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;This is an S/MIME signed message&quot;</code>  
<a name="AS2Constants.SIGNATURE_FILENAME"></a>

### AS2Constants.SIGNATURE_FILENAME : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;smime.p7s&quot;</code>  
<a name="AS2Constants.ENCRYPTION_FILENAME"></a>

### AS2Constants.ENCRYPTION_FILENAME : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
**Default**: <code>&quot;smime.p7m&quot;</code>  
<a name="AS2Constants.LIBRARY_NAME"></a>

### AS2Constants.LIBRARY_NAME : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
<a name="AS2Constants.LIBRARY_VERSION"></a>

### AS2Constants.LIBRARY_VERSION : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
<a name="AS2Constants.LIBRAY_NAME_VERSION"></a>

### AS2Constants.LIBRAY_NAME_VERSION : <code>string</code>

**Kind**: static constant of [<code>AS2Constants</code>](#AS2Constants)  
<a name="getReportNode"></a>

## getReportNode(node) ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)

<p>Get the multipart/report disposition-notification, if any.</p>

**Kind**: global function  
**Returns**: [<code>AS2MimeNode</code>](#AS2MimeNode) - <p>The multipart/report disposition-notification.</p>

| Param | Type                                     | Description                                      |
| ----- | ---------------------------------------- | ------------------------------------------------ |
| node  | [<code>AS2MimeNode</code>](#AS2MimeNode) | <p>The multipart MIME containing the report.</p> |

<a name="isMdn"></a>

## isMdn(node) ⇒ <code>boolean</code>

<p>Answers if the AS2MimeNode is a Message Disposition Notification.</p>

**Kind**: global function  
**Returns**: <code>boolean</code> - <p>True for a Message Disposition Notification.</p>

| Param | Type                                     | Description                                           |
| ----- | ---------------------------------------- | ----------------------------------------------------- |
| node  | [<code>AS2MimeNode</code>](#AS2MimeNode) | <p>The multipart MIME which may contain a report.</p> |

<a name="parseHeaderString"></a>

## parseHeaderString(headers, [keyToLowerCase], [callback]) ⇒ <code>object</code>

<p>Method for converting a string of headers into key:value pairs.</p>

**Kind**: global function  
**Returns**: <code>object</code> - <p>The headers as an object of key/value pairs.</p>

| Param            | Type                                          | Default            | Description                                                                                          |
| ---------------- | --------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| headers          | <code>string</code>                           |                    | <p>A string of headers.</p>                                                                          |
| [keyToLowerCase] | <code>boolean</code> \| <code>function</code> | <code>false</code> | <p>Set all header keys to lower-case; or provide a function to manipulate values.</p>                |
| [callback]       | <code>function</code>                         |                    | <p>A callback to manipulate values as they are parsed; only use if second argument is a boolean.</p> |

<a name="getProtocol"></a>

## getProtocol(url) ⇒ <code>string</code>

<p>Method for retrieving the protocol of a URL, dynamically.</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>The protocol of the URL.</p>  
**Throws**:

- <p>URL is not one of either &quot;string&quot; or instance of &quot;URL&quot;.</p>

| Param | Type                                    | Description                         |
| ----- | --------------------------------------- | ----------------------------------- |
| url   | <code>string</code> \| <code>URL</code> | <p>The url to get the protocol.</p> |

<a name="isNullOrUndefined"></a>

## isNullOrUndefined(value) ⇒ <code>boolean</code>

<p>Convenience method for null-checks.</p>

**Kind**: global function  
**Returns**: <code>boolean</code> - <p>True if null or undefined.</p>

| Param | Type             | Description                     |
| ----- | ---------------- | ------------------------------- |
| value | <code>any</code> | <p>Any value to duck-check.</p> |

<a name="isSMime"></a>

## isSMime(value) ⇒ <code>boolean</code>

<p>Determine if a given string is one of PKCS7 MIME types.</p>

**Kind**: global function  
**Returns**: <code>boolean</code> - <p>True if a valid pkcs7 value.</p>

| Param | Type                | Description                               |
| ----- | ------------------- | ----------------------------------------- |
| value | <code>string</code> | <p>Checks if either pkcs7 or x-pkcs7.</p> |

<a name="canonicalTransform"></a>

## canonicalTransform(node)

<p>Transforms a payload into a canonical text format per RFC 5751 section 3.1.1.</p>

**Kind**: global function

| Param | Type                                     | Description                             |
| ----- | ---------------------------------------- | --------------------------------------- |
| node  | [<code>AS2MimeNode</code>](#AS2MimeNode) | <p>The AS2MimeNode to canonicalize.</p> |

<a name="getSigningOptions"></a>

## getSigningOptions(sign) ⇒ [<code>SigningOptions</code>](#SigningOptions)

<p>Normalizes certificate signing options.</p>

**Kind**: global function  
**Returns**: [<code>SigningOptions</code>](#SigningOptions) - <p>A normalized option object.</p>

| Param | Type                                           | Description                 |
| ----- | ---------------------------------------------- | --------------------------- |
| sign  | [<code>SigningOptions</code>](#SigningOptions) | <p>Options for signing.</p> |

<a name="getEncryptionOptions"></a>

## getEncryptionOptions(encrypt) ⇒ [<code>EncryptionOptions</code>](#EncryptionOptions)

<p>Normalizes encryption options.</p>

**Kind**: global function  
**Returns**: [<code>EncryptionOptions</code>](#EncryptionOptions) - <p>A normalized option object.</p>

| Param   | Type                                                 | Description                    |
| ------- | ---------------------------------------------------- | ------------------------------ |
| encrypt | [<code>EncryptionOptions</code>](#EncryptionOptions) | <p>Options for encryption.</p> |

<a name="getAgreementOptions"></a>

## getAgreementOptions(agreement) ⇒ [<code>AS2Agreement</code>](#AS2Agreement)

<p>Normalizes agreement options.</p>

**Kind**: global function  
**Returns**: [<code>AS2Agreement</code>](#AS2Agreement) - <p>A normalized option object.</p>

| Param     | Type                                               | Description                           |
| --------- | -------------------------------------------------- | ------------------------------------- |
| agreement | [<code>AgreementOptions</code>](#AgreementOptions) | <p>Options for partner agreement.</p> |

<a name="request"></a>

## request(options) ⇒ <code>IncomingMessage</code>

<p>Convenience method for making AS2 HTTP/S requests. Makes a POST request by default.</p>

**Kind**: global function  
**Returns**: <code>IncomingMessage</code> - <p>The incoming message, including Buffer properties rawBody and rawResponse,
and convenience methods for mime() and json().</p>

| Param          | Type                                                                                    | Description                                                                   |
| -------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| options        | <code>RequestOptions</code>                                                             | <p>Options for making a request; extends Node's RequestOptions interface.</p> |
| options.body   | <code>Buffer</code> \| <code>string</code> \| <code>object</code> \| <code>Array</code> | <p>Buffer, string, or JavaScript object.</p>                                  |
| options.params | <code>object</code>                                                                     | <p>JavaScript object of parameters to append to the url.</p>                  |

<a name="AS2ComposerOptions"></a>

## AS2ComposerOptions : <code>object</code>

<p>Options for composing an AS2 message.</p>

**Kind**: global typedef  
**Properties**

| Name      | Type                                               |
| --------- | -------------------------------------------------- |
| message   | <code>AS2MimeNodeOptions</code>                    |
| agreement | [<code>AgreementOptions</code>](#AgreementOptions) |

<a name="AgreementOptions"></a>

## AgreementOptions : <code>object</code>

<p>Options for composing an AS2 message.</p>

**Kind**: global typedef  
**Properties**

| Name                  | Type                                                                                                                       | Description                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| host                  | <code>object</code>                                                                                                        | <p>Options for the AS2 host.</p>                                                         |
| host.name             | <code>string</code>                                                                                                        | <p>The name of the host.</p>                                                             |
| host.id               | <code>string</code>                                                                                                        | <p>The id of the host; usually a company's DUNS id.</p>                                  |
| host.url              | <code>string</code> \| <code>URL</code>                                                                                    | <p>The URL of the host's AS2 endpoint.</p>                                               |
| [host.certificate]    | <code>string</code> \| <code>Buffer</code> \| [<code>PemFile</code>](#PemFile)                                             | <p>The certificate of the host in PEM format. Required for signing or decrypting.</p>    |
| [host.privateKey]     | <code>string</code> \| <code>Buffer</code> \| [<code>PemFile</code>](#PemFile)                                             | <p>The private key of the host in PEM format. Required for signing or decrypting.</p>    |
| host.decrypt          | <code>boolean</code>                                                                                                       | <p>Host requires partner to encrypt messages sent to the host.</p>                       |
| host.sign             | [<code>AS2Signing</code>](#AS2Signing) \| <code>boolean</code>                                                             | <p>Host requires partner to verify messages sent from the host.</p>                      |
| [host.mdn]            | <code>object</code>                                                                                                        | <p>Host requests a message disposition notification (MDN).</p>                           |
| host.mdn.async        | <code>boolean</code>                                                                                                       | <p>Host requires MDN to be sent to a separate URL.</p>                                   |
| host.mdn.signing      | [<code>AS2Signing</code>](#AS2Signing) \| <code>false</code>                                                               | <p>Host requires MDN to be signed with algorithm if possible.</p>                        |
| partner               | <code>object</code>                                                                                                        | <p>Options for the AS2 partner.</p>                                                      |
| partner.name          | <code>string</code>                                                                                                        | <p>The name of the partner.</p>                                                          |
| partner.id            | <code>string</code>                                                                                                        | <p>The id of the partner; usually a company's DUNS id.</p>                               |
| partner.url           | <code>string</code> \| <code>URL</code>                                                                                    | <p>The URL of the partner's AS2 endpoint.</p>                                            |
| partner.file          | <code>&#x27;EDIX12&#x27;</code> \| <code>&#x27;EDIFACT&#x27;</code> \| <code>&#x27;XML&#x27;</code> \| <code>string</code> | <p>The file protocol for trading with the partner.</p>                                   |
| [partner.certificate] | <code>string</code> \| <code>Buffer</code> \| [<code>PemFile</code>](#PemFile)                                             | <p>The certificate of the partner in PEM format. Required for signing or decrypting.</p> |
| partner.encrypt       | [<code>AS2Encryption</code>](#AS2Encryption) \| <code>boolean</code>                                                       | <p>Partner requires host to encrypt messages sent to the partner.</p>                    |
| partner.verify        | <code>boolean</code>                                                                                                       | <p>Partner requires host to verify messages sent from the partner.</p>                   |
| [partner.mdn]         | <code>object</code>                                                                                                        | <p>Partner may request a message disposition notification (MDN).</p>                     |
| partner.mdn.async     | <code>boolean</code>                                                                                                       | <p>Partner requires MDN to be sent to a separate URL.</p>                                |
| partner.mdn.signing   | [<code>AS2Signing</code>](#AS2Signing) \| <code>false</code>                                                               | <p>Partner requires MDN to be signed with algorithm if possible.</p>                     |

<a name="AS2Signing"></a>

## AS2Signing : <code>&#x27;sha-1&#x27;</code> \| <code>&#x27;sha-256&#x27;</code> \| <code>&#x27;sha-384&#x27;</code> \| <code>&#x27;sha-512&#x27;</code>

<p>List of supported signing algorithms.</p>

**Kind**: global typedef  
<a name="AS2Encryption"></a>

## AS2Encryption : <code>&#x27;des-EDE3-CBC&#x27;</code> \| <code>&#x27;aes128-CBC&#x27;</code> \| <code>&#x27;aes192-CBC&#x27;</code> \| <code>&#x27;aes256-CBC&#x27;</code> \| <code>&#x27;aes128-GCM&#x27;</code> \| <code>&#x27;aes192-GCM&#x27;</code> \| <code>&#x27;aes256-GCM&#x27;</code>

<p>List of supported encryption algorithms.</p>

**Kind**: global typedef  
<a name="EncryptionOptions"></a>

## EncryptionOptions : <code>object</code>

<p>Options for encrypting payloads.</p>

**Kind**: global typedef  
**Properties**

| Name       | Type                                         |
| ---------- | -------------------------------------------- |
| cert       | <code>string</code> \| <code>Buffer</code>   |
| encryption | [<code>AS2Encryption</code>](#AS2Encryption) |

<a name="DecryptionOptions"></a>

## DecryptionOptions : <code>object</code>

<p>Options for decrypting payloads.</p>

**Kind**: global typedef  
**Properties**

| Name | Type                                       |
| ---- | ------------------------------------------ |
| cert | <code>string</code> \| <code>Buffer</code> |
| key  | <code>string</code> \| <code>Buffer</code> |

<a name="SigningOptions"></a>

## SigningOptions : <code>object</code>

<p>Options for decrypting payloads.</p>

**Kind**: global typedef  
**Properties**

| Name      | Type                                       |
| --------- | ------------------------------------------ |
| cert      | <code>string</code> \| <code>Buffer</code> |
| key       | <code>string</code> \| <code>Buffer</code> |
| algorithm | [<code>AS2Signing</code>](#AS2Signing)     |

<a name="VerificationOptions"></a>

## VerificationOptions : <code>object</code>

<p>Options for decrypting payloads.</p>

**Kind**: global typedef  
**Properties**

| Name | Type                                       |
| ---- | ------------------------------------------ |
| cert | <code>string</code> \| <code>Buffer</code> |

<a name="AS2DispositionOptions"></a>

## AS2DispositionOptions : <code>object</code>

<p>Options for composing a message disposition notification (MDN).</p>

**Kind**: global typedef  
**Properties**

| Name         | Type                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| explanation  | <code>string</code>                                                    |
| notification | [<code>AS2DispositionNotification</code>](#AS2DispositionNotification) |
| [returned]   | [<code>AS2MimeNode</code>](#AS2MimeNode) \| <code>boolean</code>       |

<a name="OutgoingDispositionOptions"></a>

## OutgoingDispositionOptions : <code>object</code>

<p>Options for generating an outgoing MDN.</p>

**Kind**: global typedef  
**Properties**

| Name         | Type                                               | Description                                                                             |
| ------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| node         | [<code>AS2MimeNode</code>](#AS2MimeNode)           | <p>The mime node to verify and/or decrypt; used construct the outgoing disposition.</p> |
| agreement    | [<code>AgreementOptions</code>](#AgreementOptions) | <p>The partner agreement to use when sending the outgoing disposition.</p>              |
| [returnNode] | <code>boolean</code>                               | <p>Whether to attach the mime node to the disposition as the returned payload.</p>      |

<a name="ParseOptions"></a>

## ParseOptions : <code>object</code>

<p>Options for parsing a MIME document; useful if there is no access to the underlying raw response.</p>

**Kind**: global typedef  
**Properties**

| Name    | Type                                                              | Description                                                                                                                |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| headers | <code>Array.&lt;string&gt;</code> \| <code>object</code>          | <p>Either an object like Node.js <code>IncomingMessage.headers</code> or like <code>IncomingMessage.rawHeaders</code>.</p> |
| content | <code>Buffer</code> \| <code>Stream</code> \| <code>string</code> | <p>The raw body of the MIME document.</p>                                                                                  |
