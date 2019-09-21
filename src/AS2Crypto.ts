import * as AS2Constants from './AS2Constants'
import forge = require('node-forge')
import crypto = require('crypto')

export class AS2Crypto {
  public Constants = {
    SIGNATURE_HEADER: `-----BEGIN PKCS7-----${AS2Constants.CONTROL_CHAR}`,
    SIGNATURE_FOOTER: `-----END PKCS7-----${AS2Constants.CONTROL_CHAR}`
  }

  /**
   * @description Method to decrypt data from a PKCS7 3DES string in base64.
   * @param {string} data - The data to decrypt from PKCS7 3DES.
   * @param {string} publicCert - The public certificate in PEM format to verify.
   * @param {string} privateKey - The private key to decrypt with.
   * @returns {string} The decrypted data.
   */
  public decrypt (data: string, publicCert: string, privateKey: string): string {
    if (!data.includes(this.Constants.SIGNATURE_HEADER)) {
      data = `${this.Constants.SIGNATURE_HEADER}${data}${this.Constants.SIGNATURE_FOOTER}`
    }

    const p7 = forge.pkcs7.messageFromPem(data)
    const recipient = p7.findRecipient(forge.pki.certificateFromPem(publicCert))

    p7.decrypt(recipient, forge.pki.privateKeyFromPem(privateKey))

    return p7.content.toString('utf8')
  }

  /**
   * @description Method to encrypt data into a PKCS7 3DES string in base64.
   * @param {string} data - The data to encrypt into PKCS7 3DES.
   * @param {string} publicCert - The public certificate in PEM format to encrypt with.
   * @returns {string} The encrypted data.
   */
  public encrypt (data: string, publicCert: string): string {
    const p7 = forge.pkcs7.createEnvelopedData()

    p7.addRecipient(forge.pki.certificateFromPem(publicCert))
    p7.content = forge.util.createBuffer(data)
    p7.encrypt(undefined, forge.pki.oids['des-EDE3-CBC'])

    return forge.pkcs7.messageToPem(p7).replace(this.Constants.SIGNATURE_HEADER, '').replace(this.Constants.SIGNATURE_FOOTER, '')
  }

  /**
   * @description Method to verify data has not been modified from a signature.
   * @param {string|any} data - The data to verify.
   * @param {string} signature - The signature to verify.
   * @param {string} publicCert - The certificate to verify against.
   * @param {string} [algorithm='sha1'] - The algorithm for verification.
   * @returns {boolean} True when data matches signature.
   */
  public verify (data: string | any, signature: string, publicCert: string, algorithm: string = AS2Constants.CRYPTO_ALGORITHM.SHA1): boolean {
    if (!signature.includes(this.Constants.SIGNATURE_HEADER)) {
      signature = `${this.Constants.SIGNATURE_HEADER}${signature}${this.Constants.SIGNATURE_FOOTER}`
    }

    const msg = forge.pkcs7.messageFromPem(signature)
    const verifier = crypto.createVerify(algorithm)

    verifier.update(Buffer.from(data))

    // The encoding 'latin1' is an alias for 'binary'.
    return verifier.verify(publicCert, msg.rawCapture.signature, 'latin1')
  }

  /**
   * @description Method to sign data against a certificate and key pair.
   * @param {string|any} data - The data to verify.
   * @param {string} publicCert - The certificate to verify against.
   * @param {string} privateKey - The private key associated with the certificate.
   * @param {string} [algorithm='sha1'] - The algorithm for signing.
   * @returns {string} The signature of the data.
   */
  public sign (data: string | any, publicCert: string, privateKey: string, algorithm: string = AS2Constants.CRYPTO_ALGORITHM.SHA1): string {
    const p7 = forge.pkcs7.createSignedData()

    p7.content = forge.util.createBuffer(data)
    p7.addCertificate(publicCert)
    p7.addSigner({
      key: forge.pki.privateKeyFromPem(privateKey),
      certificate: forge.pki.certificateFromPem(publicCert),
      digestAlgorithm: forge.pki.oids[algorithm]
    })
    p7.sign({ detached: true })

    return forge.pkcs7.messageToPem(p7).replace(this.Constants.SIGNATURE_HEADER, '').replace(this.Constants.SIGNATURE_FOOTER, '')
  }

  /**
   * @description Method for creating a simple self-signed certificate.
   * @param {object} options - Options for creating the certificate.
   * @returns {object} The public key, private key, and the certificate.
   */
  public createSimpleX509v3 (options: SimpleX509v3Options): any {
    const keys = forge.pki.rsa.generateKeyPair(2048)
    const cert = forge.pki.createCertificate()

    cert.publicKey = keys.publicKey
    cert.serialNumber = options.serial === undefined
      ? `${Math.floor(Math.random() * 1000000000000000000).toString().padStart(18, '0')}`
      : `${options.serial}`
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + options.years)

    const attrs = [{
      name: 'commonName',
      value: options.commonName
    }, {
      name: 'countryName',
      value: options.countryName
    }, {
      shortName: 'ST',
      value: options.state === undefined
        ? options.ST
        : options.state
    }, {
      name: 'localityName',
      value: options.city === undefined
        ? options.localityName
        : options.city
    }, {
      name: 'organizationName',
      value: options.organizationName === undefined
        ? options.OU
        : options.organizationName
    }, {
      shortName: 'OU',
      value: options.OU
    }]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.setExtensions([{
      name: 'basicConstraints',
      cA: true
    }, {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    }, {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    }, {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true
    }, {
      name: 'subjectAltName',
      altNames: [{
        type: 6, // URI
        value: options.URI
      }, {
        type: 7, // IP
        ip: options.IP
      }]
    }, {
      name: 'subjectKeyIdentifier'
    }])

    // self-sign certificate
    const digest = forge.md[options.digest] === undefined
      ? forge.md.sha256
      : forge.md[options.digest]

    cert.sign(keys.privateKey, digest.create())

    return {
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      certificate: forge.pki.certificateToPem(cert)
    }
  }
}

interface SimpleX509v3Options {
  city?: string
  commonName: string
  countryName: string
  digest?: 'sha1' | 'sha256' | 'sha384' | 'sha512'
  IP: string
  localityName?: string
  organizationName?: string
  OU: string
  serial?: number | string
  ST?: string
  state?: string
  URI: string
  years: number
}
