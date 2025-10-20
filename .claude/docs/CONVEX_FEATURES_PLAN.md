# Convex Features Demo Plan

## Overview

This plan outlines the implementation of a minimal todo application that demonstrates ALL Convex features defined in the schema. The app will showcase queries, mutations, actions, relationships, search, aggregates, triggers, and more.

## Schema Features to Demonstrate

### 1. **Core Models**

- **Users**: Profile management, role-based access, soft deletion
- **Todos**: CRUD operations, priorities, due dates, soft deletion
- **Projects**: Project management, public/private visibility, archiving
- **Tags**: Tag management with color coding
- **Comments**: Nested comments with replies

### 2. **Relationships**

- 1:1 - User profile edges
- 1:many - User→Todos, Project→Todos, Todo→Comments
- Many:many - Todos↔Tags, Projects↔Members, Comments↔Replies

### 3. **Advanced Features**

- **Search**: Full-text search on todos (title/description)
- **Aggregates**: Todo counts by user, project, status
- **Triggers**: Auto-update aggregates, validation
- **Soft Deletion**: Todos with deletionTime
- **Indexes**: Optimized queries for filtering
- **Pagination**: Todo lists with cursor-based pagination

## Implementation Structure

### Backend Files (`convex/`)

#### 1. **todos.ts** - Todo CRUD

- `list` - Paginated query with filters (status, project, tags)
- `search` - Full-text search with filters
- `get` - Single todo with relations
- `create` - With validation, rate limiting
- `update` - Patch updates with optimistic UI
- `toggleComplete` - Quick status toggle
- `delete` - Soft delete
- `restore` - Undelete soft-deleted todos
- `bulkDelete` - Batch operations
- `reorder` - Drag-and-drop support

#### 2. **projects.ts** - Project Management

- `list` - User's projects (owned + member)
- `get` - Project with members and todo count
- `create` - With owner assignment
- `update` - Name, description, visibility
- `archive` - Soft archive
- `addMember` - Add project member
- `removeMember` - Remove project member
- `leave` - Leave project as member
- `transfer` - Transfer ownership

#### 3. **tags.ts** - Tag System

- `list` - User's tags with usage count
- `create` - New tag with color
- `update` - Rename/recolor
- `delete` - Remove tag (cascade from todos)
- `merge` - Merge two tags
- `popular` - Most used tags

#### 4. **todoComments.ts** - Comment System

- `list` - Comments for a todo (nested)
- `create` - Add comment
- `reply` - Reply to comment
- `update` - Edit comment
- `delete` - Remove comment
- `react` - Add reaction/emoji

#### 5. **todoInternal.ts** - Internal Functions

- `processOverdueTodos` - Mark overdue todos
- `cleanupDeletedTodos` - Hard delete old soft-deleted
- `calculateStats` - User/project statistics

#### 6. **aggregates.ts** - Count Operations

- Todo count by user
- Todo count by project
- Todo count by status
- Tag usage count
- Comment count per todo

#### 7. **triggers.ts** - Database Triggers

- Update aggregates on todo changes
- Validate todo title length
- Auto-assign creation timestamps
- Cascade soft deletes

### Frontend Structure (`src/`)

#### 1. **Pages**

- `/` - Dashboard with todo lists
- `/projects` - Project management
- `/projects/[id]` - Project detail with todos
- `/tags` - Tag management
- `/search` - Global search
- `/settings` - User settings

#### 2. **Components**

- `TodoList` - Paginated list with filters
- `TodoItem` - Single todo with actions
- `TodoForm` - Create/edit todo
- `TodoFilters` - Status, project, tag filters
- `TodoSearch` - Search bar with results
- `ProjectCard` - Project preview
- `ProjectMembers` - Member management
- `TagPicker` - Multi-select tags
- `CommentThread` - Nested comments
- `StatsWidget` - Aggregate displays

#### 3. **Features to Showcase**

- **Real-time Updates**: Live todo changes
- **Optimistic UI**: Instant feedback
- **Pagination**: Load more pattern
- **Search**: Debounced full-text search
- **Filters**: Combined filtering
- **Drag & Drop**: Reorder todos
- **Keyboard Shortcuts**: Quick actions
- **Skeleton Loading**: Smooth loading states
- **Error Handling**: User-friendly errors
- **Rate Limiting**: Prevent spam

## Key Patterns to Demonstrate

### 1. **Authentication Context**

```typescript
// Use pre-loaded ctx.user
handler: async (ctx, args) => {
  await ctx.user.patch({ lastActive: Date.now() });
};
```

### 2. **Edge Traversal**

```typescript
// Efficient relationship queries
const todos = await user
  .edge('todos')
  .filter((q) => q.eq(q.field('completed'), false))
  .order('desc')
  .take(10);
```

### 3. **Aggregates with Triggers**

```typescript
// O(log n) counts
const todoCount = await aggregateTodosByUser.count(ctx, {
  namespace: userId,
});
```

### 4. **Search with Filters**

```typescript
// Full-text + field filters
const results = await ctx
  .table('todos')
  .search('search_title_description', (q) =>
    q.search('title', query).eq('userId', userId).eq('completed', false)
  )
  .take(20);
```

### 5. **Pagination with Streams**

```typescript
// Complex filters with consistent pages
const stream = await stream(ctx.db, schema)
  .query('todos')
  .filterWith(async (todo) => {
    const tags = await todo.edge('tags');
    return tags.some((t) => selectedTags.includes(t._id));
  })
  .paginate(args.paginationOpts);
```

## UI/UX Approach

### Design Principles

- **Minimal & Clean**: Focus on functionality over aesthetics
- **Compact Layout**: Dense information display
- **Instant Feedback**: Optimistic updates everywhere
- **Keyboard First**: Shortcuts for power users
- **Mobile Friendly**: Responsive design

### Component Structure

- Use shadcn/ui components exclusively
- Minimal custom styling
- Focus on demonstrating Convex features
- Clear labeling of feature demos

## Testing Checklist

- [ ] All CRUD operations work
- [ ] Real-time updates across sessions
- [ ] Search returns relevant results
- [ ] Filters combine correctly
- [ ] Pagination loads smoothly
- [ ] Aggregates update instantly
- [ ] Soft delete/restore works
- [ ] Rate limiting prevents spam
- [ ] Error messages are helpful
- [ ] Loading states are smooth
- [ ] Mobile layout is usable
- [ ] Keyboard shortcuts work

## Development Order

1. **Phase 1**: Core Todo CRUD
   - Basic todo operations
   - Real-time updates
   - Soft deletion

2. **Phase 2**: Projects & Relationships
   - Project CRUD
   - Todo-project association
   - Member management

3. **Phase 3**: Tags & Search
   - Tag system
   - Full-text search
   - Combined filters

4. **Phase 4**: Comments & Aggregates
   - Comment threads
   - Count displays
   - Trigger setup

5. **Phase 5**: Polish
   - Loading states
   - Error handling (toast)
