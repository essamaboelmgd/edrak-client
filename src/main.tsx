import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { RtlProvider } from './providers/RtlProvider'
import theme from './theme'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RtlProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </RtlProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
