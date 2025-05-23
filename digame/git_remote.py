#!/usr/bin/env python3
"""
Git remote operations using dulwich for pushing to remote repositories
"""

import sys

from dulwich import porcelain
from dulwich.repo import Repo


def add_remote(name, url):
    """Add a remote repository."""
    try:
        repo = Repo(".")
        config = repo.get_config()
        config.set(("remote", name.encode("utf-8")), "url", url.encode("utf-8"))
        config.set(
            ("remote", name.encode("utf-8")),
            "fetch",
            f"+refs/heads/*:refs/remotes/{name}/*".encode("utf-8"),
        )
        config.write_to_path()
        print(f"✅ Added remote '{name}': {url}")
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to add remote: {e}")
        return False


def push_to_remote(remote_name="origin", branch="main"):
    """Push to remote repository."""
    try:
        repo = Repo(".")
        porcelain.push(
            repo, remote_location=remote_name, refspecs=[f"refs/heads/{branch}"]
        )
        print(f"✅ Pushed to {remote_name}/{branch}")
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to push: {e}")
        print("💡 Make sure you have:")
        print("   - Added a remote repository")
        print("   - Have proper authentication (SSH keys or tokens)")
        print("   - The remote repository exists")
        return False


def list_remotes():
    """List configured remote repositories."""
    try:
        repo = Repo(".")
        config = repo.get_config()
        remotes = []

        for section in config.sections():
            if len(section) == 2 and section[0] == b"remote":
                remote_name = section[1].decode("utf-8")
                try:
                    url = config.get(section, "url").decode("utf-8")
                    remotes.append((remote_name, url))
                except KeyError:
                    pass

        if remotes:
            print("Configured remotes:")
            for name, url in remotes:
                print(f"  {name}: {url}")
        else:
            print("No remotes configured")

        return remotes
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to list remotes: {e}")
        return []


def main():
    """Main function to handle remote Git operations."""
    if len(sys.argv) < 2:
        print("Git Remote Operations:")
        print("====================")
        print()
        print("Commands:")
        print(
            "  python3 git_remote.py add-remote <name> <url>    # Add remote repository"
        )
        print(
            "  python3 git_remote.py list-remotes               # List configured remotes"
        )
        print(
            "  python3 git_remote.py push [remote] [branch]     # Push to remote (default: origin main)"
        )
        print()
        print("Examples:")
        print(
            "  python3 git_remote.py add-remote origin https://github.com/username/repo.git"
        )
        print(
            "  python3 git_remote.py add-remote origin git@github.com:username/repo.git"
        )
        print("  python3 git_remote.py push")
        print("  python3 git_remote.py push origin main")
        print()
        print(
            "Note: You need to create the remote repository first on GitHub/GitLab/etc."
        )
        return

    command = sys.argv[1]

    if command == "add-remote" and len(sys.argv) == 4:
        add_remote(sys.argv[2], sys.argv[3])
    elif command == "list-remotes":
        list_remotes()
    elif command == "push":
        remote = sys.argv[2] if len(sys.argv) > 2 else "origin"
        branch = sys.argv[3] if len(sys.argv) > 3 else "main"
        push_to_remote(remote, branch)
    else:
        print("Invalid command. Run without arguments to see usage.")


if __name__ == "__main__":
    main()
