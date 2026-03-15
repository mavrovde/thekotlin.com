import os
import subprocess
import time
import sys

def run_cmd(cmd, check=True):
    print(f"Executing: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    result = subprocess.run(cmd, shell=isinstance(cmd, str))
    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result

def generate_ssl():
    print("🔒 Generating local SSL certificates for Nginx proxy...")
    os.makedirs("ssl", exist_ok=True)
    if not os.path.exists("ssl/cert.pem"):
        run_cmd([
            "openssl", "req", "-x509", "-newkey", "rsa:4096",
            "-keyout", "ssl/key.pem", "-out", "ssl/cert.pem",
            "-sha256", "-days", "365", "-nodes",
            "-subj", "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        ])

def start_stack():
    print("🚀 Bringing up the production Docker Compose stack (v0.1.1)...")
    env = os.environ.copy()
    env["IMAGE_TAG"] = os.environ.get("IMAGE_TAG", "latest")
    subprocess.run(
        ["docker-compose", "-f", "docker-compose.prod.yml", "up", "-d"],
        env=env,
        check=True
    )
    
    print("⏳ Waiting for services to be healthy (15 seconds)...")
    time.sleep(15)

def run_tests():
    print("🧪 Running Production Smoke Tests...")
    original_cwd = os.getcwd()
    os.chdir("frontend")
    try:
        run_cmd(["npx", "playwright", "test", "smoke/prod-smoke.spec.ts"])
    finally:
        os.chdir(original_cwd)

def cleanup():
    print("🧹 Cleaning up...")
    run_cmd(["docker-compose", "-f", "docker-compose.prod.yml", "down"])

def main():
    generate_ssl()
    try:
        start_stack()
        run_tests()
        print("✅ Smoke tests passed successfully!")
    finally:
        cleanup()

if __name__ == "__main__":
    main()
