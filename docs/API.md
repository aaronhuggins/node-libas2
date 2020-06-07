## Classes

<dl>
<dt><a href="#AS2Composer">AS2Composer</a></dt>
<dd><p>Class for composing AS2 messages.</p></dd>
<dt><a href="#AS2Crypto">AS2Crypto</a></dt>
<dd><p>Class for cryptography methods supported by AS2.</p></dd>
<dt><a href="#AS2Disposition">AS2Disposition</a></dt>
<dd><p>Class for describing and constructing a Message Disposition Notification.</p></dd>
<dt><a href="#AS2MimeNode">AS2MimeNode</a></dt>
<dd><p>Class for describing and constructing a MIME document.</p></dd>
<dt><a href="#AS2Parser">AS2Parser</a></dt>
<dd><p>Class for parsing a MIME document to an AS2MimeNode tree.</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#isNullOrUndefined">isNullOrUndefined()</a></dt>
<dd><p>Convenience method for null-checks</p></dd>
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

<a name="AS2Composer"></a>

## AS2Composer
<p>Class for composing AS2 messages.</p>

**Kind**: global class  
<a name="AS2Crypto"></a>

## AS2Crypto
<p>Class for cryptography methods supported by AS2.</p>

**Kind**: global class  

* [AS2Crypto](#AS2Crypto)
    * [.removeTrailingCrLf()](#AS2Crypto.removeTrailingCrLf)
    * [.generateUniqueId()](#AS2Crypto.generateUniqueId)
    * [.decrypt()](#AS2Crypto.decrypt)
    * [.encrypt()](#AS2Crypto.encrypt)
    * [.verify()](#AS2Crypto.verify)
    * [.sign()](#AS2Crypto.sign)
    * [.compress()](#AS2Crypto.compress)
    * [.decompress()](#AS2Crypto.decompress)

<a name="AS2Crypto.removeTrailingCrLf"></a>

### AS2Crypto.removeTrailingCrLf()
<p>A fix for signing with Nodemailer to produce verifiable SMIME;
the library joins multipart boundaries without the part's trailing CRLF,
where OpenSSL and other SMIME clients keep each part's last CRLF.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.generateUniqueId"></a>

### AS2Crypto.generateUniqueId()
<p>Crux to generate UUID-like random strings</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.decrypt"></a>

### AS2Crypto.decrypt()
<p>Method to decrypt an AS2MimeNode from a PKCS7 encrypted AS2MimeNode.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.encrypt"></a>

### AS2Crypto.encrypt()
<p>Method to envelope an AS2MimeNode in an encrypted AS2MimeNode.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.verify"></a>

### AS2Crypto.verify()
<p>Method to verify data has not been modified from a signature.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.sign"></a>

### AS2Crypto.sign()
<p>Method to sign data against a certificate and key pair.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
<a name="AS2Crypto.compress"></a>

### AS2Crypto.compress()
<p>Not yet implemented; do not use.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Throws**:

- <p>NOT_IMPLEMENTED</p>

<a name="AS2Crypto.decompress"></a>

### AS2Crypto.decompress()
<p>Not yet implemented.</p>

**Kind**: static method of [<code>AS2Crypto</code>](#AS2Crypto)  
**Throws**:

- <p>NOT_IMPLEMENTED</p>

<a name="AS2Disposition"></a>

## AS2Disposition
<p>Class for describing and constructing a Message Disposition Notification.</p>

**Kind**: global class  
<a name="AS2MimeNode"></a>

## AS2MimeNode
<p>Class for describing and constructing a MIME document.</p>

**Kind**: global class  
<a name="AS2Parser"></a>

## AS2Parser
<p>Class for parsing a MIME document to an AS2MimeNode tree.</p>

**Kind**: global class  
<a name="isNullOrUndefined"></a>

## isNullOrUndefined()
<p>Convenience method for null-checks</p>

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
