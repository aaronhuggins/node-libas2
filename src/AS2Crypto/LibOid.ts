import { isNullOrUndefined } from '../Helpers'

export class LibObjectID {
  constructor (map: Array<[string, string]>) {
    this.map = new Map(map)
  }

  private map: Map<string, string>

  byId (id: string): ObjectID {
    const name = this.map.get(id)

    return { name, id }
  }

  byName (name: string): ObjectID {
    for (const [key, value] of this.map.entries()) {
      if (value.toLowerCase() === name.trim().toLowerCase()) {
        return { name, id: key }
      }
    }

    return { name, id: undefined }
  }

  has (nameOrId: string): boolean {
    return this.map.has(nameOrId) || this.byName(nameOrId).id !== undefined
  }

  static init () {
    return new LibObjectID([
      // algorithm OIDs
      ['1.2.840.113549.1.1.1', 'RSAES-PKCS1-v1_5'], // a.k.a rsaEncryption
      ['1.2.840.113549.1.1.2', 'md2WithRSAEncryption'],
      ['1.2.840.113549.1.1.3', 'md4WithRSAEncryption'],
      ['1.2.840.113549.1.1.4', 'md5WithRSAEncryption'],
      ['1.2.840.113549.1.1.5', 'sha-1WithRSAEncryption'],
      ['1.2.840.113549.1.1.7', 'RSAES-OAEP'],
      ['1.2.840.113549.1.1.8', 'mgf1'],
      ['1.2.840.113549.1.1.9', 'pSpecified'],
      ['1.2.840.113549.1.1.10', 'RSA-PSS'],
      ['1.2.840.113549.1.1.11', 'sha-256WithRSAEncryption'],
      ['1.2.840.113549.1.1.12', 'sha-384WithRSAEncryption'],
      ['1.2.840.113549.1.1.13', 'sha-512WithRSAEncryption'],
      // Edwards-curve Digital Signature Algorithm (EdDSA) Ed25519
      ['1.3.101.112', 'EdDSA25519'],

      ['1.2.840.10040.4.3', 'dsa-with-sha1'],

      ['1.3.14.3.2.7', 'desCBC'],

      ['1.3.14.3.2.26', 'sha-1'],
      ['2.16.840.1.101.3.4.2.1', 'sha-256'],
      ['2.16.840.1.101.3.4.2.2', 'sha-384'],
      ['2.16.840.1.101.3.4.2.3', 'sha-512'],
      ['1.2.840.113549.2.5', 'md5'], // Unsupported

      // hmac OIDs
      ['1.2.840.113549.2.7', 'hmacWithSHA1'],
      ['1.2.840.113549.2.8', 'hmacWithSHA224'],
      ['1.2.840.113549.2.9', 'hmacWithSHA256'],
      ['1.2.840.113549.2.10', 'hmacWithSHA384'],
      ['1.2.840.113549.2.11', 'hmacWithSHA512'],

      // symmetric key algorithm oids
      ['1.2.840.113549.3.7', 'des-EDE3-CBC'],
      ['2.16.840.1.101.3.4.1.2', 'aes128-CBC'],
      ['2.16.840.1.101.3.4.1.22', 'aes192-CBC'],
      ['2.16.840.1.101.3.4.1.42', 'aes256-CBC'],

      // pkcs#7 content types
      ['1.2.840.113549.1.7.1', 'data'],
      ['1.2.840.113549.1.7.2', 'signedData'],
      ['1.2.840.113549.1.7.3', 'envelopedData'],
      ['1.2.840.113549.1.7.4', 'signedAndEnvelopedData'],
      ['1.2.840.113549.1.7.5', 'digestedData'],
      ['1.2.840.113549.1.7.6', 'encryptedData'],

      // pkcs#9 oids
      ['1.2.840.113549.1.9.1', 'emailAddress'],
      ['1.2.840.113549.1.9.2', 'unstructuredName'],
      ['1.2.840.113549.1.9.3', 'contentType'],
      ['1.2.840.113549.1.9.4', 'messageDigest'],
      ['1.2.840.113549.1.9.5', 'signingTime'],
      ['1.2.840.113549.1.9.6', 'counterSignature'],
      ['1.2.840.113549.1.9.7', 'challengePassword'],
      ['1.2.840.113549.1.9.8', 'unstructuredAddress'],
      ['1.2.840.113549.1.9.14', 'extensionRequest'],

      ['1.2.840.113549.1.9.20', 'friendlyName'],
      ['1.2.840.113549.1.9.21', 'localKeyId'],
      ['1.2.840.113549.1.9.22.1', 'x509Certificate'],

      // pkcs#12 safe bags
      ['1.2.840.113549.1.12.10.1.1', 'keyBag'],
      ['1.2.840.113549.1.12.10.1.2', 'pkcs8ShroudedKeyBag'],
      ['1.2.840.113549.1.12.10.1.3', 'certBag'],
      ['1.2.840.113549.1.12.10.1.4', 'crlBag'],
      ['1.2.840.113549.1.12.10.1.5', 'secretBag'],
      ['1.2.840.113549.1.12.10.1.6', 'safeContentsBag'],

      // password-based-encryption for pkcs#12
      ['1.2.840.113549.1.5.13', 'pkcs5PBES2'],
      ['1.2.840.113549.1.5.12', 'pkcs5PBKDF2'],

      ['1.2.840.113549.1.12.1.1', 'pbeWithSHAAnd128BitRC4'],
      ['1.2.840.113549.1.12.1.2', 'pbeWithSHAAnd40BitRC4'],
      ['1.2.840.113549.1.12.1.3', 'pbeWithSHAAnd3-KeyTripleDES-CBC'],
      ['1.2.840.113549.1.12.1.4', 'pbeWithSHAAnd2-KeyTripleDES-CBC'],
      ['1.2.840.113549.1.12.1.5', 'pbeWithSHAAnd128BitRC2-CBC'],
      ['1.2.840.113549.1.12.1.6', 'pbewithSHAAnd40BitRC2-CBC'],

      // certificate issuer/subject OIDs
      ['2.5.4.3', 'commonName'],
      ['2.5.4.5', 'serialName'],
      ['2.5.4.6', 'countryName'],
      ['2.5.4.7', 'localityName'],
      ['2.5.4.8', 'stateOrProvinceName'],
      ['2.5.4.9', 'streetAddress'],
      ['2.5.4.10', 'organizationName'],
      ['2.5.4.11', 'organizationalUnitName'],
      ['2.5.4.13', 'description'],
      ['2.5.4.15', 'businessCategory'],
      ['2.5.4.17', 'postalCode'],
      ['1.3.6.1.4.1.311.60.2.1.2', 'jurisdictionOfIncorporationStateOrProvinceName'],
      ['1.3.6.1.4.1.311.60.2.1.3', 'jurisdictionOfIncorporationCountryName'],

      // X.509 extension OIDs
      ['2.16.840.1.113730.1.1', 'nsCertType'],
      ['2.16.840.1.113730.1.13', 'nsComment'], // deprecated in theory; still widely used
      ['2.5.29.1', 'authorityKeyIdentifier'], // deprecated, use .35
      ['2.5.29.2', 'keyAttributes'], // obsolete use .37 or .15
      ['2.5.29.3', 'certificatePolicies'], // deprecated, use .32
      ['2.5.29.4', 'keyUsageRestriction'], // obsolete use .37 or .15
      ['2.5.29.5', 'policyMapping'], // deprecated use .33
      ['2.5.29.6', 'subtreesConstraint'], // obsolete use .30
      ['2.5.29.7', 'subjectAltName'], // deprecated use .17
      ['2.5.29.8', 'issuerAltName'], // deprecated use .18
      ['2.5.29.9', 'subjectDirectoryAttributes'],
      ['2.5.29.10', 'basicConstraints'], // deprecated use .19
      ['2.5.29.11', 'nameConstraints'], // deprecated use .30
      ['2.5.29.12', 'policyConstraints'], // deprecated use .36
      ['2.5.29.13', 'basicConstraints'], // deprecated use .19
      ['2.5.29.14', 'subjectKeyIdentifier'],
      ['2.5.29.15', 'keyUsage'],
      ['2.5.29.16', 'privateKeyUsagePeriod'],
      ['2.5.29.17', 'subjectAltName'],
      ['2.5.29.18', 'issuerAltName'],
      ['2.5.29.19', 'basicConstraints'],
      ['2.5.29.20', 'cRLNumber'],
      ['2.5.29.21', 'cRLReason'],
      ['2.5.29.22', 'expirationDate'],
      ['2.5.29.23', 'instructionCode'],
      ['2.5.29.24', 'invalidityDate'],
      ['2.5.29.25', 'cRLDistributionPoints'], // deprecated use .31
      ['2.5.29.26', 'issuingDistributionPoint'], // deprecated use .28
      ['2.5.29.27', 'deltaCRLIndicator'],
      ['2.5.29.28', 'issuingDistributionPoint'],
      ['2.5.29.29', 'certificateIssuer'],
      ['2.5.29.30', 'nameConstraints'],
      ['2.5.29.31', 'cRLDistributionPoints'],
      ['2.5.29.32', 'certificatePolicies'],
      ['2.5.29.33', 'policyMappings'],
      ['2.5.29.34', 'policyConstraints'], // deprecated use .36
      ['2.5.29.35', 'authorityKeyIdentifier'],
      ['2.5.29.36', 'policyConstraints'],
      ['2.5.29.37', 'extKeyUsage'],
      ['2.5.29.46', 'freshestCRL'],
      ['2.5.29.54', 'inhibitAnyPolicy'],

      // extKeyUsage purposes
      ['1.3.6.1.4.1.11129.2.4.2', 'timestampList'],
      ['1.3.6.1.5.5.7.1.1', 'authorityInfoAccess'],
      ['1.3.6.1.5.5.7.3.1', 'serverAuth'],
      ['1.3.6.1.5.5.7.3.2', 'clientAuth'],
      ['1.3.6.1.5.5.7.3.3', 'codeSigning'],
      ['1.3.6.1.5.5.7.3.4', 'emailProtection'],
      ['1.3.6.1.5.5.7.3.8', 'timeStamping']
    ])
  }
}

export const objectIds = LibObjectID.init()

export class ObjectID {
  constructor ({ name, id }: { name?: string; id?: string }) {
    if (isNullOrUndefined(name) && isNullOrUndefined(id)) {
      throw new Error('Cannot find ObjectID by undefined or null values.')
    }

    if (!isNullOrUndefined(name)) {
      return objectIds.byName(name)
    } else {
      return objectIds.byId(id)
    }
  }

  name: string
  id: string
}
