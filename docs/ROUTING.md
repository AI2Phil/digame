# Next.js Routing Guidelines Compliance Checklist

## Overview

This document tracks compliance with the routing guidelines established in [`ROUTING_AUDIT.md`](./ROUTING_AUDIT.md) lines 134-256. 
The goal is to ensure consistent routing patterns across the application following Next.js best practices.

## Routing Guidelines Summary

### **Section Landing Pages**
Use `index.tsx` if:
- The route (e.g., `/platform-owner`) is actively used in navigation
- It represents a dashboard or overview

### **Feature-Specific Pages**
Use `section/feature.tsx` when:
- The section doesn't need a `/section` landing route
- Routes are accessed directly via subpaths (e.g., `/analytics/web`)

### **5-Point Test for `index.tsx` Requirements**
1. ✅ **Is `/section` used as a top-level route?** - Check navigation config
2. ✅ **Do users land on `/section` as a default path?** - Test browser behavior
3. ✅ **Is there an existing pseudo-index?** - Look for `dashboard.tsx`, `overview.tsx`, or `landing.tsx`
4. ✅ **Does the section represent a "hub" of subfeatures?** - Evaluate section purpose
5. ✅ **Is the absence causing 404s or broken UX?** - Test route accessibility

---

## Current Compliance Status

### ✅ **COMPLIANT SECTIONS** (Have proper `index.tsx`)

| Section | Route | File | Navigation Usage | Status |
|---------|-------|------|------------------|---------|
| **Dashboard** | `/dashboard` | [`dashboard/index.tsx`](../frontend/src/pages/dashboard/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **AI Tools** | `/ai-tools` | [`ai-tools/index.tsx`](../frontend/src/pages/ai-tools/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Learning** | `/learning` | [`learning/index.tsx`](../frontend/src/pages/learning/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Career** | `/career` | [`career/index.tsx`](../frontend/src/pages/career/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Reports** | `/reports` | [`reports/index.jsx`](../frontend/src/pages/reports/index.jsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Security** | `/security` | [`security/index.tsx`](../frontend/src/pages/security/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Integrations** | `/integrations` | [`integrations/index.jsx`](../frontend/src/pages/integrations/index.jsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Enterprise** | `/enterprise` | [`enterprise/index.tsx`](../frontend/src/pages/enterprise/index.tsx) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Platform Owner** | `/platform-owner` | [`platform-owner/index.js`](../frontend/src/pages/platform-owner/index.js) | ✅ Used in navigation | ✅ **COMPLIANT** |
| **Performance** | `/performance` | [`performance/index.tsx`](../frontend/src/pages/performance/index.tsx) | ❌ Not in navigation | ⚠️ **REVIEW NEEDED** |
| **Social** | `/social` | [`social/index.tsx`](../frontend/src/pages/social/index.tsx) | ❌ Not in navigation | ⚠️ **REVIEW NEEDED** |
| **Onboarding** | `/onboarding` | [`onboarding/index.jsx`](../frontend/src/pages/onboarding/index.jsx) | ❌ Not in navigation | ⚠️ **REVIEW NEEDED** |

### 🔍 **SECTIONS REQUIRING ANALYSIS**

| Section | Navigation Route | Current Structure | 5-Point Test Status | Action Required |
|---------|------------------|-------------------|-------------------|-----------------|
| **Analytics** | `/analytics/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/analytics` landing needed** |
| **Digital Twin** | `/digital-twin/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/digital-twin` landing needed** |
| **AI** | `/ai/*` | Has `ai/index.tsx` | ✅ **COMPLIANT** | ✅ **No action needed** |
| **Workflow** | `/workflow/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/workflow` landing needed** |
| **Tasks** | `/tasks/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/tasks` landing needed** |
| **Team** | `/team/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/team` landing needed** |
| **Admin** | `/admin/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/admin` landing needed** |
| **Monitoring** | `/monitoring/*` | No `index.tsx` | 🔍 **NEEDS EVALUATION** | [ ] **Evaluate if `/monitoring` landing needed** |

### ❌ **NON-COMPLIANT SECTIONS** (Missing required `index.tsx`)

*To be determined after 5-point test evaluation*

---

## Implementation Checklist

### **Phase 1: Section Analysis** 🔍 **IN PROGRESS**

#### **Analytics Section** (`/analytics/*`)
- [ ] **Test 1**: Check if `/analytics` is used as top-level route in navigation
  - Navigation path: Multiple `/analytics/*` routes but no `/analytics` root
  - **Result**: ❌ No root route in navigation
- [ ] **Test 2**: Test if users land on `/analytics` as default path
  - **Action**: Test `curl -I http://localhost:3000/analytics`
  - **Expected**: 404 if no index exists
- [ ] **Test 3**: Check for existing pseudo-index files
  - **Files to check**: `analytics/dashboard.tsx`, `analytics/overview.tsx`
  - **Current**: Has `analytics/dashboard.jsx` - potential pseudo-index
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 17 analytics pages (web, mobile, advanced, revenue, etc.)
  - **Assessment**: ✅ Strong candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
  - **Action**: Test direct navigation to `/analytics`
- [ ] **Decision**: Create `analytics/index.tsx` or keep feature-specific only
- [ ] **Implementation**: If needed, create analytics landing page

#### **Digital Twin Section** (`/digital-twin/*`)
- [ ] **Test 1**: Check if `/digital-twin` is used as top-level route in navigation
  - Navigation path: Multiple `/digital-twin/*` routes but no `/digital-twin` root
  - **Result**: ❌ No root route in navigation
- [ ] **Test 2**: Test if users land on `/digital-twin` as default path
  - **Action**: Test `curl -I http://localhost:3000/digital-twin`
- [ ] **Test 3**: Check for existing pseudo-index files
  - **Files to check**: `digital-twin/dashboard.tsx`, `digital-twin/overview.tsx`
  - **Current**: Has both `dashboard.tsx` and `overview.tsx` - potential pseudo-indices
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 16 digital twin pages (dashboard, analytics, behavior, etc.)
  - **Assessment**: ✅ Strong candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
  - **Action**: Test direct navigation to `/digital-twin`
- [ ] **Decision**: Create `digital-twin/index.tsx` or rename existing dashboard
- [ ] **Implementation**: If needed, create digital twin landing page

#### **Workflow Section** (`/workflow/*`)
- [ ] **Test 1**: Check if `/workflow` is used as top-level route in navigation
  - Navigation path: `/workflow/automation` is first item, no `/workflow` root
  - **Result**: ❌ No root route in navigation
- [ ] **Test 2**: Test if users land on `/workflow` as default path
- [ ] **Test 3**: Check for existing pseudo-index files
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 8 workflow pages (automation, analytics, marketplace, etc.)
  - **Assessment**: ✅ Candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
- [ ] **Decision**: Create `workflow/index.tsx` or keep feature-specific only
- [ ] **Implementation**: If needed, create workflow landing page

#### **Tasks Section** (`/tasks/*`)
- [ ] **Test 1**: Check if `/tasks` is used as top-level route in navigation
  - Navigation path: `/tasks` is used as main route
  - **Result**: ✅ Root route in navigation
- [ ] **Test 2**: Test if users land on `/tasks` as default path
- [ ] **Test 3**: Check for existing pseudo-index files
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 4 task pages (main, ai-suggestions, analytics, projects)
  - **Assessment**: ✅ Candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
- [ ] **Decision**: ⚠️ **LIKELY NEEDS** `tasks/index.tsx`
- [ ] **Implementation**: Create tasks landing page

#### **Team Section** (`/team/*`)
- [ ] **Test 1**: Check if `/team` is used as top-level route in navigation
  - Navigation path: `/team` is used as main route
  - **Result**: ✅ Root route in navigation
- [ ] **Test 2**: Test if users land on `/team` as default path
- [ ] **Test 3**: Check for existing pseudo-index files
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 7 team pages (main, analytics, collaboration, etc.)
  - **Assessment**: ✅ Strong candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
- [ ] **Decision**: ⚠️ **LIKELY NEEDS** `team/index.tsx`
- [ ] **Implementation**: Create team landing page

#### **Admin Section** (`/admin/*`)
- [ ] **Test 1**: Check if `/admin` is used as top-level route in navigation
  - Navigation path: `/admin/dashboard` is first item, no `/admin` root
  - **Result**: ❌ No root route in navigation
- [ ] **Test 2**: Test if users land on `/admin` as default path
- [ ] **Test 3**: Check for existing pseudo-index files
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 6 admin pages (dashboard, users, analytics, etc.)
  - **Assessment**: ✅ Candidate for hub pattern
- [ ] **Test 5**: Check if absence causes 404s or broken UX
- [ ] **Decision**: Create `admin/index.tsx` or keep feature-specific only
- [ ] **Implementation**: If needed, create admin landing page

#### **Monitoring Section** (`/monitoring/*`)
- [ ] **Test 1**: Check if `/monitoring` is used as top-level route in navigation
  - Navigation path: `/admin/monitoring` and `/monitoring/advanced`
  - **Result**: ❌ No root `/monitoring` route in navigation
- [ ] **Test 2**: Test if users land on `/monitoring` as default path
- [ ] **Test 3**: Check for existing pseudo-index files
- [ ] **Test 4**: Evaluate if section represents a "hub" of subfeatures
  - **Subfeatures**: 2 monitoring pages (advanced monitoring)
  - **Assessment**: ⚠️ Limited subfeatures, may not need index
- [ ] **Test 5**: Check if absence causes 404s or broken UX
- [ ] **Decision**: Likely keep feature-specific only
- [ ] **Implementation**: No action needed unless UX issues found

### **Phase 2: Route Testing** 🧪 **PENDING**

#### **Browser Route Testing**
- [ ] **Test all potential index routes**:
  ```bash
  curl -I http://localhost:3000/analytics
  curl -I http://localhost:3000/digital-twin
  curl -I http://localhost:3000/workflow
  curl -I http://localhost:3000/tasks
  curl -I http://localhost:3000/team
  curl -I http://localhost:3000/admin
  curl -I http://localhost:3000/monitoring
  ```
- [ ] **Document 404 responses** - indicates missing index pages
- [ ] **Document successful responses** - indicates existing index pages
- [ ] **Test navigation flow** - verify user experience for each section

#### **Navigation Pattern Analysis**
- [ ] **Analyze navigation component** for section usage patterns
- [ ] **Identify sections with root routes** in navigation config
- [ ] **Map navigation expectations** to actual file structure
- [ ] **Document discrepancies** between navigation and file structure

### **Phase 3: Implementation** 🔧 **PENDING**

#### **High Priority Implementations** (Sections with navigation root routes)
- [ ] **Tasks Section**: Create `tasks/index.tsx`
  - **Reason**: `/tasks` is used in navigation as main route
  - **Content**: Task management dashboard overview
  - **Template**: Use existing task management patterns
- [ ] **Team Section**: Create `team/index.tsx`
  - **Reason**: `/team` is used in navigation as main route
  - **Content**: Team management dashboard overview
  - **Template**: Use existing team management patterns

#### **Medium Priority Implementations** (Hub sections with many subfeatures)
- [ ] **Analytics Section**: Evaluate and potentially create `analytics/index.tsx`
  - **Reason**: 17 subfeatures suggest hub pattern
  - **Alternative**: Rename `analytics/dashboard.jsx` to `index.tsx`
  - **Content**: Analytics overview dashboard
- [ ] **Digital Twin Section**: Evaluate and potentially create `digital-twin/index.tsx`
  - **Reason**: 16 subfeatures suggest hub pattern
  - **Alternative**: Rename `digital-twin/dashboard.tsx` to `index.tsx`
  - **Content**: Digital twin overview dashboard
- [ ] **Workflow Section**: Evaluate and potentially create `workflow/index.tsx`
  - **Reason**: 8 subfeatures suggest hub pattern
  - **Content**: Workflow automation overview

#### **Low Priority Implementations** (Feature-specific sections)
- [ ] **Admin Section**: Evaluate need for `admin/index.tsx`
  - **Current**: Uses `/admin/dashboard` as first navigation item
  - **Assessment**: May not need root index
- [ ] **Monitoring Section**: Likely no action needed
  - **Reason**: Limited subfeatures, specific use cases

### **Phase 4: File Extension Standardization** 📝 **PENDING**

#### **Convert Mixed Extensions to TypeScript**
- [ ] **Reports**: Convert `reports/index.jsx` → `reports/index.tsx`
- [ ] **Integrations**: Convert `integrations/index.jsx` → `integrations/index.tsx`
- [ ] **Platform Owner**: Convert `platform-owner/index.js` → `platform-owner/index.tsx`
- [ ] **Onboarding**: Convert `onboarding/index.jsx` → `onboarding/index.tsx`

#### **Standardize Component Patterns**
- [ ] **Ensure consistent imports** across all index files
- [ ] **Apply standard TypeScript interfaces** for props
- [ ] **Implement consistent error handling** patterns
- [ ] **Apply standard SEO meta tags** (Head component usage)

### **Phase 5: Documentation & Testing** 📚 **PENDING**

#### **Update Documentation**
- [ ] **Update routing guidelines** with implementation decisions
- [ ] **Document new index page purposes** and content
- [ ] **Create routing decision matrix** for future reference
- [ ] **Update navigation component documentation**

#### **Testing & Validation**
- [ ] **Test all new index routes** for functionality
- [ ] **Verify navigation flow** works correctly
- [ ] **Test responsive design** on new index pages
- [ ] **Validate SEO meta tags** and page titles
- [ ] **Run accessibility audit** on new pages

---

## Decision Matrix

### **Index Page Creation Criteria**

| Criteria | Weight | Analytics | Digital Twin | Workflow | Tasks | Team | Admin | Monitoring |
|----------|--------|-----------|--------------|----------|-------|------|-------|------------|
| **Navigation Root Route** | High | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Hub of Subfeatures** | High | ✅ (17) | ✅ (16) | ✅ (8) | ✅ (4) | ✅ (7) | ✅ (6) | ❌ (2) |
| **User Landing Expectation** | Medium | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD |
| **Existing Pseudo-Index** | Medium | ✅ dashboard | ✅ dashboard | ❌ | ❌ | ❌ | ✅ dashboard | ❌ |
| **404 Risk** | High | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD | 🔍 TBD |

### **Preliminary Recommendations**

| Section | Recommendation | Priority | Reasoning |
|---------|---------------|----------|-----------|
| **Tasks** | ✅ **CREATE** `tasks/index.tsx` | 🔴 **HIGH** | Navigation root route + hub pattern |
| **Team** | ✅ **CREATE** `team/index.tsx` | 🔴 **HIGH** | Navigation root route + hub pattern |
| **Analytics** | 🔍 **EVALUATE** then decide | 🟡 **MEDIUM** | Strong hub pattern, has pseudo-index |
| **Digital Twin** | 🔍 **EVALUATE** then decide | 🟡 **MEDIUM** | Strong hub pattern, has pseudo-index |
| **Workflow** | 🔍 **EVALUATE** then decide | 🟡 **MEDIUM** | Hub pattern, no navigation root |
| **Admin** | 🔍 **EVALUATE** then decide | 🟢 **LOW** | Hub pattern, uses dashboard route |
| **Monitoring** | ❌ **NO ACTION** | 🟢 **LOW** | Limited subfeatures, specific use |

---

## Progress Tracking

### **Completion Status**
- **Analysis Phase**: 🔍 **10% Complete** (1/8 sections analyzed)
- **Testing Phase**: ⏳ **Not Started** (0% Complete)
- **Implementation Phase**: ⏳ **Not Started** (0% Complete)
- **Documentation Phase**: ⏳ **Not Started** (0% Complete)

### **Next Actions**
1. 🔍 **Complete 5-point test analysis** for all 7 sections requiring evaluation
2. 🧪 **Run browser route testing** to identify 404s and UX issues
3. 🔧 **Implement high-priority index pages** (Tasks, Team)
4. 📝 **Standardize file extensions** across all index files
5. 📚 **Update documentation** with implementation decisions

### **Success Criteria**
- [ ] **Zero 404 errors** for expected section landing routes
- [ ] **Consistent routing patterns** across all sections
- [ ] **Clear navigation hierarchy** with proper index pages
- [ ] **Standardized file extensions** (`.tsx` preferred)
- [ ] **Complete documentation** of routing decisions

---

**Document Version**: 1.0  
**Created**: 2025-07-18  
**Last Updated**: 2025-07-18  
**Status**: 🔍 **Analysis Phase** - Section evaluation in progress  
**Next Review**: After 5-point test completion for all sections