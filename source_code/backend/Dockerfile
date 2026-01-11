# Multi-stage build for Spring Boot application with Gradle
FROM gradle:8.5-jdk17 AS build

# Set working directory
WORKDIR /app

# Copy the entire final_project directory
COPY final_project/ ./

# Build the application
RUN gradle clean build -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
