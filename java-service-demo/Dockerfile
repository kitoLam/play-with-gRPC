FROM maven:3.9.7-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
# Tải dependencies trước để cache (có thể lỗi nếu pom cần code, nhưng an toàn cho pom cơ bản)
RUN mvn dependency:go-offline -B || true

COPY src ./src
# Build và tự động generate file proto qua protobuf-maven-plugin
RUN mvn clean package -Dmaven.test.skip=true

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/java-service-demo-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
