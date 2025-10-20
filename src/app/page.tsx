import { TodoList } from '@/components/todos';

export default async function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <TodoList />
    </div>
  );
}
