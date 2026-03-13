package com.thekotlin

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TheKotlinApplication

fun main(args: Array<String>) {
    runApplication<TheKotlinApplication>(*args)
}
