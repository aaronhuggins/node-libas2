import { AgreementOptions } from './Interfaces'
import { AS2Encryption, AS2Signing, PemFile } from '../AS2Crypto'
import { AS2Constants } from '../Constants'
import { isNullOrUndefined } from '../Helpers'

const { ENCRYPTION, ERROR, SIGNING } = AS2Constants

export class AS2Trading {
  constructor (trading: AS2Trading & { mdn?: { async?: URL|string } }) {
    this.role = trading.role
    this.name = trading.name
    this.id = trading.id
    if (trading.mdn) {
      this.mdn = {
        async: trading.mdn.async ? new URL(trading.mdn.async as string) : undefined,
        signing: trading.mdn.signing
      }
    }
  }

  role: 'host'|'partner'
  name: string
  id: string
  mdn?: {
    async?: URL
    signing: AS2Signing|false
  }
}

export class AS2Host extends AS2Trading {
  constructor (host: AS2Host & {
    certificate?: string | Buffer | PemFile
    privateKey?: string | Buffer | PemFile
    sign: AS2Signing|boolean
  }) {
    super(host)
    this.role = 'host'
    this.sign = typeof host.sign === 'boolean' && host.sign
      ? SIGNING.SHA256
      : host.sign
    this.decrypt = host.decrypt

    if ((!isNullOrUndefined(host.sign) && host.sign) || host.decrypt) {
      if (host.certificate) {
        this.certificate = host.certificate instanceof PemFile
          ? host.certificate
          : new PemFile(host.certificate)

        if (this.certificate.type !== 'CERTIFICATE') {
          throw new Error(
            ERROR.WRONG_PEM_FILE +
            ' expected CERTIFICATE, but received ' +
            this.certificate.type
          )
        }
      } else {
        throw new Error(ERROR.MISSING_PARTNER_CERT)
      }

      if (host.privateKey) {
        this.privateKey = host.privateKey instanceof PemFile
          ? host.privateKey
          : new PemFile(host.privateKey)

        if (this.privateKey.type !== 'PRIVATE_KEY') {
          throw new Error(
            ERROR.WRONG_PEM_FILE +
            ' expected PRIVATE_KEY, but received ' +
            this.certificate.type
          )
        }
      } else {
        throw new Error(ERROR.MISSING_PARTNER_KEY)
      }
    }
  }

  role: 'host'
  certificate?: PemFile
  privateKey?: PemFile
  decrypt?: boolean
  sign?: AS2Signing|false
}

export class AS2Partner extends AS2Trading {
  constructor (partner: AS2Partner & {
    certificate?: string | Buffer | PemFile
    encrypt: AS2Encryption|boolean
  }) {
    super(partner)
    this.role = 'partner'
    this.encrypt = typeof partner.encrypt === 'boolean' && partner.encrypt
      ? ENCRYPTION.AES128_CBC
      : partner.encrypt
    this.verify = partner.verify

    if ((!isNullOrUndefined(partner.encrypt) && partner.encrypt) || partner.verify) {
      if (partner.certificate) {
        this.certificate = partner.certificate instanceof PemFile
          ? partner.certificate
          : new PemFile(partner.certificate)
  
        if (this.certificate.type !== 'CERTIFICATE') {
          throw new Error(
            ERROR.WRONG_PEM_FILE +
            ' expected CERTIFICATE, but received ' +
            this.certificate.type
          )
        }
      } else {
        throw new Error(ERROR.MISSING_PARTNER_CERT)
      }
    }
  }

  role: 'partner'
  certificate?: PemFile
  encrypt?: AS2Encryption|false
  verify?: boolean
}

/** Class for describing and handling partner agreements.
 * @param {AgreementOptions} agreement - The partner agreement for sending and receiving over AS2.
 */
export class AS2Agreement implements AgreementOptions {
  constructor (agreement: AS2Agreement & {
    host: AS2Host & {
      certificate?: string | Buffer | PemFile
      privateKey?: string | Buffer | PemFile
      sign: AS2Signing|boolean
    }
    partner: AS2Partner & {
      certificate?: string | Buffer | PemFile
      encrypt: AS2Encryption|boolean
    }
  }) {
    this.host = new AS2Host(agreement.host)
    this.partner = new AS2Partner(agreement.partner)
  }

  host: AS2Host
  partner: AS2Partner
}
