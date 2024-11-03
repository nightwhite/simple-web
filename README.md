# Simple WEB Backend Framework

[中文](./README.zh.md)

A lightweight **functional programming-style Web service framework** that supports **functional** backend interface development, with built-in features like WebSocket, XML parsing, CORS, etc., making it convenient for **Mini Program, Function Computing, and Tencent Cloud Development users** to quickly develop backend services. Easy to integrate with various public cloud platforms and container platforms for **plugin-style development and agile development**.

- [sealos Operating System Public Cloud Environment](https://gzg.sealos.run)
- [sealos devbox Quick Development](https://gzg.sealos.run/?openapp=system-devbox)
- [sealos Cloud Development](https://gzg.sealos.run/?openapp=system-sealaf)

## 🌟 Core Features

- **Zero Configuration Development** - Quick project startup without complex configuration
- **Automatic Route Generation** - File system-based route organization
- **Functional Programming** - Intuitive interface development approach
- **Rich Built-in Features**
  - WebSocket support
  - XML parsing capability
  - CORS configuration
  - Function caching
  - Configurable log levels
  - Express.js extension capabilities

## 🚀 Quick Start

> Your first hello world interface

### Environment Requirements

- Node.js >= 22.0.0
- pnpm (recommended package manager)

### Installation

`package.json`:

```json
{
  "name": "simple-web",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon --exec tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "clean": "rimraf dist",
    "build:clean": "pnpm clean && pnpm build",
    "typecheck": "tsc --noEmit",
    "start:prod": "cross-env NODE_ENV=production node dist/index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^22.8.1",
    "nodemon": "^3.1.7",
    "rimraf": "^6.0.1",
    "tslib": "^2.8.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  },
  "dependencies": {
    "simple-web23": "^0.0.25"
  }
}
```

tsconfig.json:

```json
{
    "compileOnSave": true,
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "moduleDetection": "auto",
        "removeComments": true,
        "lib": [
            "ESNext"
        ],
        "outDir": "dist",
        "rootDir": ".",
        "baseUrl": ".",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "importHelpers": true,
        "composite": true,
    },
    "include": [
        "**/*",
    ],
    "exclude": [
        "node_modules",
        "dist"
    ]
}
```

`nodemon.json`:

```json
{
    "watch": [
        "functions/",
        ".env"
    ],
    "ignore": [
        "*.test.js",
        "*.spec.js",
        "*.test.ts",
        "*.spec.ts",
        "node_modules/",
        "dist"
    ],
    "ext": "ts,js,json,yaml,yml",
    "exec": "tsx watch index.ts",
    "delay": "1000",
    "env": {
        "NODE_ENV": "development"
    }
}
```

In the following examples, the project root directory is `demo`. Add the above three files (package.json, tsconfig.json, and nodemon.json) to the project root directory, then run `pnpm install simple-web` to install dependencies. If pnpm is not installed, please install it first with `npm install -g pnpm`.

Project structure example:

```plain
demo
├── index.ts
├── package.json
├── tsconfig.json
├── nodemon.json
```

### Usage

Below is an example of the entry file `index.ts`, showing how to import SimpleWeb and start the service.

`demo/index.ts`

```typescript
import { SimpleWeb, SimpleWebConfig } from 'simple-web23'

const config: SimpleWebConfig = {
    port: 3000,
    logLevel: 'debug',
    isProd: process.env.NODE_ENV === 'production',
    requestLimitSize: '100mb'
}

const app = new SimpleWeb(config)
app.start()
```

Start the project by running `pnpm dev` in the project root directory.

The default service port is `2342`. A `functions` directory is generated in the root directory by default, and all **interface functions** must be written in this directory. Only functions in this directory will be registered as routes.

The simple web framework uses a file system-based route organization method. For example, `functions/hello.ts` corresponds to the route `/hello`, and `functions/user/info.ts` corresponds to the route `/user/info`.

When accessing each interface, the `default` function is executed by default, so you need to define a default export function `export default async function` or `export default function`.

Let's create your first hello interface:

`functions/hello.ts`

```typescript
import type { FunctionContext } from 'simple-web23'

export default async function (ctx: FunctionContext) {
    return {
        data: 'hello'
    }
}
```

```plain
demo
├── functions
│   ├── hello.ts
├── index.ts
├── package.json
├── tsconfig.json
├── nodemon.json
```

Run the project in the project root directory with `pnpm dev`, then access `http://localhost:2342/hello`. You can simulate access using the curl tool: `curl http://localhost:2342/hello`, and you'll see the data returned:

```json
{
    "data": "hello world"
}
```

### 📚 Advanced Guide

For using the simple web framework with MongoDB database and S3 object storage, see [Jump to More Examples](#more-examples).
For getting the simple web framework's function context and configuration options, see [Jump to Function Context](#simple-web-framework-function-context).

## Simple Web Framework Function Context

The interface function's default export function is the `default` function, which receives a `FunctionContext` parameter. `FunctionContext` is the simple web framework's function context and includes the following properties:

### FunctionContext Property Description

- `files`: Upload file information
  - Type: `{ [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined`
  - Description: Contains information about files uploaded through forms

- `headers`: Request headers
  - Type: `Request['headers']`
  - Description: HTTP request header information

- `query`: URL query parameters
  - Type: `Request['query']`
  - Description: Query string parameters in the URL

- `body`: Request body data
  - Type: `Request['body']`
  - Description: Data in the HTTP request body

- `params`: Route parameters
  - Type: `Request['params']`
  - Description: Dynamic parameters in the URL path

- `method`: Request method
  - Type: `Request['method']`
  - Description: HTTP request method (GET, POST, etc.)

- `webSocket`: WebSocket connection object
  - Type: `WebSocket`
  - Description: WebSocket connection instance (only available during WebSocket connections)

- `request`: Original request object
  - Type: `Request`
  - Description: Express original request object

- `response`: Original response object
  - Type: `Response`
  - Description: Express original response object

- `__function_name`: Function name
  - Type: `string`
  - Description: Name of the currently executing function

- `requestId`: Request ID
  - Type: `string`
  - Description: Unique identifier for tracking requests

- `url`: Request URL
  - Type: `string`
  - Description: Complete request URL

#### FunctionContext Usage Example

```typescript
import type { FunctionContext } from 'simple-web23'

export default async function (ctx: FunctionContext) {
    // Get query parameters
    const { name } = ctx.query

    // Get request headers
    const userAgent = ctx.headers['user-agent']

    // Get request body data
    const { data } = ctx.body

    return {
        name,
        userAgent,
        data,
        requestId: ctx.requestId
    }
}
```

#### Using Original Response Object Example

If you need finer control over the response, you can use the `ctx.response` object directly:

```typescript
import type { FunctionContext } from 'simple-web23'

export default async function (ctx: FunctionContext) {
    // Use the original response object to set status code and send response
    ctx.response
        .status(201)
        .send({
            message: 'Created successfully',
            timestamp: new Date().toISOString()
        })
}
```

This approach allows you to:

- Directly set HTTP status codes
- Customize response headers
- Control response format
- Stream data
- Use other Express Response object methods

### Interface Function Global Context

```typescript
export interface FunctionModuleGlobalContext {
    __filename: string;
    module: Module;
    exports: Module['exports'];
    console: Console;
    __require: typeof FunctionModule.functionsImport;
    RegExp: typeof RegExp;
    Buffer: typeof Buffer;
    Float32Array: typeof Float32Array;
    setInterval: typeof setInterval;
    clearInterval: typeof clearInterval;
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    setImmediate: typeof setImmediate;
    clearImmediate: typeof clearImmediate;
    Promise: typeof Promise;
    process: typeof process;
    URL: typeof URL;
    fetch: typeof fetch;
    global: unknown;
    __from_modules: string[];
}
```

```typescript
import type { FunctionModuleGlobalContext } from 'simple-web23'
```

The interface function's global context can be accessed through the `global` object. For example, `global.__filename` can get the current interface function file path.

## Simple Web Framework Configuration Options

### Configuration Options

```typescript
import type { SimpleWebConfig } from 'simple-web23'
import { Config } from 'simple-web23'
```

The SimpleWeb framework supports the following configuration options:

| Option | Type | Default Value | Description |
|--------|------|---------|------|
| port | number | 2342 | Server listening port |
| logLevel | 'debug' \| 'info' \| 'warn' \| 'error' | 'info' | Log output level |
| displayLineLogLevel | 'debug' \| 'info' \| 'warn' \| 'error' | 'info' | Log level for displaying line numbers |
| logDepth | number | 4 | Log object recursion depth |
| requestLimitSize | string | '50mb' | Request body size limit |
| disableModuleCache | boolean | false | Whether to disable module cache |
| isProd | boolean | false | Whether in production environment |
| workspacePath | string | \`${process.cwd()}/functions\` | Interface function directory |

#### Configuration Usage Example

```typescript
import { SimpleWeb, SimpleWebConfig } from 'simple-web23'

const config: SimpleWebConfig = {
    port: 3000,
    logLevel: 'debug',
    isProd: process.env.NODE_ENV === 'production',
    requestLimitSize: '100mb'
}

const app = new SimpleWeb(config)
app.start()
```

### Utility Functions

The simple web framework provides three utility functions: `FunctionCache`, `FunctionModule`, and `FunctionExecutor`

```typescript
import { FunctionCache, FunctionModule, FunctionExecutor } from 'simple-web23'
```

Use `FunctionCache` to get the original code cache of all current interface functions:

```typescript
import type { FunctionContext } from 'simple-web23'
export default async function (ctx: FunctionContext) {
    const cache = FunctionCache.getAll()
    console.log(cache)
}
```

Use `FunctionModule` to get all current interface function modules:

```typescript
import type { FunctionContext } from 'simple-web23'
export default async function (ctx: FunctionContext) {
    const modules = FunctionModule.getCache()
    console.log(modules)
}
```

## More Examples

Most web development requires **databases** and **object storage**. Below are examples using MongoDB database and S3 object storage.

The simple web framework supports writing persistent clients outside the interface function directory, such as database clients, S3 object storage clients, and some cron jobs. It's recommended to write these clients and cron jobs outside the interface function directory.

### Using MongoDB Database

Run `pnpm install mongodb` in the project root directory to install the MongoDB client. Create a `mongo.ts` file in the `client` directory and write the MongoDB client code.

```typescript
import { MongoClient } from 'mongodb'

// In production environment, remember to replace username and password with environment variables
// Don't hardcode passwords in the code to avoid leakage
// const username = process.env.MONGO_USERNAME
// const password = process.env.MONGO_PASSWORD
// const uri = `mongodb://${username}:${password}@test-mongodb.ns-1k9qk3v6.svc:27017`
const uri = "mongodb://root:tf44dbrn@dbconn.sealosgzg.site:45222/?directConnection=true"

// Create MongoDB client instance
export const client = new MongoClient(uri)
```

Create a `mongo-test.ts` file in the `functions` directory and write the MongoDB test code.

```typescript
import { FunctionContext } from 'simple-web23'
import { client } from '../client/mongo'

export default async function (ctx: FunctionContext) {
    const database = client.db('test')
    const collection = database.collection('test')

    // Create test data
    console.log('--- Creating test data ---')
    const insertResult = await collection.insertMany([
        { name: 'Zhang San', age: 25, city: 'Beijing' },
        { name: 'Li Si', age: 30, city: 'Shanghai' }
    ])
    console.log('Insert result:', insertResult)

    // Query all data
    console.log('\n--- Query all data ---')
    const allDocs = await collection.find({}).toArray()
    console.log('All data:', allDocs)

    // Query single data
    console.log('\n--- Query single data ---')
    const oneDoc = await collection.findOne({ name: 'Zhang San' })
    console.log('Query Zhang San\'s data:', oneDoc)

    // Update data
    console.log('\n--- Update data ---')
    const updateResult = await collection.updateOne(
        { name: 'Zhang San' },
        { $set: { age: 26, city: 'Shenzhen' } }
    )
    console.log('Update result:', updateResult)

    // View updated data
    const updatedDoc = await collection.findOne({ name: 'Zhang San' })
    console.log('Zhang San\'s updated data:', updatedDoc)

    // Delete data
    console.log('\n--- Delete data ---')
    const deleteResult = await collection.deleteOne({ name: 'Li Si' })
    console.log('Delete result:', deleteResult)

    // Final query all data
    console.log('\n--- Final data ---')
    const finalDocs = await collection.find({}).toArray()
    console.log('Final all data:', finalDocs)

    return { message: 'Test completed' }
}
```

```plain
demo
├── functions
│   ├── hello.ts
│   ├── mongo-test.ts
├── client
│   ├── mongo.ts
├── index.ts
├── package.json
├── tsconfig.json
├── nodemon.json
```

### Using S3 Object Storage

Run `pnpm install @aws-sdk/client-s3` in the project root directory to install the S3 client. Create an `s3.ts` file in the `client` directory and write the S3 client code.

```typescript
import { S3Client, ListObjectsV2Command, PutObjectCommand, _Object } from "@aws-sdk/client-s3"

// Create S3 client
// In production environment, remember to replace access key and secret with environment variables
// Don't hardcode credentials in the code to avoid leakage
// const accessKeyId = process.env.S3_ACCESS_KEY_ID
// const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

const s3Client = new S3Client({
    region: "cn-north-1", // e.g., "ap-northeast-1"
    endpoint: "https://objectstorageapi.gzg.sealos.run", // e.g., "https://s3.amazonaws.com" or custom endpoint
    credentials: {
        accessKeyId: "xxxxxxxxxx",
        secretAccessKey: "xxxxxxxxxx"
    },
    // If using custom endpoint (like MinIO), you may need the following configuration
    forcePathStyle: true, // Force path style instead of virtual hosted style
})

// List files in bucket
async function listFiles(bucketName: string) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
        })

        const response = await s3Client.send(command)

        // Print file list
        response.Contents?.forEach((file: _Object) => {
            console.log(`File name: ${file.Key}, Size: ${file.Size} bytes`)
        })

        return response.Contents
    } catch (error) {
        console.error("Failed to list files:", error)
        throw error
    }
}

// Upload file to S3
async function uploadFile(bucketName: string, key: string, fileContent: Buffer) {
    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileContent,
        })

        const response = await s3Client.send(command)
        console.log("File upload successful:", response)
        return response
    } catch (error) {
        console.error("File upload failed:", error)
        throw error
    }
}

export { listFiles, uploadFile }
```

Create an `s3-test.ts` file in the `functions` directory and write the S3 test code.

```typescript
import { FunctionContext } from 'simple-web23'
import { listFiles, uploadFile } from '../client/s3'

export default async function (ctx: FunctionContext) {
    const bucketName = '1k9qk3v6-test2'
    const fileName = 'test.txt'
    const fileContent = Buffer.from('Hello World')
    await uploadFile(bucketName, fileName, fileContent)
    await listFiles(bucketName)
    return 'success'
}
```

## 🎯 Future Plans

- [ ] Plugin system support
- [ ] Global context definition
- [ ] Lifecycle hooks
- [ ] Path routing enhancement
- [ ] OpenAPI integration
- [ ] Multi-language support (Python/Go/Java)

## 🤝 Contribution Guidelines

Issues and Pull Requests are welcome.
