pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.5.16"
        id("io.spring.dependency-management") version "1.1.7"
        kotlin("jvm") version "2.4.10"
        kotlin("plugin.spring") version "2.4.10"
        kotlin("plugin.jpa") version "2.4.10"
    }
}

plugins {
    // Auto-provisions the JDK 26 toolchain on machines that lack it (CI runners, CodeQL).
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "backend"
