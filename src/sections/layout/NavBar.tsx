import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import NavMenu from "./NavMenu";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import NavLink from "@/components/NavLink";
import Image from "next/image";
import { Button, useTheme } from "@mui/material";

interface Props {
  darkMode: boolean;
  switchDarkMode: () => void;
}

export default function NavBar({ darkMode, switchDarkMode }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    setDrawerOpen(false);
  }, [router.pathname]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
            }}
          >
            <Icon icon="mdi:menu" />
          </IconButton>

          <NavLink href="/">
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Image
                src="/favicon-32x32.png"
                alt="ChessCoach logo"
                width={32}
                height={32}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ChessCoach
              </Typography>
            </Box>
          </NavLink>

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 4 }}>
            <Button
              color="inherit"
              component={NavLink}
              href="/play"
              startIcon={<Icon icon="streamline:chess-pawn" />}
            >
              Play
            </Button>
            <Button
              color="inherit"
              component={NavLink}
              href="/"
              startIcon={<Icon icon="streamline:magnifying-glass-solid" />}
            >
              Analysis
            </Button>
            <Button
              color="inherit"
              component={NavLink}
              href="/database"
              startIcon={<Icon icon="streamline:database" />}
            >
              History
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={() => window.open("https://discord.gg/Yr99abAcUr")}
            sx={{ 
              '&:hover': { 
                color: theme.palette.primary.main 
              }
            }}
          >
            <Icon icon="ri:discord-fill" />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() =>
              window.open("https://github.com/GuillaumeSD/freechess")
            }
            sx={{ 
              '&:hover': { 
                color: theme.palette.primary.main 
              }
            }}
          >
            <Icon icon="mdi:github" />
          </IconButton>

          <IconButton
            onClick={switchDarkMode}
            color="inherit"
            sx={{ 
              '&:hover': { 
                color: theme.palette.primary.main 
              }
            }}
          >
            {darkMode ? (
              <Icon icon="mdi:brightness-7" />
            ) : (
              <Icon icon="mdi:brightness-4" />
            )}
          </IconButton>
        </Toolbar>
      </AppBar>
      <NavMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Box>
  );
}
