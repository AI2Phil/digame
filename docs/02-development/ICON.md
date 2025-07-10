# Icon Documentation

This document provides a comprehensive overview of icons used throughout the Digame platform and available icons for future development.

## Overview

The project uses [Lucide React](https://lucide.dev/) as the primary icon library, providing a consistent and modern icon system across all components.

## Currently Used Icons

### Core Navigation & Actions
- `Store` - Marketplace, shopping, templates
- `Search` - Search functionality across components
- `Download` - Download actions, file retrieval
- `Upload` - Upload actions, file submission
- `RefreshCw` - Refresh, reload, sync operations
- `Plus` - Add new items, create actions
- `Edit` - Edit functionality, modification
- `MoreHorizontal` - More options, dropdown menus
- `Eye` - View, preview, visibility
- `Share` - Sharing functionality
- `Globe` - Public visibility, global access

### User & Community
- `Users` - Multiple users, teams, communities
- `User` - Single user, profile, account
- `Heart` - Favorites, likes, preferences
- `Star` - Ratings, featured items, bookmarks
- `MessageSquare` - Comments, discussions, chat
- `Tag` - Tags, labels, categorization

### Status & Feedback
- `Database` - Live data indicator, database connection
- `AlertTriangle` - Warnings, demo data, cautions
- `CheckCircle` - Success states, verification, completion
- `Activity` - Activity tracking, analytics, monitoring

### Workflow Specific
- `Workflow` - Workflow representations, automation

## Icon Usage by Component

### WorkflowMarketplace.jsx
```javascript
import {
  Store,        // Main marketplace icon
  Search,       // Template search
  Download,     // Template downloads
  Upload,       // Upload workflows
  Star,         // Ratings and featured items
  Heart,        // Favorites
  Share,        // Share workflows
  Eye,          // Preview templates
  Users,        // Community features
  User,         // User workflows
  Plus,         // Add/join actions
  Edit,         // Edit workflows
  RefreshCw,    // Refresh data
  Globe,        // Public workflows
  Database,     // Live data indicator
  AlertTriangle, // Demo data warning
  CheckCircle,  // Verified templates
  Activity,     // Community activity
  Workflow,     // Workflow representations
  MoreHorizontal, // More options
  MessageSquare, // Community discussions
  Tag           // Template tags
} from 'lucide-react';
```

## Available Unused Icons

### Navigation & Layout
- `Home` - Home page navigation
- `Menu` - Mobile menu toggle
- `X` - Close actions, dismiss
- `ChevronDown` - Dropdown indicators
- `ChevronRight` - Navigation arrows
- `ChevronLeft` - Back navigation
- `ChevronUp` - Collapse indicators
- `ArrowLeft` - Back actions
- `ArrowRight` - Forward actions
- `ArrowUp` - Up navigation
- `ArrowDown` - Down navigation

### File & Document Management
- `File` - Generic file representation
- `FileText` - Text documents
- `Folder` - Directory structure
- `FolderOpen` - Open directories
- `Archive` - Compressed files
- `Package` - Packages, bundles
- `Copy` - Copy actions
- `Cut` - Cut actions
- `Paste` - Paste actions
- `Trash2` - Delete actions
- `Save` - Save operations

### Communication & Social
- `Mail` - Email functionality
- `Phone` - Contact information
- `Bell` - Notifications
- `Link` - URL links, connections
- `ExternalLink` - External navigation
- `Bookmark` - Bookmarking
- `Flag` - Reporting, flagging

### Media & Content
- `Image` - Image files
- `Video` - Video content
- `Music` - Audio content
- `Camera` - Photo capture
- `Mic` - Audio recording
- `Volume2` - Audio controls
- `Play` - Play actions
- `Pause` - Pause actions
- `Stop` - Stop actions
- `SkipForward` - Next actions
- `SkipBack` - Previous actions

### System & Settings
- `Settings` - Configuration
- `Cog` - System settings
- `Sliders` - Adjustments, controls
- `Power` - Power actions
- `Wifi` - Network connectivity
- `Shield` - Security features
- `Lock` - Locked content
- `Unlock` - Unlocked content
- `Key` - Authentication

### Data & Analytics
- `BarChart3` - Bar charts
- `LineChart` - Line graphs
- `PieChart` - Pie charts
- `TrendingUp` - Growth indicators
- `TrendingDown` - Decline indicators
- `Target` - Goals, objectives
- `Zap` - Performance, speed
- `Cpu` - Processing power
- `Monitor` - Display, screens
- `Server` - Server infrastructure
- `Cloud` - Cloud services

### Time & Calendar
- `Calendar` - Date selection
- `Clock` - Time indicators
- `Timer` - Countdown timers
- `History` - Historical data
- `RotateCcw` - Undo actions
- `Repeat` - Repeat actions

### Status & Indicators
- `Info` - Information
- `Help` - Help content
- `Question` - Questions, FAQ
- `Lightbulb` - Ideas, tips
- `AlertCircle` - Alerts
- `XCircle` - Errors
- `CheckCircle2` - Alternative success
- `MinusCircle` - Removal
- `PlusCircle` - Addition

### Business & Finance
- `DollarSign` - Pricing, costs
- `CreditCard` - Payment methods
- `ShoppingCart` - Shopping functionality
- `Package2` - Products, items
- `Truck` - Shipping, delivery
- `Building` - Organizations
- `Briefcase` - Business, work

### Development & Technical
- `Code` - Code representation
- `Terminal` - Command line
- `GitBranch` - Version control
- `Database` - Data storage
- `Bug` - Bug tracking
- `Wrench` - Tools, utilities
- `Hammer` - Build processes

### Layout & Design
- `Grid` - Grid layouts
- `List` - List views
- `Table` - Table layouts
- `Layers` - Layer management
- `Move` - Drag and drop
- `Maximize` - Expand views
- `Minimize` - Collapse views
- `Square` - Shapes
- `Circle` - Circular elements

## Icon Usage Guidelines

### Consistency
- Use consistent icons for similar actions across components
- Maintain icon size consistency within component contexts
- Follow established patterns for icon placement

### Accessibility
- Always provide appropriate `aria-label` or `title` attributes
- Ensure sufficient color contrast for icon visibility
- Consider icon meaning in different cultural contexts

### Performance
- Import only the icons you need to minimize bundle size
- Use tree-shaking to eliminate unused icons
- Consider icon caching for frequently used icons

### Semantic Usage
- Choose icons that clearly represent their function
- Avoid using the same icon for different purposes
- Test icon recognition with users when possible

## Adding New Icons

When adding new icons to components:

1. **Import only what you need**:
```javascript
import { NewIcon } from 'lucide-react';
```

2. **Update this documentation** with the new icon usage

3. **Follow naming conventions**:
   - Use descriptive variable names
   - Group related icons in imports
   - Document the icon's purpose

4. **Test accessibility**:
   - Verify screen reader compatibility
   - Check color contrast requirements
   - Ensure keyboard navigation works

## Icon Customization

### Size Classes
- `h-3 w-3` - Extra small (12px)
- `h-4 w-4` - Small (16px) - Most common
- `h-5 w-5` - Medium (20px)
- `h-6 w-6` - Large (24px)
- `h-8 w-8` - Extra large (32px)

### Color Classes
- `text-muted-foreground` - Subtle, secondary
- `text-blue-500` - Primary actions
- `text-green-500` - Success states
- `text-red-500` - Errors, warnings
- `text-yellow-500` - Ratings, highlights
- `text-purple-500` - Special features

### Animation Classes
- `animate-spin` - Loading indicators
- `hover:scale-110` - Hover effects
- `transition-colors` - Smooth color changes

## Future Considerations

### Potential Icon Additions
- `Sparkles` - AI features, magic actions
- `Robot` - Automation, AI assistance
- `Rocket` - Performance, launch actions
- `Crown` - Premium features
- `Award` - Achievements, recognition
- `Compass` - Navigation, discovery
- `Map` - Location, routing
- `Palette` - Customization, themes

### Icon Library Alternatives
If Lucide React doesn't meet future needs, consider:
- Heroicons
- Feather Icons
- Phosphor Icons
- Tabler Icons

## Maintenance

This documentation should be updated whenever:
- New icons are added to components
- Icons are removed or replaced
- New icon patterns are established
- Accessibility requirements change

Last updated: January 2025