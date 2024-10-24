import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient= new QueryClient();

export const QueryProvider = ({children}: {children: React.ReactNode}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* the above line is what loads our page as it is used directly in our main.tsx file */}
    </QueryClientProvider>
  )
}

