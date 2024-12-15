import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { PropsWithChildren, useMemo } from "react";
import NavBar from "./NavBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Layout({ children }: PropsWithChildren) {
  const [darkMode, setDarkMode] = useLocalStorage("darkMode", true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#3B82F6", // Modern blue
            light: "#60A5FA",
            dark: "#2563EB",
          },
          secondary: {
            main: "#10B981", // Modern green
            light: "#34D399",
            dark: "#059669",
          },
          background: {
            default: darkMode ? "#111827" : "#F3F4F6",
            paper: darkMode ? "#1F2937" : "#FFFFFF",
          },
          text: {
            primary: darkMode ? "#F9FAFB" : "#111827",
            secondary: darkMode ? "#D1D5DB" : "#4B5563",
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          h1: {
            fontSize: "2.5rem",
            fontWeight: 700,
          },
          h2: {
            fontSize: "2rem",
            fontWeight: 600,
          },
          h3: {
            fontSize: "1.75rem",
            fontWeight: 600,
          },
          h4: {
            fontSize: "1.5rem",
            fontWeight: 500,
          },
          h5: {
            fontSize: "1.25rem",
            fontWeight: 500,
          },
          h6: {
            fontSize: "1rem",
            fontWeight: 500,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontWeight: 500,
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                backgroundImage: "none",
                boxShadow: "none",
                borderBottom: `1px solid ${darkMode ? "#374151" : "#E5E7EB"}`,
                color: darkMode ? "#F9FAFB" : "#111827",
                "& .MuiIconButton-root": {
                  color: darkMode ? "#F9FAFB" : "#111827",
                },
                "& .MuiButton-root": {
                  color: darkMode ? "#F9FAFB" : "#111827",
                },
                "& .MuiTypography-root": {
                  color: darkMode ? "#F9FAFB" : "#111827",
                }
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavBar darkMode={darkMode} switchDarkMode={() => setDarkMode(!darkMode)} />
      {children}
    </ThemeProvider>
  );
}
