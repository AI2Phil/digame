#!/usr/bin/env python3
"""
Git setup script using dulwich (pure Python Git implementation)
This provides basic Git functionality when the git binary is not available.
"""

import os
import sys

from dulwich import porcelain
from dulwich.repo import Repo


def init_repo():
    """Initialize a Git repository"""
    try:
        porcelain.init(".")
        print("✅ Initialized empty Git repository in", os.getcwd())
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to initialize repository: {e}")
        return False


def add_files(files=None):
    """Add files to staging area"""
    try:
        if files is None:
            files = ["."]
        repo = Repo(".")
        porcelain.add(".", files)
        print(f"✅ Added files: {files}")
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to add files: {e}")
        return False


def commit(message):
    """Commit changes"""
    try:
        repo = Repo(".")
        porcelain.commit(".", message=message.encode("utf-8"))
        print(f"✅ Committed with message: {message}")
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to commit: {e}")
        return False


def status():
    """Show repository status"""
    try:
        repo = Repo(".")
        status_result = porcelain.status(".")

        print("Git Status:")
        if status_result.staged:
            print("Changes to be committed:")
            for item in status_result.staged:
                item_str = (
                    item.decode("utf-8") if isinstance(item, bytes) else str(item)
                )
                print(f"  modified: {item_str}")

        if status_result.unstaged:
            print("Changes not staged for commit:")
            for item in status_result.unstaged:
                item_str = (
                    item.decode("utf-8") if isinstance(item, bytes) else str(item)
                )
                print(f"  modified: {item_str}")

        if status_result.untracked:
            print("Untracked files:")
            for item in status_result.untracked:
                item_str = (
                    item.decode("utf-8") if isinstance(item, bytes) else str(item)
                )
                print(f"  {item_str}")

        if not any(
            [status_result.staged, status_result.unstaged, status_result.untracked]
        ):
            print("Working tree clean")

        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to get status: {e}")
        return False


def setup_git_config():
    """Set up basic Git configuration"""
    try:
        repo = Repo(".")
        config = repo.get_config()

        # Check if user is already configured
        try:
            user_name = config.get(("user",), "name")
            user_email = config.get(("user",), "email")
            print(
                f"✅ Git already configured for: {user_name.decode('utf-8')} <{user_email.decode('utf-8')}>"
            )
            return True
        except KeyError:
            print("⚠️  Git user not configured. Please run:")
            print("python3 git-setup.py config 'Your Name' 'your.email@example.com'")
            return False
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to check config: {e}")
        return False


def set_config(name, email):
    """Set Git user configuration"""
    try:
        repo = Repo(".")
        config = repo.get_config()
        config.set(("user",), "name", name.encode("utf-8"))
        config.set(("user",), "email", email.encode("utf-8"))
        config.write_to_path()
        print(f"✅ Configured Git user: {name} <{email}>")
        return True
    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Failed to set config: {e}")
        return False


def main():
    """Main function to handle command line arguments and execute Git operations."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 git-setup.py init                    # Initialize repository")
        print("  python3 git-setup.py config 'Name' 'email'   # Set user config")
        print(
            "  python3 git-setup.py add [files]             # Add files (default: all)"
        )
        print("  python3 git-setup.py commit 'message'        # Commit changes")
        print("  python3 git-setup.py status                  # Show status")
        sys.exit(1)

    command = sys.argv[1]

    if command == "init":
        init_repo()
    elif command == "config" and len(sys.argv) == 4:
        set_config(sys.argv[2], sys.argv[3])
    elif command == "add":
        files = sys.argv[2:] if len(sys.argv) > 2 else None
        add_files(files)
    elif command == "commit" and len(sys.argv) == 3:
        commit(sys.argv[2])
    elif command == "status":
        status()
    else:
        print("Invalid command or arguments")
        sys.exit(1)


if __name__ == "__main__":
    main()
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 git-setup.py init                    # Initialize repository")
        print("  python3 git-setup.py config 'Name' 'email'   # Set user config")
        print(
            "  python3 git-setup.py add [files]             # Add files (default: all)"
        )
        print("  python3 git-setup.py commit 'message'        # Commit changes")
        print("  python3 git-setup.py status                  # Show status")
        sys.exit(1)

    command = sys.argv[1]

    if command == "init":
        init_repo()
    elif command == "config" and len(sys.argv) == 4:
        set_config(sys.argv[2], sys.argv[3])
    elif command == "add":
        files = sys.argv[2:] if len(sys.argv) > 2 else None
        add_files(files)
    elif command == "commit" and len(sys.argv) == 3:
        commit(sys.argv[2])
    elif command == "status":
        status()
    else:
        print("Invalid command or arguments")
        sys.exit(1)
