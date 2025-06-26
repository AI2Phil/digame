#!/usr/bin/env python3
"""
Git status summary and instructions for pushing to remote repository
"""

import sys

from dulwich import porcelain
from dulwich.repo import Repo


def show_git_summary():
    """Show comprehensive Git repository status and instructions."""
    try:
        repo = Repo(".")

        print("🔍 Git Repository Summary")
        print("=" * 50)

        # Show commit count
        try:
            commits = list(repo.get_walker())
            print(f"📝 Total commits: {len(commits)}")

            if commits:
                latest_commit = commits[0].commit
                print(
                    f"📅 Latest commit: {latest_commit.message.decode('utf-8').strip()}"
                )
                print(f"👤 Author: {latest_commit.author.decode('utf-8')}")
        except Exception:  # pylint: disable=broad-except
            print("📝 No commits found")

        # Show remote configuration
        config = repo.get_config()
        print("\n🌐 Remote Configuration:")

        remotes_found = False
        for section in config.sections():
            if len(section) == 2 and section[0] == b"remote":
                remote_name = section[1].decode("utf-8")
                try:
                    url = config.get(section, "url").decode("utf-8")
                    print(f"   {remote_name}: {url}")
                    remotes_found = True
                except KeyError:
                    pass

        if not remotes_found:
            print("   No remotes configured")

        # Show current status
        print("\n📊 Current Status:")
        status = porcelain.status(".")

        if status.untracked:
            print(f"   Untracked files: {len(status.untracked)}")
        if status.unstaged:
            print(f"   Modified files: {len(status.unstaged)}")
        if status.staged:
            print(f"   Staged files: {len(status.staged)}")

        if not any([status.untracked, status.unstaged, status.staged]):
            print("   ✅ Working tree clean - all changes committed")

        print("\n" + "=" * 50)
        print("🚀 Next Steps to Push to GitHub:")
        print("=" * 50)
        print()
        print("Option 1: Use GitHub CLI (if available)")
        print("   gh auth login")
        print("   gh repo create --source=. --public")
        print()
        print("Option 2: Manual Upload")
        print("   1. Create repository on GitHub.com")
        print("   2. Download/copy files from container")
        print("   3. Upload to GitHub via web interface")
        print()
        print("Option 3: Fix Container SSH/Git")
        print("   1. Rebuild devcontainer with Git tools")
        print("   2. Configure SSH keys or personal access token")
        print("   3. Use standard git push commands")
        print()
        print("Option 4: Use VSCode Git Extension")
        print("   1. Wait for Git extension to recognize repository")
        print("   2. Use VSCode's built-in Git interface")
        print("   3. Authenticate through VSCode")

        return True

    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Error reading repository: {e}")
        return False


def main():
    """Main function to show Git summary."""
    show_git_summary()


if __name__ == "__main__":
    main()
