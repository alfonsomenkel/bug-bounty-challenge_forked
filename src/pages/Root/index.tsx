import { Box, CircularProgress, Slide } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useUserStore } from "../../api/services/User";
import AppHeader from "../../components/AppHeader";
import useMatchedRoute from "../../hooks/useMatchedRoute";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TRoute } from "../../types/global";
import AccessDenied from "../AccessDenied";
import { routes as useRoutes } from "../routes";

const hideSplashScreen = () => {
  const splashscreen = document.getElementById("app-splashscreen");

  if (splashscreen) {
    // Remove the class that makes it visible (has opacity: 1 !important).
    // This should allow the original inline style (opacity: 0 and transition) on the element to take effect.
    splashscreen.className = "";
    
    // Ensure pointer events are off during and after transition.
    splashscreen.style.pointerEvents = "none"; 

    // Remove the element after the transition completes (0.3s = 300ms from CSS transition).
    setTimeout(() => {
      if (splashscreen.parentNode) {
        splashscreen.parentNode.removeChild(splashscreen);
      }
    }, 300);
  }
};

const Root = () => {
  const { t } = useTranslation("app");
  const userStore = useUserStore();
  const { user } = userStore || {};
  const theme = useTheme();
  console.log(user);
  const routes = [...useRoutes] as readonly TRoute[];
  const [fallbackRoute] = routes;
  const Fallback = fallbackRoute.Component;
  const { route = fallbackRoute, MatchedElement } = useMatchedRoute(
    routes,
    Fallback,
    { matchOnSubPath: true }
  );

  let pageTitle = "Home"; // Default title
  if (route && route.path) {
    try {
      pageTitle = t(`routes.${route.path}`);
      
      if (route.path.indexOf("data") > -1 || route.path.indexOf("settings") > -1) {
        const [, groupName] = route.path.split("/");
        pageTitle = t(`routes./${groupName}`);
      }
    } catch (error) {
      console.warn("Error getting page title:", error);
      pageTitle = "Home";
    }
  }

  const loadingApp = false;
  const accessDenied = false;

  useEffect(() => {
    hideSplashScreen();
  }, []);

  useEffect(() => {
    if (!user && userStore) {
      userStore.getOwnUser();
    }
  }, [user, userStore]);

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div
      id="portal-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh"
      }}
    >
      {loadingApp && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
        >
          <CircularProgress color="primary" size={100} />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f5f5f5"
        }}
      >
        <Slide direction="down" in={!loadingApp} mountOnEnter>
          <AppHeader user={user ?? {}} pageTitle={pageTitle} />
        </Slide>
        <Box
          component="main"
          sx={{
            position: "relative",
            height: `calc(100% - ${theme.tokens.header.height})`,
            width: "100%",
            marginTop:
              theme.tokens.header.height /* Necessary because of AppBar */
          }}
        >
          {MatchedElement}
        </Box>
      </Box>
    </div>
  );
};

export default observer(Root);
