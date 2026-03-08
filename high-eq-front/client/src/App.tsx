import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { QuotaProvider } from "./contexts/QuotaContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReplyApp from "./pages/ReplyApp";
import History from "./pages/History";
import Favorites from "./pages/Favorites";
import PersonProfiles from "./pages/PersonProfiles";
import PersonProfileForm from "./pages/PersonProfileForm";
import PersonProfileChat from "./pages/PersonProfileChat";
import PersonProfileDetail from "./pages/PersonProfileDetail";
import ProtectedRoute from "./components/ProtectedRoute";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/app"}>
        {() => (
          <ProtectedRoute>
            <ReplyApp />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/history"}>
        {() => (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/favorites"}>
        {() => (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profiles"}>
        {() => (
          <ProtectedRoute>
            <PersonProfiles />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profiles/new"}>
        {() => (
          <ProtectedRoute>
            <PersonProfileForm />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profiles/:profileId/edit"}>
        {({ profileId }: { profileId: string }) => (
          <ProtectedRoute>
            <PersonProfileForm profileId={profileId} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profiles/:profileId/chat"}>
        {({ profileId }: { profileId: string }) => (
          <ProtectedRoute>
            <PersonProfileChat profileId={profileId} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profiles/:profileId"}>
        {({ profileId }: { profileId: string }) => (
          <ProtectedRoute>
            <PersonProfileDetail profileId={profileId} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QuotaProvider>
          <ThemeProvider
            defaultTheme="light"
            // switchable
          >
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </QuotaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
