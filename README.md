# libas2

A pure Javascript/Typescript implementation of the AS2 protocol.

## **WARNING**

**BETA SOFTWARE**

This library is not quite yet ready for production use. The API is still in flux, and it's missing an API for constructing MDNs. These will be settled soon to allow for a production release. Documentation of the API is only partially complete and won't be until the API is solidified.

## Usage

> TODO

## Features

- Compose AS2 messages to send, including signing and encrypting
- Parse received AS2 messages, including decrypting and verifying
- Near-complete support for AS2 protocol 1.0 [per RFC 4130](https://tools.ietf.org/html/rfc4130); see roadmap
- Rich cryptography support based on [Forge](https://github.com/digitalbazaar/forge)
- Rich MIME support based on [Nodemailer](https://github.com/nodemailer/nodemailer) and [Emailjs](https://github.com/emailjs/emailjs-mime-parser)

## Roadmap

- Write code for composing MDN responses
- Finish README
- Support versions of AS2 greater than 1.0
- Write implementation of CMS compression

## API

> TODO

## Contribute

> TODO
