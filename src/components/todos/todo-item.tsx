'use client';

import { useState } from 'react';
import { useAuthMutation } from '@/lib/convex/hooks';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Edit, MoreHorizontal, Trash, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TodoItemProps {
  todo: {
    _id: Id<'todos'>;
    _creationTime: number;
    title: string;
    description?: string;
    completed: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: number;
    deletionTime?: number;
    tags?: Array<{
      _id: Id<'tags'>;
      name: string;
      color: string;
    }>;
    project?: {
      _id: Id<'projects'>;
      name: string;
    } | null;
  };
  onEdit?: () => void;
}

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleComplete = useAuthMutation(api.todos.toggleComplete);
  const deleteTodo = useAuthMutation(api.todos.deleteTodo);
  const restoreTodo = useAuthMutation(api.todos.restore);

  const handleToggleComplete = async () => {
    setIsUpdating(true);
    try {
      await toggleComplete.mutateAsync({ id: todo._id });
    } catch (error) {
      toast.error('Failed to update todo');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    toast.promise(deleteTodo.mutateAsync({ id: todo._id }), {
      loading: 'Deleting todo...',
      success: 'Todo deleted',
      error: (e) => e.data?.message ?? 'Failed to delete todo',
    });
  };

  const handleRestore = async () => {
    toast.promise(restoreTodo.mutateAsync({ id: todo._id }), {
      loading: 'Restoring todo...',
      success: 'Todo restored',
      error: (e) => e.data?.message ?? 'Failed to restore todo',
    });
  };

  const isOverdue =
    todo.dueDate && todo.dueDate < Date.now() && !todo.completed;
  const isDeleted = !!todo.deletionTime;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-colors',
        todo.completed && 'bg-muted/50',
        isDeleted && 'border-destructive/20 bg-destructive/5',
        isOverdue && !isDeleted && 'border-red-500/50'
      )}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggleComplete}
        disabled={isUpdating || isDeleted}
        className="mt-0.5"
      />

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'font-medium',
              todo.completed && 'text-muted-foreground line-through',
              isDeleted && 'text-muted-foreground'
            )}
          >
            {todo.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isDeleted ? (
                <DropdownMenuItem onClick={handleRestore}>
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {todo.description && (
          <p className="text-sm text-muted-foreground">{todo.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {todo.priority && (
            <Badge
              variant="secondary"
              className={cn('text-xs', priorityColors[todo.priority])}
            >
              {todo.priority}
            </Badge>
          )}

          {todo.dueDate && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isOverdue && 'border-red-500 text-red-600'
              )}
            >
              <Calendar className="mr-1 h-3 w-3" />
              {format(todo.dueDate, 'MMM d, yyyy')}
            </Badge>
          )}

          {todo.project && (
            <Badge variant="outline" className="text-xs">
              {todo.project.name}
            </Badge>
          )}

          {todo.tags?.map((tag) => (
            <Badge
              key={tag._id}
              variant="outline"
              className="text-xs"
              style={{
                backgroundColor: `${tag.color}20`,
                borderColor: tag.color,
                color: tag.color,
              }}
            >
              {tag.name}
            </Badge>
          ))}

          {isDeleted && (
            <Badge variant="destructive" className="text-xs">
              Deleted
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
