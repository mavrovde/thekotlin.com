plugins {
    // Auto-provisions the JDK 26 toolchain on machines that lack it (CI runners, CodeQL).
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}

rootProject.name = "thekotlin"

include("backend")
include("frontend")
include("admin")
