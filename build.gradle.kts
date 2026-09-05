plugins {
    id("org.springframework.boot") version "4.1.1" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
    kotlin("jvm") version "2.4.10" apply false
    kotlin("plugin.spring") version "2.4.10" apply false
    kotlin("plugin.jpa") version "2.4.10" apply false
}

allprojects {
    group = "com.thekotlin"
    version = "1.0.13"

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
