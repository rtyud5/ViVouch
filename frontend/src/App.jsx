import { QueryProvider } from "./app/providers/QueryProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { GlobalErrorBoundary } from "./components/common/GlobalErrorBoundary";

export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryProvider>
        <AppRoutes />
      </QueryProvider>
    </GlobalErrorBoundary>
  );
}
