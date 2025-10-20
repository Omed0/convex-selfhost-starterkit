'use client'
import { ConvexError } from "convex/values";
import { SearchIcon } from "lucide-react"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button";

// Error boundaries must be Client Components

export default function GlobalError({
    error,
    reset,
}: {
    error: ConvexError<{ title: string; body: string }>
    | (Error & { digest?: string });
    reset: () => void
}) {

    return (
        <Empty>
            <EmptyHeader>
                <EmptyTitle>Error</EmptyTitle>
                <EmptyDescription>
                    {error.message || 'Something went wrong.'}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <InputGroup className="sm:w-3/4">
                    <InputGroupInput placeholder="Try searching for pages..." />
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                        <Kbd>/</Kbd>
                    </InputGroupAddon>
                </InputGroup>
                <EmptyDescription>
                    {error instanceof ConvexError ? (
                        <p>
                            Convex Error Code: <strong>{error.data.title}</strong>
                        </p>
                    ) : <p>Please try again.</p>}
                </EmptyDescription>
                <Button variant="secondary" onClick={() => reset()}>
                    Go back home
                </Button>
            </EmptyContent>
        </Empty>
    );
}