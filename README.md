# Tác dụng của việc sài buf:
```text
Lớp 1 — Single source of truth
  Một file .proto duy nhất trên registry
  → Không bao giờ có 2 service dùng proto khác version

Lớp 2 — Breaking change detection  ← lớn nhất
  CI chặn trước khi merge
  → Lỗi bắt ở review, không phải ở production

Lớp 3 — Cross-language codegen
  buf generate → Java class, TypeScript, Go, Python...
  → Không viết tay, không sai sót do copy

Lớp 4 — Lint và style enforcement
  buf lint → enforce naming convention
  → Mọi service đều nhất quán, không ai đặt tên tùy tiện
```

# gRPC Client & Server Cheatsheet
> Sau khi gen code từ Buf registry — ai dùng gì

---

## Tóm gọn nhất

```
JAVA CLIENT   →  @GrpcClient + BlockingStub
JAVA SERVER   →  @GrpcService + extends ImplBase

NESTJS SERVER →  implements UserServiceController + @UserServiceControllerMethods
NESTJS CLIENT →  getService<UserServiceClient> + firstValueFrom(observable)
```

---

## Java

### Client — gọi sang service khác

```java
@Service
public class UserGrpcClient {

  @GrpcClient("user-service")                             // tên khớp với application.yml
  private UserServiceGrpc.UserServiceBlockingStub stub;  // dùng BlockingStub cho đồng bộ

  public String getUserProfile(String userId) {
    GetUserProfileRequest request = GetUserProfileRequest.newBuilder()
        .setUserId(userId)
        .build();

    GetUserProfileResponse response = stub.getUserProfile(request); // block thread, chờ kết quả
    return response.getFullName();
  }
}
```

### Server — nhận call từ service khác

```java
@GrpcService                                             // thay vì @Service thông thường
public class UserGrpcServer extends UserServiceGrpc.UserServiceImplBase {

  @Override
  public void getUserProfile(
      GetUserProfileRequest request,
      StreamObserver<GetUserProfileResponse> responseObserver) {

    GetUserProfileResponse response = GetUserProfileResponse.newBuilder()
        .setFullName("Nguyen Van A")
        .build();

    responseObserver.onNext(response);     // trả data về client
    responseObserver.onCompleted();        // báo kết thúc
  }
}
```

### `application.yml`

```yaml
grpc:
  client:
    user-service:                          # tên khớp với @GrpcClient("user-service")
      address: 'static://localhost:50051'  # địa chỉ service muốn gọi tới
      negotiation-type: plaintext          # tắt TLS khi dev local

  server:
    port: 9090                             # port Java lắng nghe gRPC
    security:
      enabled: false                       # tắt TLS khi dev local
```

### `pom.xml` — dependency cần có

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>

  <!-- gRPC client + server starter -->
  <dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-client-spring-boot-starter</artifactId>
    <version>2.15.0.RELEASE</version>
  </dependency>
  <dependency>
    <groupId>net.devh</groupId>
    <artifactId>grpc-server-spring-boot-starter</artifactId>
    <version>2.15.0.RELEASE</version>
  </dependency>

  <!-- Protobuf runtime -->
  <dependency>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-java</artifactId>
    <version>3.25.3</version>
  </dependency>

  <!-- Cần cho Java 17 -->
  <dependency>
    <groupId>javax.annotation</groupId>
    <artifactId>javax.annotation-api</artifactId>
    <version>1.3.2</version>
  </dependency>
</dependencies>
```

---

## NestJS

### Server — nhận call từ service khác

**`user.controller.ts`**

```typescript
import { Controller } from '@nestjs/common';
import {
  UserServiceController,          // interface phải implement
  UserServiceControllerMethods,   // decorator tự gắn @GrpcMethod
  GetUserProfileRequest,
  GetUserProfileResponse,
} from '../generated/disnote/user/v1/user';

@Controller()
@UserServiceControllerMethods()                          // gắn vào class
export class UserController implements UserServiceController {

  async getUserProfile(req: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    // req.userId — TypeScript biết kiểu nhờ generated interface
    return {
      fullName: 'Nguyen Van A',   // camelCase, không phải snake_case
    };
  }
}
```

**`main.ts`** — lắng nghe gRPC

```typescript
import { NestFactory }            from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join }                   from 'path';
import { AppModule }              from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50051',           // port NestJS lắng nghe
        package: 'disnote.user.v1',     // khớp với package trong .proto
        protoPath: join(__dirname, '../src/proto/disnote/user/v1/user.proto'),
      },
    },
  );
  await app.listen();
}
bootstrap();
```

---

### Client — gọi sang service khác

**`app.module.ts`** — đăng ký gRPC client

```typescript
import { Module }          from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join }            from 'path';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'USER_GRPC_CLIENT',          // tên để inject
      transport: Transport.GRPC,
      options: {
        url: 'localhost:9090',            // địa chỉ service muốn gọi tới
        package: 'disnote.user.v1',
        protoPath: join(__dirname, '../src/proto/disnote/user/v1/user.proto'),
      },
    }]),
  ],
})
export class AppModule {}
```

**`some.service.ts`** — gọi đồng bộ sang service khác

```typescript
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc }                       from '@nestjs/microservices';
import {
  UserServiceClient,      // interface CLIENT
  USER_SERVICE_NAME,      // = "UserService"
} from '../generated/disnote/user/v1/user';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SomeService implements OnModuleInit {

  private userService: UserServiceClient;

  constructor(
    @Inject('USER_GRPC_CLIENT') private client: ClientGrpc
  ) {}

  onModuleInit() {
    // Lấy stub gọi đi — tương đương BlockingStub bên Java
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async getProfile(userId: string) {
    // firstValueFrom convert Observable thành Promise — gọi đồng bộ
    return firstValueFrom(
      this.userService.getUserProfile({ userId })
    );
  }
}
```

---

## Bảng so sánh nhanh

| | Java Client | Java Server | NestJS Server | NestJS Client |
|---|---|---|---|---|
| Annotation/Decorator | `@GrpcClient` | `@GrpcService` | `@UserServiceControllerMethods` | `@Inject('CLIENT_NAME')` |
| Class dùng | `UserServiceBlockingStub` | `extends UserServiceImplBase` | `implements UserServiceController` | `getService<UserServiceClient>` |
| Trả về | Object trực tiếp | `responseObserver.onNext()` | Plain object | `firstValueFrom(observable)` |
| Setup | `application.yml` grpc.client | `application.yml` grpc.server | `createMicroservice()` main.ts | `ClientsModule.register()` module |

---

## Import từ file generated — ai dùng gì

### Java — từ `UserServiceGrpc.java`

```java
// CLIENT dùng
UserServiceGrpc.UserServiceBlockingStub   // gọi đồng bộ

// SERVER dùng
UserServiceGrpc.UserServiceImplBase       // extend và override method

// KHÔNG cần đụng vào
UserServiceGrpc.UserServiceStub           // async streaming
UserServiceGrpc.UserServiceFutureStub     // future-based async
```

### NestJS — từ `user.ts` generated

```typescript
// SERVER dùng
UserServiceController           // interface implement
UserServiceControllerMethods    // decorator gắn lên class

// CLIENT dùng
UserServiceClient               // interface getService<T>
USER_SERVICE_NAME               // = "UserService"

// Cả hai dùng (kiểu dữ liệu)
GetUserProfileRequest
GetUserProfileResponse

// KHÔNG cần đụng vào
UserServiceService              // metadata nội bộ
UserServiceServer               // cho grpc-js thuần, không phải NestJS
encode / decode functions       // framework tự dùng
```

---

## Quy tắc snake_case vs camelCase

```
File .proto     →  snake_case  →  user_id, full_name, is_active
Java generated  →  camelCase   →  getUserId(), getFullName(), getIsActive()
NestJS generated → camelCase   →  userId, fullName, isActive
```

Khi trả về object trong NestJS **phải dùng camelCase**:

```typescript
// SAI
return { full_name: 'Alice' }   // ❌ snake_case

// ĐÚNG
return { fullName: 'Alice' }    // ✅ camelCase như trong generated interface
```

---

## Lệnh cần chạy

```bash
# Lấy file .proto về local (NestJS cần lúc runtime)
buf export buf.build/disnote/protos:main --output src/proto

# Generate code cho cả Java và NestJS
buf generate

# Java compile
./mvnw clean compile

# NestJS build
npm run build
```