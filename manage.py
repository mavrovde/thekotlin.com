#!/usr/bin/env python3
import argparse
import subprocess
import sys
import re

def run_cmd(cmd, check=True):
    print(f"🚀 Running: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)

def start():
    run_cmd(["docker-compose", "-f", "docker-compose.yml", "up", "-d"])

def start_prod():
    run_cmd(["docker-compose", "-f", "docker-compose.prod.yml", "up", "-d"])

def stop():
    run_cmd(["docker-compose", "-f", "docker-compose.yml", "down"])
    run_cmd(["docker-compose", "-f", "docker-compose.prod.yml", "down"])

def restart():
    stop()
    start()

def build():
    run_cmd(["./gradlew", "build", "--no-daemon"], check=False)
    run_cmd(["docker-compose", "build"])

def main():
    parser = argparse.ArgumentParser(description="Manage local environment")
    parser.add_argument("action", choices=["start", "start-prod", "stop", "restart", "build"], help="Action to perform")
    args = parser.parse_args()

    if args.action == "start":
        start()
    elif args.action == "start-prod":
        start_prod()
    elif args.action == "stop":
        stop()
    elif args.action == "restart":
        restart()
    elif args.action == "build":
        build()

if __name__ == "__main__":
    main()
