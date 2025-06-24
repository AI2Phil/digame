#!/usr/bin/env python3
"""
Digame Documentation Automation Script

This script automates various documentation maintenance tasks including:
- API documentation generation from OpenAPI specs
- Link validation across all documentation
- Documentation metrics collection
- Automated screenshot generation
- Documentation site building and deployment

Usage:
    python scripts/documentation_automation.py --help
    python scripts/documentation_automation.py generate-api-docs
    python scripts/documentation_automation.py validate-links
    python scripts/documentation_automation.py collect-metrics
    python scripts/documentation_automation.py build-site
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import requests
import yaml
from bs4 import BeautifulSoup


class DocumentationAutomation:
    """Main class for documentation automation tasks."""
    
    def __init__(self, base_dir: Optional[str] = None):
        """Initialize the documentation automation system."""
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent
        self.docs_dir = self.base_dir / "docs"
        self.api_docs_dir = self.docs_dir / "api"
        self.scripts_dir = self.base_dir / "scripts"
        
        # Configuration
        self.config = self._load_config()
        
        # Metrics storage
        self.metrics: Dict[str, Any] = {
            "timestamp": datetime.now().isoformat(),
            "total_files": 0,
            "total_links": 0,
            "broken_links": 0,
            "api_endpoints": 0,
            "coverage_percentage": 0.0
        }
    
    def _load_config(self) -> Dict:
        """Load configuration from config file or use defaults."""
        config_file = self.scripts_dir / "documentation_config.yaml"
        
        default_config = {
            "api_base_url": "http://localhost:8000",
            "openapi_endpoint": "/openapi.json",
            "excluded_paths": [".git", "__pycache__", "node_modules"],
            "link_timeout": 10,
            "screenshot_config": {
                "width": 1200,
                "height": 800,
                "delay": 2
            },
            "site_config": {
                "title": "Digame Documentation",
                "description": "Comprehensive documentation for the Digame platform",
                "theme": "material"
            }
        }
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                user_config = yaml.safe_load(f)
                default_config.update(user_config)
        
        return default_config
    
    def generate_api_docs(self) -> bool:
        """Generate API documentation from OpenAPI specification."""
        print("🔄 Generating API documentation from OpenAPI spec...")
        
        try:
            # Fetch OpenAPI specification
            api_url = f"{self.config['api_base_url']}{self.config['openapi_endpoint']}"
            response = requests.get(api_url, timeout=self.config['link_timeout'])
            response.raise_for_status()
            
            openapi_spec = response.json()
            
            # Generate documentation for each tag/module
            self._generate_endpoint_docs(openapi_spec)
            
            # Generate schemas documentation
            self._generate_schema_docs(openapi_spec)
            
            # Update API overview
            self._update_api_overview(openapi_spec)
            
            print("✅ API documentation generated successfully")
            return True
            
        except requests.RequestException as e:
            print(f"❌ Failed to fetch OpenAPI spec: {e}")
            return False
        except Exception as e:
            print(f"❌ Error generating API docs: {e}")
            return False
    
    def _generate_endpoint_docs(self, openapi_spec: Dict) -> None:
        """Generate documentation for API endpoints grouped by tags."""
        paths = openapi_spec.get("paths", {})
        tags = openapi_spec.get("tags", [])
        
        # Group endpoints by tags
        endpoints_by_tag = {}
        for path, methods in paths.items():
            for method, spec in methods.items():
                if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                    endpoint_tags = spec.get("tags", ["untagged"])
                    for tag in endpoint_tags:
                        if tag not in endpoints_by_tag:
                            endpoints_by_tag[tag] = []
                        endpoints_by_tag[tag].append({
                            "path": path,
                            "method": method.upper(),
                            "spec": spec
                        })
        
        # Generate documentation for each tag
        for tag, endpoints in endpoints_by_tag.items():
            self._write_tag_documentation(tag, endpoints, tags)
    
    def _write_tag_documentation(self, tag: str, endpoints: List[Dict], tag_definitions: List[Dict]) -> None:
        """Write documentation for a specific tag/module."""
        # Find tag description
        tag_info = next((t for t in tag_definitions if t.get("name") == tag), {})
        tag_description = tag_info.get("description", f"API endpoints for {tag}")
        
        # Create filename
        filename = f"{tag.lower().replace(' ', '_').replace('-', '_')}.md"
        filepath = self.api_docs_dir / filename
        
        # Generate content
        content = self._generate_tag_content(tag, tag_description, endpoints)
        
        # Write file
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"📝 Generated documentation for {tag}: {filename}")
    
    def _generate_tag_content(self, tag: str, description: str, endpoints: List[Dict]) -> str:
        """Generate markdown content for a tag's endpoints."""
        content = f"""# {tag} API

{description}

## Endpoints

"""
        
        for endpoint in sorted(endpoints, key=lambda x: (x["path"], x["method"])):
            path = endpoint["path"]
            method = endpoint["method"]
            spec = endpoint["spec"]
            
            summary = spec.get("summary", f"{method} {path}")
            description = spec.get("description", "")
            
            content += f"""### {summary}

```http
{method} {path}
```

{description}

"""
            
            # Add parameters if present
            parameters = spec.get("parameters", [])
            if parameters:
                content += "**Parameters:**\n\n"
                for param in parameters:
                    param_name = param.get("name", "")
                    param_type = param.get("schema", {}).get("type", "string")
                    param_desc = param.get("description", "")
                    required = " (required)" if param.get("required", False) else " (optional)"
                    content += f"- `{param_name}` ({param_type}){required} - {param_desc}\n"
                content += "\n"
            
            # Add request body if present
            request_body = spec.get("requestBody", {})
            if request_body:
                content += "**Request Body:**\n\n"
                content_types = request_body.get("content", {})
                for content_type, schema_info in content_types.items():
                    content += f"Content-Type: `{content_type}`\n\n"
                    # Add example if available
                    example = schema_info.get("example")
                    if example:
                        content += "```json\n"
                        content += json.dumps(example, indent=2)
                        content += "\n```\n\n"
            
            # Add responses
            responses = spec.get("responses", {})
            if responses:
                content += "**Responses:**\n\n"
                for status_code, response_spec in responses.items():
                    response_desc = response_spec.get("description", "")
                    content += f"- `{status_code}`: {response_desc}\n"
                content += "\n"
            
            content += "---\n\n"
        
        return content
    
    def _generate_schema_docs(self, openapi_spec: Dict) -> None:
        """Generate documentation for API schemas."""
        components = openapi_spec.get("components", {})
        schemas = components.get("schemas", {})
        
        if not schemas:
            return
        
        # Create schemas directory
        schemas_dir = self.api_docs_dir / "schemas"
        schemas_dir.mkdir(exist_ok=True)
        
        # Generate schema documentation
        content = "# API Schemas\n\n"
        content += "This document describes the data models used in the Digame API.\n\n"
        
        for schema_name, schema_spec in sorted(schemas.items()):
            content += f"## {schema_name}\n\n"
            
            description = schema_spec.get("description", "")
            if description:
                content += f"{description}\n\n"
            
            # Add properties
            properties = schema_spec.get("properties", {})
            if properties:
                content += "**Properties:**\n\n"
                content += "| Field | Type | Description | Required |\n"
                content += "|-------|------|-------------|----------|\n"
                
                required_fields = schema_spec.get("required", [])
                
                for prop_name, prop_spec in sorted(properties.items()):
                    prop_type = prop_spec.get("type", "unknown")
                    prop_desc = prop_spec.get("description", "")
                    is_required = "Yes" if prop_name in required_fields else "No"
                    
                    content += f"| `{prop_name}` | {prop_type} | {prop_desc} | {is_required} |\n"
                
                content += "\n"
            
            # Add example if available
            example = schema_spec.get("example")
            if example:
                content += "**Example:**\n\n"
                content += "```json\n"
                content += json.dumps(example, indent=2)
                content += "\n```\n\n"
            
            content += "---\n\n"
        
        # Write schemas documentation
        with open(schemas_dir / "README.md", 'w') as f:
            f.write(content)
        
        print("📝 Generated API schemas documentation")
    
    def _update_api_overview(self, openapi_spec: Dict) -> None:
        """Update the main API overview with current information."""
        info = openapi_spec.get("info", {})
        version = info.get("version", "1.0.0")
        title = info.get("title", "Digame API")
        description = info.get("description", "")
        
        # Count endpoints
        paths = openapi_spec.get("paths", {})
        endpoint_count = sum(
            len([m for m in methods.keys() if m.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]])
            for methods in paths.values()
        )
        
        self.metrics["api_endpoints"] = endpoint_count
        
        print(f"📊 API Overview: {endpoint_count} endpoints documented")
    
    def validate_links(self) -> bool:
        """Validate all links in documentation files."""
        print("🔄 Validating documentation links...")
        
        broken_links = []
        total_links = 0
        
        # Find all markdown files
        md_files = list(self.docs_dir.rglob("*.md"))
        
        for md_file in md_files:
            if any(excluded in str(md_file) for excluded in self.config["excluded_paths"]):
                continue
            
            file_broken_links = self._validate_file_links(md_file)
            broken_links.extend(file_broken_links)
            
            # Count total links in file
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
                total_links += len(re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content))
        
        self.metrics["total_links"] = total_links
        self.metrics["broken_links"] = len(broken_links)
        
        if broken_links:
            print(f"❌ Found {len(broken_links)} broken links:")
            for link_info in broken_links:
                print(f"  - {link_info['file']}: {link_info['link']} ({link_info['error']})")
            return False
        else:
            print(f"✅ All {total_links} links are valid")
            return True
    
    def _validate_file_links(self, file_path: Path) -> List[Dict]:
        """Validate links in a specific file."""
        broken_links = []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all markdown links
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        
        for link_text, link_url in links:
            if self._is_external_link(link_url):
                # Validate external links
                if not self._validate_external_link(link_url):
                    broken_links.append({
                        "file": str(file_path.relative_to(self.base_dir)),
                        "link": link_url,
                        "text": link_text,
                        "error": "External link unreachable"
                    })
            else:
                # Validate internal links
                if not self._validate_internal_link(file_path, link_url):
                    broken_links.append({
                        "file": str(file_path.relative_to(self.base_dir)),
                        "link": link_url,
                        "text": link_text,
                        "error": "Internal link not found"
                    })
        
        return broken_links
    
    def _is_external_link(self, url: str) -> bool:
        """Check if a URL is an external link."""
        return url.startswith(('http://', 'https://', 'ftp://'))
    
    def _validate_external_link(self, url: str) -> bool:
        """Validate an external link."""
        try:
            response = requests.head(url, timeout=self.config["link_timeout"], allow_redirects=True)
            return response.status_code < 400
        except requests.RequestException:
            return False
    
    def _validate_internal_link(self, current_file: Path, link_url: str) -> bool:
        """Validate an internal link."""
        # Remove anchor if present
        if '#' in link_url:
            link_url = link_url.split('#')[0]
        
        if not link_url:  # Just an anchor
            return True
        
        # Resolve relative path
        if link_url.startswith('/'):
            # Absolute path from docs root
            target_path = self.docs_dir / link_url.lstrip('/')
        else:
            # Relative path from current file
            target_path = current_file.parent / link_url
        
        # Normalize path
        target_path = target_path.resolve()
        
        return target_path.exists()
    
    def collect_metrics(self) -> Dict:
        """Collect documentation metrics."""
        print("📊 Collecting documentation metrics...")
        
        # Count files
        md_files = list(self.docs_dir.rglob("*.md"))
        self.metrics["total_files"] = len(md_files)
        
        # Calculate coverage (placeholder - would need more sophisticated logic)
        # For now, assume coverage based on presence of key documentation files
        required_files = [
            "README.md",
            "api/README.md",
            "user_guides/README.md",
            "developer/README.md",
            "knowledge_base/README.md"
        ]
        
        existing_files = sum(1 for f in required_files if (self.docs_dir / f).exists())
        self.metrics["coverage_percentage"] = (existing_files / len(required_files)) * 100
        
        # Save metrics
        metrics_file = self.docs_dir / "metrics.json"
        with open(metrics_file, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        
        print(f"📈 Documentation metrics:")
        print(f"  - Total files: {self.metrics['total_files']}")
        print(f"  - Total links: {self.metrics['total_links']}")
        print(f"  - Broken links: {self.metrics['broken_links']}")
        print(f"  - API endpoints: {self.metrics['api_endpoints']}")
        print(f"  - Coverage: {self.metrics['coverage_percentage']:.1f}%")
        
        return self.metrics
    
    def build_site(self) -> bool:
        """Build the documentation site."""
        print("🏗️ Building documentation site...")
        
        try:
            # This would integrate with a static site generator like MkDocs
            # For now, we'll create a simple index
            self._create_site_index()
            
            print("✅ Documentation site built successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error building site: {e}")
            return False
    
    def _create_site_index(self) -> None:
        """Create a simple site index."""
        index_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digame Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .link-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-decoration: none; color: inherit; }
        .link-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .link-title { font-weight: bold; margin-bottom: 10px; color: #007bff; }
        .link-desc { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Digame Platform Documentation</h1>
        <p>Comprehensive documentation for the Digame Digital Professional Twin Platform</p>
    </div>
    
    <div class="section">
        <h2>📚 Documentation Sections</h2>
        <div class="links">
            <a href="README.html" class="link-card">
                <div class="link-title">📖 Main Documentation</div>
                <div class="link-desc">Complete overview and getting started guide</div>
            </a>
            <a href="api/README.html" class="link-card">
                <div class="link-title">🔧 API Documentation</div>
                <div class="link-desc">Comprehensive API reference and examples</div>
            </a>
            <a href="user_guides/README.html" class="link-card">
                <div class="link-title">👥 User Guides</div>
                <div class="link-desc">Step-by-step guides for end users</div>
            </a>
            <a href="developer/README.html" class="link-card">
                <div class="link-title">💻 Developer Documentation</div>
                <div class="link-desc">Technical guides for developers</div>
            </a>
            <a href="knowledge_base/README.html" class="link-card">
                <div class="link-title">📚 Knowledge Base</div>
                <div class="link-desc">Best practices, tutorials, and FAQ</div>
            </a>
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Quick Start</h2>
        <div class="links">
            <a href="user_guides/getting_started.html" class="link-card">
                <div class="link-title">🎯 Getting Started</div>
                <div class="link-desc">New user onboarding and setup</div>
            </a>
            <a href="developer/setup.html" class="link-card">
                <div class="link-title">⚙️ Development Setup</div>
                <div class="link-desc">Set up your development environment</div>
            </a>
            <a href="api/README.html" class="link-card">
                <div class="link-title">🔌 API Quick Start</div>
                <div class="link-desc">Start using the Digame API</div>
            </a>
        </div>
    </div>
    
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #666; text-align: center;">
        <p>Generated on """ + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + """</p>
    </footer>
</body>
</html>"""
        
        # Write index file
        site_dir = self.base_dir / "site"
        site_dir.mkdir(exist_ok=True)
        
        with open(site_dir / "index.html", 'w') as f:
            f.write(index_content)


def main():
    """Main entry point for the documentation automation script."""
    parser = argparse.ArgumentParser(
        description="Digame Documentation Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/documentation_automation.py generate-api-docs
  python scripts/documentation_automation.py validate-links
  python scripts/documentation_automation.py collect-metrics
  python scripts/documentation_automation.py build-site
  python scripts/documentation_automation.py all
        """
    )
    
    parser.add_argument(
        "command",
        choices=["generate-api-docs", "validate-links", "collect-metrics", "build-site", "all"],
        help="Command to execute"
    )
    
    parser.add_argument(
        "--base-dir",
        help="Base directory of the project (default: auto-detect)"
    )
    
    parser.add_argument(
        "--config",
        help="Configuration file path"
    )
    
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    
    # Initialize automation system
    automation = DocumentationAutomation(base_dir=args.base_dir)
    
    # Execute command
    success = True
    
    if args.command == "generate-api-docs":
        success = automation.generate_api_docs()
    elif args.command == "validate-links":
        success = automation.validate_links()
    elif args.command == "collect-metrics":
        automation.collect_metrics()
    elif args.command == "build-site":
        success = automation.build_site()
    elif args.command == "all":
        print("🚀 Running all documentation automation tasks...\n")
        
        success &= automation.generate_api_docs()
        print()
        
        success &= automation.validate_links()
        print()
        
        automation.collect_metrics()
        print()
        
        success &= automation.build_site()
        print()
        
        if success:
            print("✅ All documentation automation tasks completed successfully!")
        else:
            print("❌ Some tasks failed. Please check the output above.")
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()