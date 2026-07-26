# Build Stage: Build Spring Boot app using Maven and JDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage: Lightweight JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Expose port (Render automatically sets $PORT environment variable)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
