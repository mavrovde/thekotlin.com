plugins {
    base
}

tasks.register<Exec>("npmInstall") {
    description = "Install npm dependencies"
    workingDir = projectDir
    commandLine("npm", "install")
}

tasks.register<Exec>("npmBuild") {
    description = "Build the Next.js admin app"
    dependsOn("npmInstall")
    workingDir = projectDir
    commandLine("npm", "run", "build")
}

tasks.register<Exec>("npmTest") {
    description = "Run admin tests"
    dependsOn("npmInstall")
    workingDir = projectDir
    commandLine("npm", "test", "--", "--passWithNoTests")
}

tasks.register<Exec>("npmDev") {
    description = "Start Next.js admin dev server"
    dependsOn("npmInstall")
    workingDir = projectDir
    commandLine("npm", "run", "dev")
}

tasks.named("build") {
    dependsOn("npmBuild")
}

tasks.named("check") {
    dependsOn("npmTest")
}
