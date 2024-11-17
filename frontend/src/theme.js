import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  
  colors: {
    brand: {
      primary: {
        light: "#00bfff",
        dark: "#00a6e6"
      },
      secondary: {
        light: "#b3ebf2",
        dark: "#265e6d"
      },
      background: {
        light: "#ffffff",
        dark: "#1a1a1a"
      },
      surface: {
        light: "#f2f2f3",
        dark: "#2d2d2d"
      },
      hover: {
        light: "rgba(255, 255, 255, 0.3)",
        dark: "rgba(255, 255, 255, 0.01)"
      },
      text: {
        light: "#000000",
        dark: "#ffffff"
      },
      border: {
        light: "#000000",
        dark: "#404040"
      }
    },
    gradient: {
      primary: {
        light: "linear(to-br, #4158D0, #C850C0, #FFCC70)",
        dark: "linear(to-br, #2A3B97, #8C2F89, #B38537)"
      },
      secondary: {
        light: "linear(to-r, #00bfff, #0080ff)",
        dark: "linear(to-r, #006080, #004080)"
      },
      success: {
        light: "linear(to-r, #4CAF50, #8BC34A)",
        dark: "linear(to-r, #2E673F, #4A6F2E)"
      },
      warning: {
        light: "linear(to-r, #FFD54F, #FFF176)",
        dark: "linear(to-r, #997F30, #998E47)"
      },
      error: {
        light: "linear(to-r, #FF5252, #FF8A80)",
        dark: "linear(to-r, #992F2F, #994D4D)"
      }
    }
  },

  components: {
    Button: {
      baseStyle: props => ({
        fontWeight: "bold",
        borderRadius: "full",
        border: "1px solid",
        borderColor: props.colorMode === 'light' ? "brand.border.light" : "brand.border.dark",
        boxShadow: props.colorMode === 'light' 
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)",
        transition: "0.3s",
        color: props.colorMode === 'light' ? "brand.text.light" : "brand.text.dark",
        _hover: {
          transform: "translateY(2px)",
          boxShadow: props.colorMode === 'light' 
            ? "0 2px 0 0 black"
            : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
        },
        _active: {
          transform: "translateY(4px)",
          boxShadow: "none",
        },
      }),
      variants: {
        solid: props => ({
          bg: props.colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark",
          _hover: {
            bg: props.colorMode === 'light' ? "brand.primary.dark" : "brand.primary.light",
          },
        }),
        outline: props => ({
          bg: "transparent",
          borderWidth: "2px",
          borderColor: props.colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark",
          color: props.colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark",
        }),
      },
    },
    
    Card: {
      baseStyle: props => ({
        bg: props.colorMode === 'light' ? "brand.background.light" : "brand.surface.dark",
        borderRadius: "20px",
        border: "1px solid",
        borderColor: props.colorMode === 'light' ? "brand.border.light" : "brand.border.dark",
        boxShadow: props.colorMode === 'light' 
          ? "0 4px 0 0 black"
          : "0 4px 0 0 rgba(255, 255, 255, 0.2)",
      }),
    },

    Text: {
      baseStyle: props => ({
        color: props.colorMode === 'light' ? "brand.text.light" : "brand.text.dark",
      }),
    },

    Box: {
      baseStyle: props => ({
        bg: props.colorMode === 'light' ? "brand.background.light" : "brand.surface.dark",
      }),
    },
  },

  styles: {
    global: props => ({
      body: {
        bg: props.colorMode === 'light' ? "white" : "brand.background.dark",
        color: props.colorMode === 'light' ? "brand.text.light" : "brand.text.dark",
      },
    }),
  },

  fonts: {
    body: '"Karla Variable", sans-serif',
    heading: "'Space Grotesk', sans-serif",
  },
});

export default theme;