# React Frontend Dependency Conflict Resolution Plan

## Problem Analysis

The Docker build is failing due to a peer dependency conflict between:
- **Project requirement**: `@types/react@^18.3.12` (React 18 types)
- **remirror@0.13.1 requirement**: `@types/react@^16.8.0` (React 16 types)

Error: `npm error peer @types/react@"^16.8.0" from remirror@0.13.1`

## Current Dependency Structure

### Main Dependencies
- `react@^18.3.1`
- `@types/react@^18.3.12`
- `remirror@^0.13.1` (old version causing conflict)
- `@remirror/react-editors@^2.0.3` (newer version, compatible with React 18)

### The Conflict
The project is mixing old remirror v0.13.1 with newer @remirror v3.x packages. The old remirror package has strict peer dependency requirements for React 16 types.

## Proposed Solutions

### Solution 1: Remove remirror@0.13.1 (Recommended)
Since the project already has newer @remirror packages that are compatible with React 18, we can simply remove the old remirror@0.13.1 package.

**Pros**:
- Cleanest solution
- Maintains React 18 compatibility
- Uses modern remirror packages
- No version conflicts

**Cons**:
- Need to verify if any code depends on remirror@0.13.1 specifically

### Solution 2: Use npm install flags
Use `--legacy-peer-deps` or `--force` flags to bypass peer dependency checks.

**Pros**:
- Quick fix
- No code changes needed

**Cons**:
- Not a proper solution
- May cause runtime issues
- Doesn't address root cause

### Solution 3: Update Dockerfile to use different install approach
Modify the Dockerfile to handle the conflict differently.

## Recommended Approach: Solution 1

### Step-by-Step Implementation

1. **Remove remirror@0.13.1 from package.json**
   - The project already has `@remirror/react-editors@^2.0.3` which provides equivalent functionality
   - This eliminates the peer dependency conflict

2. **Update Dockerfile**
   - Change `npm ci --only=production` to `npm install --omit=dev --legacy-peer-deps` as a temporary measure
   - Later optimize to use proper dependency resolution

3. **Test the build**
   - Run `docker-compose -f docker-compose.frontend.yml up --build -d` to verify

4. **Clean up**
   - Update package-lock.json
   - Ensure all remirror functionality still works

## Implementation Details

### Files to Modify:
1. `react-frontend/package.json` - Remove remirror@0.13.1
2. `react-frontend/Dockerfile` - Update npm install command
3. `react-frontend/package-lock.json` - Will be auto-updated

### Verification:
- Check that all remirror functionality is still available through @remirror/react-editors
- Verify React 18 types are properly used throughout
- Confirm Docker build completes successfully