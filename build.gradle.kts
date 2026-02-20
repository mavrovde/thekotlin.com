plugins {
    id("org.springframework.boot") version "3.2.2" apply false
    id("io.spring.dependency-management") version "1.1.4" apply false
    kotlin("jvm") version "1.9.22" apply false
    kotlin("plugin.spring") version "1.9.22" apply false
    kotlin("plugin.jpa") version "1.9.22" apply false
}

allprojects {
    group = "com.thekotlin"
    version = "0.0.1-SNAPSHOT"

    repositories {
        mavenCentral()
    }
}

tasks.register("buildAll") {
    description = "Build all subprojects (backend + frontend + admin)"
    group = "build"
    dependsOn(":backend:build", ":frontend:build", ":admin:build")
}

tasks.register("testAll") {
    description = "Test all subprojects"
    group = "verification"
    dependsOn(":backend:test", ":frontend:npmTest", ":admin:npmTest")
}
