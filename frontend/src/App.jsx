import { QueryProvider } from "./app/providers/QueryProvider";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <QueryProvider>
      <AppRoutes />
    </QueryProvider>
  );
}
