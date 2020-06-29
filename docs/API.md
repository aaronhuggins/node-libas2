## Classes

<dl>
<dt><a href="#AS2Composer">AS2Composer</a></dt>
<dd><p>Class for composing AS2 messages.</p></dd>
<dt><a href="#AS2Crypto">AS2Crypto</a></dt>
<dd><p>Class for cryptography methods supported by AS2.</p></dd>
<dt><a href="#AS2Disposition">AS2Disposition</a></dt>
<dd><p>Class for describing and constructing a Message Disposition Notification.</p></dd>
<dt><a href="#AS2DispositionNotification">AS2DispositionNotification</a></dt>
<dd><p>Class for dealing with disposition notification headers.</p></dd>
<dt><a href="#AS2MimeNode">AS2MimeNode</a></dt>
<dd><p>Class for describing and constructing a MIME document.</p></dd>
<dt><a href="#AS2Parser">AS2Parser</a></dt>
<dd><p>Class for parsing a MIME document to an AS2MimeNode tree.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#getPackageJson">getPackageJson()</a></dt>
<dd><p>Walk up the directory tree searching for this module's package.json.</p></dd>
<dt><a href="#parseHeaderString">parseHeaderString()</a></dt>
<dd><p>Method for converting a string of headers into key:value pairs.</p></dd>
<dt><a href="#getProtocol">getProtocol()</a></dt>
<dd><p>Method for retrieving the protocol of a URL, dynamically.</p></dd>
<dt><a href="#isNullOrUndefined">isNullOrUndefined()</a></dt>
<dd><p>Convenience method for null-checks</p></dd>
<dt><a href="#isSMime">isSMime()</a></dt>
<dd><p>Determine if a given string is one of PKCS7 MIME types.</p></dd>
<dt><a href="#canonicalTransform">canonicalTransform()</a></dt>
<dd><p>Transforms a payload into a canonical text format before signing</p></dd>
<dt><a href="#signingOptions">signingOptions()</a></dt>
<dd><p>Normalizes certificate signing options.</p></dd>
<dt><a href="#encryptionOptions">encryptionOptions()</a></dt>
<dd><p>Normalizes encryption options.</p></dd>
<dt><a href="#agreementOptions">agreementOptions()</a></dt>
<dd><p>Normalizes agreement options.</p></dd>
<dt><a href="#request">request()</a></dt>
<dd><p>Convenience method for making AS2 HTTP/S requests. Makes a POST request by default.</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AS2ComposerOptions">AS2ComposerOptions</a> : <code>object</code></dt>
<dd><p>Options for composing an AS2 message.</p></dd>
<dt><a href="#AgreementOptions">AgreementOptions</a> : <code>object</code></dt>
<dd><p>Options for composing an AS2 message.</p></dd>
<dt><a href="#MessageDispositionOptions">MessageDispositionOptions</a> : <code>object</code></dt>
<dd><p>Options for composing an AS2 message.</p></dd>
<dt><a href="#AS2Signing">AS2Signing</a> : <code>&#x27;sha-1&#x27;</code> | <code>&#x27;sha-256&#x27;</code> | <code>&#x27;sha-384&#x27;</code> | <code>&#x27;sha-512&#x27;</code></dt>
<dd><p>List of supported signing algorithms.</p></dd>
<dt><a href="#AS2Encryption">AS2Encryption</a> : <code>&#x27;aes-128-CBC&#x27;</code> | <code>&#x27;aes-192-CBC&#x27;</code> | <code>&#x27;aes-256-CBC&#x27;</code></dt>
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

<a name="AS2Composer"></a>

## AS2Composer

<p>Class for composing AS2 messages.</p>

**Kind**: global class

- [AS2Composer](#AS2Composer)
  - [new AS2Composer(options)](#new_AS2Composer_new)
  - [.setAgreement(agreement)](#AS2Composer+setAgreement)
  - [.setHeaders(headers)](#AS2Composer+setHeaders)
  - [.compile()](#AS2Composer+compile) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.toRequestOptions(url)](#AS2Composer+toRequestOptions) ⇒ <code>Promise.&lt;RequestOptions&gt;</code>

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

<a name="AS2Composer+setHeaders"></a>

### aS2Composer.setHeaders(headers)

<p>Set headers for this composer instance.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)

| Param   | Type                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| headers | <code>AS2Headers</code> \| [<code>AgreementOptions</code>](#AgreementOptions) |

<a name="AS2Composer+compile"></a>

### aS2Composer.compile() ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Compile the composed message into an instance of AS2MimeNode.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>This composer instance as an AS2MimeNode.</p>  
<a name="AS2Composer+toRequestOptions"></a>

### aS2Composer.toRequestOptions(url) ⇒ <code>Promise.&lt;RequestOptions&gt;</code>

<p>Create a Node.js-compatible RequestOptions object from the composed message.</p>

**Kind**: instance method of [<code>AS2Composer</code>](#AS2Composer)  
**Returns**: <code>Promise.&lt;RequestOptions&gt;</code> - <p>This composer instance as request options for Node.js.</p>

| Param | Type                | Description                                                    |
| ----- | ------------------- | -------------------------------------------------------------- |
| url   | <code>string</code> | <p>The URL of the AS2 endpoint receiving this AS2 message.</p> |

<a name="AS2Crypto"></a>

## AS2Crypto

<p>Class for cryptography methods supported by AS2.</p>

**Kind**: global class

- [AS2Crypto](#AS2Crypto)
  - [.generateUniqueId()](#AS2Crypto.generateUniqueId) ⇒ <code>string</code>
  - [.decrypt(node, options)](#AS2Crypto.decrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.encrypt(node, options)](#AS2Crypto.encrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
  - [.verify(node, options)](#AS2Crypto.verify) ⇒ <code>Promise.&lt;boolean&gt;</code>
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

### AS2Crypto.verify(node, options) ⇒ <code>Promise.&lt;boolean&gt;</code>

<p>Method to verify data has not been modified from a signature.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - <p>A boolean indicating if the message was verified.</p>

| Param   | Type                                                     | Description                                |
| ------- | -------------------------------------------------------- | ------------------------------------------ |
| node    | [<code>AS2MimeNode</code>](#AS2MimeNode)                 | <p>The AS2MimeNode to verify.</p>          |
| options | [<code>VerificationOptions</code>](#VerificationOptions) | <p>Options to verify the MIME message.</p> |

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

<a name="AS2Disposition"></a>

## AS2Disposition

<p>Class for describing and constructing a Message Disposition Notification.</p>

**Kind**: global class

- [AS2Disposition](#AS2Disposition)
  - _instance_
    - [.toMimeNode()](#AS2Disposition+toMimeNode) ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)
  - _static_
    - [.outgoing(options)](#AS2Disposition.outgoing) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.incoming(node, [signed])](#AS2Disposition.incoming) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)

<a name="AS2Disposition+toMimeNode"></a>

### aS2Disposition.toMimeNode() ⇒ [<code>AS2MimeNode</code>](#AS2MimeNode)

<p>This instance to an AS2MimeNode.</p>

**Kind**: instance method of [<code>AS2Disposition</code>](#AS2Disposition)  
**Returns**: [<code>AS2MimeNode</code>](#AS2MimeNode) - <ul>

<li>An MDN as an AS2MimeNode.</li>
</ul>  
<a name="AS2Disposition.outgoing"></a>

### AS2Disposition.outgoing(options) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method to decrypt and/or verify a mime node and construct an outgoing message disposition.</p>

**Kind**: static method of [<code>AS2Disposition</code>](#AS2Disposition)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <ul>

<li>The generated outgoing MDN as an AS2MimeNode.</li>
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
    - [.dispositionOut([options])](#AS2MimeNode+dispositionOut) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.dispositionIn([signed])](#AS2MimeNode+dispositionIn) ⇒ [<code>Promise.&lt;AS2Disposition&gt;</code>](#AS2Disposition)
    - [.sign([options])](#AS2MimeNode+sign) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.verify(options)](#AS2MimeNode+verify) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.decrypt(options)](#AS2MimeNode+decrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.encrypt([options])](#AS2MimeNode+encrypt) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)
    - [.build()](#AS2MimeNode+build) ⇒ <code>Promise.&lt;Buffer&gt;</code>
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

### aS2MimeNode.dispositionOut([options]) ⇒ [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode)

<p>Convenience method for generating an outgoing MDN for this message.</p>

**Kind**: instance method of [<code>AS2MimeNode</code>](#AS2MimeNode)  
**Returns**: [<code>Promise.&lt;AS2MimeNode&gt;</code>](#AS2MimeNode) - <p>An outgoing MDN as an AS2MimeNode.</p>

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

<a name="getPackageJson"></a>

## getPackageJson()

<p>Walk up the directory tree searching for this module's package.json.</p>

**Kind**: global function  
<a name="parseHeaderString"></a>

## parseHeaderString()

<p>Method for converting a string of headers into key:value pairs.</p>

**Kind**: global function  
<a name="getProtocol"></a>

## getProtocol()

<p>Method for retrieving the protocol of a URL, dynamically.</p>

**Kind**: global function  
**Throws**:

- <p>URL is not one of either &quot;string&quot; or instance of &quot;URL&quot;.</p>

<a name="isNullOrUndefined"></a>

## isNullOrUndefined()

<p>Convenience method for null-checks</p>

**Kind**: global function  
<a name="isSMime"></a>

## isSMime()

<p>Determine if a given string is one of PKCS7 MIME types.</p>

**Kind**: global function  
<a name="canonicalTransform"></a>

## canonicalTransform()

<p>Transforms a payload into a canonical text format before signing</p>

**Kind**: global function  
<a name="signingOptions"></a>

## signingOptions()

<p>Normalizes certificate signing options.</p>

**Kind**: global function  
<a name="encryptionOptions"></a>

## encryptionOptions()

<p>Normalizes encryption options.</p>

**Kind**: global function  
<a name="agreementOptions"></a>

## agreementOptions()

<p>Normalizes agreement options.</p>

**Kind**: global function  
<a name="request"></a>

## request()

<p>Convenience method for making AS2 HTTP/S requests. Makes a POST request by default.</p>

**Kind**: global function  
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

| Name      | Type                                                                 |
| --------- | -------------------------------------------------------------------- |
| sender    | <code>string</code>                                                  |
| recipient | <code>string</code>                                                  |
| sign      | [<code>SigningOptions</code>](#SigningOptions)                       |
| encrypt   | [<code>EncryptionOptions</code>](#EncryptionOptions)                 |
| mdn       | [<code>MessageDispositionOptions</code>](#MessageDispositionOptions) |
| version   | <code>string</code>                                                  |
| headers   | <code>AS2Headers</code>                                              |

<a name="MessageDispositionOptions"></a>

## MessageDispositionOptions : <code>object</code>

<p>Options for composing an AS2 message.</p>

**Kind**: global typedef  
**Properties**

| Name            | Type                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| to              | <code>string</code>                                                    |
| [deliveryUrl]   | <code>string</code>                                                    |
| [sign]          | <code>object</code>                                                    |
| sign.importance | <code>&#x27;required&#x27;</code> \| <code>&#x27;optional&#x27;</code> |
| sign.protocol   | <code>&#x27;pkcs7-signature&#x27;</code>                               |
| sign.micalg     | [<code>AS2Signing</code>](#AS2Signing)                                 |

<a name="AS2Signing"></a>

## AS2Signing : <code>&#x27;sha-1&#x27;</code> \| <code>&#x27;sha-256&#x27;</code> \| <code>&#x27;sha-384&#x27;</code> \| <code>&#x27;sha-512&#x27;</code>

<p>List of supported signing algorithms.</p>

**Kind**: global typedef  
<a name="AS2Encryption"></a>

## AS2Encryption : <code>&#x27;aes-128-CBC&#x27;</code> \| <code>&#x27;aes-192-CBC&#x27;</code> \| <code>&#x27;aes-256-CBC&#x27;</code>

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

| Name              | Type                                                     |
| ----------------- | -------------------------------------------------------- |
| node              | [<code>AS2MimeNode</code>](#AS2MimeNode)                 |
| [returnNode]      | <code>boolean</code>                                     |
| [signDisposition] | [<code>SigningOptions</code>](#SigningOptions)           |
| [signed]          | [<code>VerificationOptions</code>](#VerificationOptions) |
| [encrypted]       | [<code>DecryptionOptions</code>](#DecryptionOptions)     |

<a name="ParseOptions"></a>

## ParseOptions : <code>object</code>

<p>Options for parsing a MIME document; useful if there is no access to the underlying raw response.</p>

**Kind**: global typedef  
**Properties**

| Name    | Type                                                              | Description                                                                                                                |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| headers | <code>Array.&lt;string&gt;</code> \| <code>object</code>          | <p>Either an object like Node.js <code>IncomingMessage.headers</code> or like <code>IncomingMessage.rawHeaders</code>.</p> |
| content | <code>Buffer</code> \| <code>Stream</code> \| <code>string</code> | <p>The raw body of the MIME document.</p>                                                                                  |
