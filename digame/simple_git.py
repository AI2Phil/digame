#!/usr/bin/env python3
"""
Simple Git workflow using dulwich for basic operations
"""

import sys

from dulwich import porcelain
from dulwich.repo import Repo


def main():
    """Main function to handle Git operations via command line interface."""
    if len(sys.argv) < 2:
        print("Git Terminal Commands Available:")
        print("================================")
        print()
        print("Basic Commands:")
        print("  python3 simple_git.py init                    # Initialize repository")
        print("  python3 simple_git.py config 'Name' 'email'   # Set user config")
        print("  python3 simple_git.py add-all                 # Add all files")
        print("  python3 simple_git.py commit 'message'        # Commit changes")
        print("  python3 simple_git.py status                  # Show basic status")
        print()
        print("Example Workflow:")
        print("  python3 simple_git.py init")
        print("  python3 simple_git.py config 'Your Name' 'your.email@example.com'")
        print("  python3 simple_git.py add-all")
        print("  python3 simple_git.py commit 'Initial commit'")
        print()
        print("Note: This replaces the missing 'git' command in your devcontainer.")
        print("For pushing to remote repositories, you'll need to set up the remote")
        print("repository configuration separately.")
        return

    command = sys.argv[1]

    try:
        if command == "init":
            porcelain.init(".")
            print("✅ Initialized empty Git repository")

        elif command == "config" and len(sys.argv) == 4:
            repo = Repo(".")
            config = repo.get_config()
            config.set(("user",), "name", sys.argv[2].encode("utf-8"))
            config.set(("user",), "email", sys.argv[3].encode("utf-8"))
            config.write_to_path()
            print(f"✅ Configured Git user: {sys.argv[2]} <{sys.argv[3]}>")

        elif command == "add-all":
            # Add all files in current directory
            porcelain.add(".", ["."])
            print("✅ Added all files to staging area")

        elif command == "commit" and len(sys.argv) == 3:
            porcelain.commit(".", message=sys.argv[2].encode("utf-8"))
            print(f"✅ Committed: {sys.argv[2]}")

        elif command == "status":
            try:
                status = porcelain.status(".")
                print("Git Status:")

                if status.untracked:
                    print(f"Untracked files: {len(status.untracked)}")
                if status.unstaged:
                    print(f"Modified files: {len(status.unstaged)}")
                if status.staged:
                    print(f"Staged files: {len(status.staged)}")

                if not any([status.untracked, status.unstaged, status.staged]):
                    print("Working tree clean")

            except Exception as e:  # pylint: disable=broad-except
                print(f"Status check failed: {e}")

        else:
            print("Invalid command. Run without arguments to see usage.")

    except Exception as e:  # pylint: disable=broad-except
        print(f"❌ Error: {e}")
        if "NotGitRepository" in str(e):
            print("💡 Tip: Run 'python3 simple_git.py init' first")


if __name__ == "__main__":
    main()
