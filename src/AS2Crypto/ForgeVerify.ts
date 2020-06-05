import * as forge from 'node-forge'
import { isNullOrUndefined } from '../Helpers'

const attributeValidator = {
  name: 'AuthenticatedAttribute',
  tagClass: forge.asn1.Class.UNIVERSAL,
  type: forge.asn1.Type.SEQUENCE,
  constructed: true,
  value: [
    {
      name: 'AuthenticatedAttribute.type',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.OID,
      constructed: false,
      capture: 'type'
    },
    {
      name: 'AuthenticatedAttribute.value',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.SET,
      constructed: true,
      capture: 'value'
    }
  ]
}

const signerValidator = {
  name: 'SignerInfo',
  tagClass: forge.asn1.Class.UNIVERSAL,
  type: forge.asn1.Type.SEQUENCE,
  constructed: true,
  value: [
    {
      name: 'SignerInfo.version',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.INTEGER,
      constructed: false
    },
    {
      name: 'SignerInfo.issuerAndSerialNumber',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.SEQUENCE,
      constructed: true,
      value: [
        {
          name: 'SignerInfo.issuerAndSerialNumber.issuer',
          tagClass: forge.asn1.Class.UNIVERSAL,
          type: forge.asn1.Type.SEQUENCE,
          constructed: true,
          captureAsn1: 'issuer'
        },
        {
          name: 'SignerInfo.issuerAndSerialNumber.serialNumber',
          tagClass: forge.asn1.Class.UNIVERSAL,
          type: forge.asn1.Type.INTEGER,
          constructed: false,
          capture: 'serial'
        }
      ]
    },
    {
      name: 'SignerInfo.digestAlgorithm',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.SEQUENCE,
      constructed: true,
      value: [
        {
          name: 'SignerInfo.digestAlgorithm.algorithm',
          tagClass: forge.asn1.Class.UNIVERSAL,
          type: forge.asn1.Type.OID,
          constructed: false,
          capture: 'digestAlgorithm'
        },
        {
          name: 'SignerInfo.digestAlgorithm.parameter',
          tagClass: forge.asn1.Class.UNIVERSAL,
          constructed: false,
          captureAsn1: 'digestParameter',
          optional: true
        }
      ]
    },
    {
      name: 'SignerInfo.authenticatedAttributes',
      tagClass: forge.asn1.Class.CONTEXT_SPECIFIC,
      type: forge.asn1.Type.NONE,
      constructed: true,
      optional: true,
      capture: 'authenticatedAttributes'
    },
    {
      name: 'SignerInfo.digestEncryptionAlgorithm',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.SEQUENCE,
      constructed: true,
      capture: 'signatureAlgorithm'
    },
    {
      name: 'SignerInfo.encryptedDigest',
      tagClass: forge.asn1.Class.UNIVERSAL,
      type: forge.asn1.Type.OCTETSTRING,
      constructed: false,
      capture: 'signature'
    },
    {
      name: 'SignerInfo.unauthenticatedAttributes',
      tagClass: forge.asn1.Class.CONTEXT_SPECIFIC,
      type: forge.asn1.Type.BOOLEAN,
      constructed: true,
      optional: true,
      capture: 'unauthenticatedAttributes'
    }
  ]
}

const messageDigestValidator = {
  name: 'MessageDigest',
  tagClass: forge.asn1.Class.UNIVERSAL,
  type: forge.asn1.Type.OCTETSTRING,
  constructed: false,
  capture: 'messageDigest'
}

function findCertificate (
  cert: forge.pki.Certificate,
  msg: forge.pkcs7.PkcsSignedData
) {
  var sAttr = cert.issuer.attributes

  for (var i = 0; i < (msg as any).certificates.length; ++i) {
    var r: forge.pki.Certificate = (msg as any).certificates[i]
    var rAttr = r.issuer.attributes

    if (r.serialNumber !== cert.serialNumber) {
      continue
    }

    if (rAttr.length !== sAttr.length) {
      continue
    }

    var match = true
    for (var j = 0; j < sAttr.length; ++j) {
      if (
        rAttr[j].type !== sAttr[j].type ||
        rAttr[j].value !== sAttr[j].value
      ) {
        match = false
        break
      }
    }

    if (match) {
      return r
    }
  }

  return null
}

function findSignerInfo (cert: forge.pki.Certificate, signerInfos: any[]) {
  const sAttr = cert.issuer.attributes

  for (let i = 0; i < signerInfos.length; ++i) {
    const signerInfo: any = {}
    ;(forge.asn1 as any).validate(signerInfos[i], signerValidator, signerInfo)

    signerInfo.issuer = (forge.pki as any).RDNAttributesAsArray(
      signerInfo.issuer
    )
    signerInfo.serialNumber = forge.util.createBuffer(signerInfo.serial).toHex()

    const rAttr = signerInfo.issuer

    if (signerInfo.serialNumber !== cert.serialNumber) {
      continue
    }

    if (rAttr.length !== sAttr.length) {
      continue
    }

    let match = true
    for (let j = 0; j < sAttr.length; ++j) {
      if (
        rAttr[j].type !== sAttr[j].type ||
        rAttr[j].value !== sAttr[j].value
      ) {
        match = false
        break
      }
    }

    if (match) {
      return signerInfo
    }
  }

  return null
}

function messageDigestFromAsn1 (attrs: any[]) {
  const capture: any = {}

  for (let i = 0; i < attrs.length; i += 1) {
    const attr: any = {}
    ;(forge.asn1 as any).validate(attrs[i], attributeValidator, attr)

    const oid = forge.asn1.derToOid(attr.type)

    if (oid === forge.pki.oids.messageDigest) {
      ;(forge.asn1 as any).validate(
        attr.value[0],
        messageDigestValidator,
        capture
      )
      break
    }
  }

  return capture
}

// Make sure to bind() to signature for "this".
export function verify (verifier: {
  detached?: string | forge.util.ByteBuffer
  certificate: string | forge.pki.Certificate
}): boolean {
  const msg: forge.pkcs7.PkcsSignedData = this
  let verified: boolean = false
  let cert: forge.pki.Certificate
  let content: string | forge.util.ByteBuffer
  let publicKey: forge.pki.PublicKey
  let signedAttributes: forge.asn1.Asn1[]

  if (typeof verifier.certificate === 'string') {
    cert = forge.pki.certificateFromPem(verifier.certificate)
  } else {
    cert = verifier.certificate
  }

  const recipient: forge.pki.Certificate = findCertificate(cert, msg)

  if (isNullOrUndefined(recipient)) {
    throw new Error(
      'Certificate provided was not used to sign message; no matching signature certificate.'
    )
  }

  // If recipient was found but does not have a public key, use the provided certificate.
  publicKey = recipient.publicKey || cert.publicKey

  if (isNullOrUndefined(publicKey)) {
    throw new Error(
      'Public key not found in either the signature certificate or provided certificate.'
    )
  }

  content = verifier.detached || msg.content

  if (msg.content instanceof (forge.util as any).ByteBuffer) {
    content = (content as any).bytes()
  } else if (typeof content === 'string') {
    content = forge.util.encodeUtf8(content)
  }

  const contentAsn1 = forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.OCTETSTRING,
    false,
    content as string
  )
  let contentDer = forge.asn1.toDer(contentAsn1)
  // skip identifier and length per RFC 2315 9.3
  // skip identifier (1 byte)
  contentDer.getByte()
  // read and discard length bytes
  ;(forge.asn1 as any).getBerValueLength(contentDer)

  // Find the signer info by cert issuer and capture signature, algorithm, and signed attributes from signer info.
  const {
    authenticatedAttributes,
    digestAlgorithm,
    signature
  } = findSignerInfo(cert, (msg as any).rawCapture.signerInfos)
  const algorithm = forge.asn1.derToOid(digestAlgorithm)
  const contentMessageDigest = forge.md[
    forge.pki.oids[algorithm]
  ].create() as forge.md.MessageDigest

  if (authenticatedAttributes) {
    signedAttributes = authenticatedAttributes
  } else {
    signedAttributes = []
  }

  ;(contentMessageDigest as any).start().update(contentDer.getBytes())

  if (signedAttributes.length > 0) {
    const { messageDigest } = messageDigestFromAsn1(signedAttributes)

    // RFC 5652 requires the contents to match the message digest in the signed attributes.
    if (contentMessageDigest.digest().getBytes() === messageDigest) {
      // Compute message digest of signed attributes and verify with signature.
      const signedAttrMessageDigest = forge.md[
        forge.pki.oids[algorithm]
      ].create() as forge.md.MessageDigest
      // Per RFC 2315, attributes are to be digested using a SET container
      const attrsAsn1 = forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.SET,
        true,
        signedAttributes
      )
      ;(signedAttrMessageDigest as any)
        .start()
        .update(forge.asn1.toDer(attrsAsn1).getBytes())

      verified = (publicKey as any).verify(
        signedAttrMessageDigest.digest().getBytes(),
        signature,
        'RSASSA-PKCS1-V1_5'
      )
    }
  } else {
    // Verify the computed message digest of contents with the signature.
    verified = (publicKey as any).verify(
      contentMessageDigest.digest().getBytes(),
      signature,
      'RSASSA-PKCS1-V1_5'
    )
  }

  return verified
}
