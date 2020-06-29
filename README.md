# libas2

A pure Javascript/Typescript implementation of the AS2 protocol. This project assumes that it fully implements Applicability Statement 2 (AS2) version 1.0 per RFC 4130. Best effort has been made to achieve tests which cover the different aspects of the RFC, but **this is not a certified library**. The project does not have access to Drummond certification, which is considered to be the standards body in certifying compatibility with AS2, so good sense should be used when using this library as the AS2 layer in an application.

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/standard/eslint-config-standard-with-typescript)
[![codecov](https://codecov.io/gh/ahuggins-nhs/node-libas2/branch/master/graph/badge.svg)](https://codecov.io/gh/ahuggins-nhs/node-libas2)
![GitHub last commit](https://img.shields.io/github/last-commit/ahuggins-nhs/node-libas2)
![GitHub contributors](https://img.shields.io/github/contributors/ahuggins-nhs/node-libas2)
![npm collaborators](https://img.shields.io/npm/collaborators/libas2)<br />
![GitHub top language](https://img.shields.io/github/languages/top/ahuggins-nhs/node-libas2)
![npm bundle size](https://img.shields.io/bundlephobia/min/libas2)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ahuggins-nhs/node-libas2)
![npm](https://img.shields.io/npm/dw/libas2)
![NPM](https://img.shields.io/npm/l/libas2)<br />
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-libas2&metric=alert_status)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-libas2)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-libas2&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-libas2)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-libas2&metric=security_rating)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-libas2)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-libas2&metric=ncloc)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-libas2)

## **WARNING**

**BETA SOFTWARE**

This library is not quite yet ready for production use. The API is still in flux, but nearly finished. This will be settled soon to allow for a production version 1.0.0 release. Documentation of the API is complete and work is being done to keep the documentation up-to-date.

## Usage

Install it from the [npm repository](https://www.npmjs.com/package/libas2):
```console
npm install --save libas2
```

Then require it in your project:
```js
const { AS2Composer } = require('libas2')
```

The TypeScript code is compiled to JavaScript and distributed via NPM. If you wish to use the TypeScript code directly you can [download the zip](https://github.com/ahuggins-nhs/libas2/releases/latest) and unpack it locally.

Then import it in your project:
```typescript
import { AS2Composer } from './libas2/core.ts'
```

## Features

- Compose AS2 messages to send, including signing and encrypting
- Parse received AS2 messages, including decrypting and verifying
- Generate and consume Message Disposition Notifications; includes convenience methods for incoming and outgoing dispositions
- Complete support for AS2 protocol 1.0 [per RFC 4130](https://tools.ietf.org/html/rfc4130); see roadmap
- Rich cryptography support based on [PKIjs](https://github.com/PeculiarVentures/PKI.js)
- Rich MIME support based on [Nodemailer](https://github.com/nodemailer/nodemailer) and [Emailjs](https://github.com/emailjs/emailjs-mime-parser)

## Roadmap

- Finish README for libas2 1.x release
- Write implementation of CMS compression to support AS2 version 1.1 (see rfc4130 section 6.1)
- Support versions of AS2 greater than 1.1

## API

See the [API document](/docs/API.md) for complete information.

## Contribute

> TODO
