// src/pages/Auth.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  useColorMode,
  useMediaQuery,
} from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { createCustomToast } from "../components/CustomToast";
import { createStandaloneToast } from "@chakra-ui/react";

const MotionBox = motion(Box);

const Auth = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, apiUrl, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = createStandaloneToast();
  const customToast = createCustomToast(toast);
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      let redirect = sessionStorage.getItem("auth_redirect") || "/";
      sessionStorage.removeItem("auth_redirect");

      if (
        redirect === "/auth" ||
        redirect === `${window.location.origin}/auth`
      ) {
        redirect = "/";
      }

      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const errorMessage = params.get("message");
    const token = params.get("token");

    if (error) {
      customToast({
        title: "Authentication Error",
        description:
          errorMessage || "There was a problem signing in. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [customToast]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    try {
      const returnPath = location.state?.from?.pathname || "/";
      if (returnPath !== "/auth") {
        sessionStorage.setItem("auth_redirect", returnPath);
      }

      const authUrl = `${apiUrl}/api/auth/github`;
      console.log("Redirecting to:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Auth error:", error);
      customToast({
        title: "Error",
        description: "Failed to initiate authentication. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const returnPath = location.state?.from?.pathname || "/";
      if (returnPath !== "/auth") {
        sessionStorage.setItem("auth_redirect", returnPath);
      }
  
      const authUrl = `${apiUrl}/api/auth/google`;
      console.log("Redirecting to Google auth:", authUrl);
      window.location.href = authUrl;
    } catch (error) {
      console.error("Google auth error:", error);
      customToast({
        title: "Error",
        description: "Failed to initiate Google authentication. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && !loading) {
    return null;
  }

  return (
    <Flex
      minHeight="100vh"
      width="100%"
      alignItems="center"
      justifyContent="center"
      bg={
        colorMode === "light"
          ? "brand.background.light"
          : "brand.background.dark"
      }
      px={4}
      position="relative"
      overflow="hidden"
    >
      {!isMobile && (
        <>
          <MotionBox
            position="absolute"
            width="600px"
            height="600px"
            borderRadius="full"
            bgGradient={
              colorMode === "light"
                ? "linear(to-r, #FF0080, #7928CA)"
                : "linear(to-r, #742dd3, #3b1c66)"
            }
            filter="blur(80px)"
            opacity="0.15"
            animate={{
              scale: [1, 1.05, 1],
              transition: {
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              },
            }}
            top="-100px"
            right="-100px"
            zIndex={0}
          />
          <MotionBox
            position="absolute"
            width="600px"
            height="600px"
            borderRadius="full"
            bgGradient={
              colorMode === "light"
                ? "linear(to-l, #7928CA, #00B4D8)"
                : "linear(to-l, #3b1c66, #006680)"
            }
            filter="blur(80px)"
            opacity="0.15"
            animate={{
              scale: [1, 1.05, 1],
              transition: {
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              },
            }}
            bottom="-100px"
            left="-100px"
            zIndex={0}
          />
        </>
      )}

      {isMobile && (
        <Box
          position="absolute"
          inset={0}
          bgGradient={
            colorMode === "light"
              ? "linear(to-br, rgba(255,0,128,0.1), rgba(121,40,202,0.1))"
              : "linear(to-br, rgba(0,180,216,0.1), rgba(59,28,102,0.1))"
          }
          zIndex={0}
        />
      )}

      <Box
        width="100%"
        maxW="md"
        bgGradient={
          colorMode === "light"
            ? "linear(to-br, rgba(255,255,255,0.9), rgba(255,255,255,0.7))"
            : "linear(to-br, rgba(45,45,45,0.9), rgba(45,45,45,0.7))"
        }
        backdropFilter="blur(10px)"
        borderRadius="20px"
        border="1px solid"
        borderColor={
          colorMode === "light"
            ? "rgba(255,255,255,0.3)"
            : "rgba(255,255,255,0.1)"
        }
        boxShadow={
          colorMode === "light"
            ? "0 8px 0 0 black, 0 0 20px rgba(0,0,0,0.1)"
            : "0 8px 0 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(0,0,0,0.3)"
        }
        p={8}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        <VStack spacing={8} align="stretch">
          <VStack spacing={3}>
            <Text
              fontSize={{ base: "32px", md: "40px" }}
              fontWeight="800"
              textAlign="center"
              fontFamily="heading"
              bgGradient={
                colorMode === "light"
                  ? "linear(to-r, #FF0080, #7928CA)"
                  : "linear(to-r, #00B4D8, #7928CA)"
              }
              bgClip="text"
              textShadow={
                colorMode === "light"
                  ? "0px 0px 40px rgba(255,0,128,0.3)"
                  : "0px 0px 40px rgba(0,180,216,0.3)"
              }
            >
              Welcome to Hiraya
            </Text>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              textAlign="center"
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              opacity={0.8}
            >
              Choose your preferred way to continue
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Button
              onClick={handleGitHubAuth}
              height="56px"
              fontSize="16px"
              width="100%"
              bg={colorMode === "light" ? "white" : "transparent"}
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              borderRadius="full"
              border="1px solid"
              borderColor={
                colorMode === "light"
                  ? "brand.border.light"
                  : "brand.border.dark"
              }
              fontWeight={700}
              leftIcon={<FaGithub size={20} />}
              boxShadow={
                colorMode === "light"
                  ? "0 4px 0 0 black"
                  : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
              }
              _hover={{
                transform: "translateY(2px)",
                bg:
                  colorMode === "light"
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.05)",
                boxShadow:
                  colorMode === "light"
                    ? "0 2px 0 0 black"
                    : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
              }}
              _active={{
                transform: "translateY(4px)",
                boxShadow: "none",
              }}
              transition="all 0.2s"
              isLoading={isLoading}
            >
              Continue with GitHub
            </Button>

            <Button
              onClick={handleGoogleAuth}
              height="56px"
              fontSize="16px"
              width="100%"
              bg={colorMode === "light" ? "white" : "transparent"}
              color={
                colorMode === "light" ? "brand.text.light" : "brand.text.dark"
              }
              borderRadius="full"
              border="1px solid"
              borderColor={
                colorMode === "light"
                  ? "brand.border.light"
                  : "brand.border.dark"
              }
              fontWeight={700}
              leftIcon={<FcGoogle size={20} />}
              boxShadow={
                colorMode === "light"
                  ? "0 4px 0 0 black"
                  : "0 4px 0 0 rgba(255, 255, 255, 0.2)"
              }
              _hover={{
                transform: "translateY(2px)",
                bg:
                  colorMode === "light"
                    ? "rgba(255,255,255,0.8)"
                    : "rgba(255,255,255,0.05)",
                boxShadow:
                  colorMode === "light"
                    ? "0 2px 0 0 black"
                    : "0 2px 0 0 rgba(255, 255, 255, 0.2)",
              }}
              _active={{
                transform: "translateY(4px)",
                boxShadow: "none",
              }}
              transition="all 0.2s"
              isLoading={isLoading && location.state?.provider === "google"}
            >
              Continue with Google
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Auth;