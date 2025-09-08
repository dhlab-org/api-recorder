# Convention Guide

## 📦 Component Rules

```tsx
const MainComponent = ({}: TProps) => {
  // ...
}

export { MainComponent }

const SubComponent = ({}: TSubComponentProps) => {
  // ...
}

type TProps = {}
type TSubComponentProps = {}

```

Guidelines
- MainComponent → top-level component
- SubComponent → used only inside the same file
- Props types must have a T prefix (TProps, TSubComponentProps)
- Place type declarations at the bottom of the file


## 🪝 Hook Rules


```ts
const useChat = ({ userId }: TParams) => {
  // ...
  return { chatList } // always return an object
}

export { useChat }

type TParams = {
  userId: string
}

```

Guidelines
- Hook names must start with `use-` followed by a meaningful name
- Always return an object for consistency and scalability
- Define parameter types explicitly with the TParams convention

## 📂 File Naming
- Use kebab-case for file names
  - Example: `use-debounce.ts`, `main-component.tsx`


## 📝 Variable Naming

- Use proper grammar and meaningful words
- Avoid abbreviations; prefer longer, descriptive names
  - Example: messageList ✅, msgList ❌

## 📘 TypeScript Rules

- Use type instead of interface
- Always add a `T` prefix for types (TProps, TParams, TUser)
- Allow basic types (string, number, boolean) to be inferred instead of explicitly declared