#!/usr/bin/env python3
import argparse
import subprocess
import sys
import re
from datetime import datetime

def run_cmd(cmd, check=True, capture_output=False):
    print(f"🚀 Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=capture_output, text=True)
    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        if capture_output:
            print(result.stderr)
        sys.exit(result.returncode)
    return result

def bump_version(part):
    with open("build.gradle.kts", "r") as f:
        content = f.read()
    
    match = re.search(r'version\s*=\s*"(\d+)\.(\d+)\.(\d+)"', content)
    if not match:
        print("❌ Could not find version in build.gradle.kts")
        sys.exit(1)
        
    major, minor, patch = map(int, match.groups())
    old_version = f"{major}.{minor}.{patch}"
    
    if part == "major":
        major += 1
        minor = 0
        patch = 0
    elif part == "minor":
        minor += 1
        patch = 0
    elif part == "patch":
        patch += 1
        
    new_version = f"{major}.{minor}.{patch}"
    print(f"📈 Bumping version: {old_version} -> {new_version}")
    
    new_content = re.sub(r'(version\s*=\s*")\d+\.\d+\.\d+(")', rf'\g<1>{new_version}\g<2>', content)
    with open("build.gradle.kts", "w") as f:
        f.write(new_content)
        
    return new_version

def release(part):
    print("🧹 Cleaning up old environments...")
    run_cmd(["python3", "manage.py", "stop"])
    
    new_version = bump_version(part)
    
    print("🧪 Running verification script...")
    run_cmd(["python3", "run_prod_smoke.py"])
    
    print(f"📦 Committing and tagging release v{new_version}...")
    run_cmd(["git", "add", "build.gradle.kts", "backend/src/main/resources/db/migration/V2__news.sql", "manage.py", "release.py", "run_prod_smoke.py", ".github/workflows/deployment.yml", "frontend/e2e/pages.spec.ts"])
    
    # Try to commit, but it's ok if there are no changes other than version
    result = run_cmd(["git", "commit", "-m", f"chore(release): v{new_version}"], check=False)
    
    run_cmd(["git", "tag", "-a", f"v{new_version}", "-m", f"Release v{new_version}"])
    run_cmd(["git", "push", "origin", "main", "--tags"])
    
    print(f"✅ Release v{new_version} initiated! GitHub Actions will now build and deploy.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Release workflow")
    parser.add_argument("--patch", action="store_true", help="Bump patch version")
    parser.add_argument("--minor", action="store_true", help="Bump minor version")
    parser.add_argument("--major", action="store_true", help="Bump major version")
    args = parser.parse_args()
    
    if args.major:
        part = "major"
    elif args.minor:
        part = "minor"
    elif args.patch:
        part = "patch"
    else:
        print("❌ You must specify --patch, --minor, or --major")
        sys.exit(1)
        
    release(part)
