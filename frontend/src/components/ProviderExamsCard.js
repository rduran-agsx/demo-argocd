import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  VStack,
  Flex,
  Input,
  Box,
  Container,
  Text,
  Center,
  Spinner,
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
} from "@chakra-ui/react";
import { LuGrid, LuList, LuSearch } from "react-icons/lu";
import { IconBox } from "./IconBox";
import ProviderDropdown from "./ProviderDropdown";
import Pagination from "./Pagination";
import { debounce } from "lodash";
import ProviderCard from "./ProviderCard";

const LoadingSpinner = () => {
  const { colorMode } = useColorMode();
  
  return (
    <Center height="200px">
      <Spinner 
        size="xl" 
        color={colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"} 
        thickness="4px" 
      />
    </Center>
  );
};

const ProviderExamsCard = ({ onExamSelect, view, onViewChange }) => {
  const location = useLocation();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 3;

  useEffect(() => {
    if (location.state?.selectedProvider && location.state?.fromProviders) {
      setSelectedProvider(location.state.selectedProvider);
    }
  }, [location]);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/providers`);
      const data = await response.json();
      setProviders(data.providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const allProviders = React.useMemo(() => {
    return ["All Providers", ...providers.map(provider => provider.name)];
  }, [providers]);

  const filteredProviders = React.useMemo(() => {
    let filtered = providers;
    if (selectedProvider !== "All Providers") {
      filtered = filtered.filter(
        (provider) => provider.name === selectedProvider
      );
    }
    if (searchTerm) {
      filtered = filtered
        .map((provider) => ({
          ...provider,
          exams: provider.exams.filter((exam) =>
            exam.title.toLowerCase().includes(searchTerm.toLowerCase())
          ),
        }))
        .filter((provider) => provider.exams.length > 0);
    }
    return filtered.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [providers, selectedProvider, searchTerm]);

  const paginatedProviders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * providersPerPage;
    const endIndex = startIndex + providersPerPage;
    return filteredProviders.slice(startIndex, endIndex);
  }, [filteredProviders, currentPage]);

  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const debouncedSearch = React.useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearch = (event) => {
    debouncedSearch(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setCurrentPage(1);
  };

  const SearchDrawer = () => (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius="20px"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor={colorMode === "light" ? "brand.border.light" : "brand.border.dark"}
        boxShadow="none"
        overflow="hidden"
        bg="transparent"
      >
        <Box
          bg={colorMode === "light" ? "brand.surface.light" : "brand.surface.dark"}
          boxShadow={colorMode === "light" 
            ? "0 -4px 0 0 black" 
            : "0 -4px 0 0 rgba(255, 255, 255, 0.2)"}
          height="100%"
        >
          <DrawerCloseButton />
          <DrawerHeader>Search Exams</DrawerHeader>
          <DrawerBody paddingBottom={8}>
            <VStack spacing={4}>
              <Input
                placeholder="Search exams..."
                size="lg"
                value={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                backgroundColor={colorMode === "light" ? "brand.background.light" : "brand.surface.dark"}
                color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
                borderColor={colorMode === "light" ? "brand.border.light" : "brand.border.dark"}
                _placeholder={{
                  color: colorMode === "light" ? "gray.500" : "gray.400"
                }}
              />
              <Box width="100%">
                <ProviderDropdown
                  providers={allProviders}
                  selectedProvider={selectedProvider}
                  onSelect={handleProviderSelect}
                />
              </Box>
              <Button
                width="100%"
                onClick={onClose}
                backgroundColor={colorMode === "light" ? "brand.primary.light" : "brand.primary.dark"}
                color={colorMode === "light" ? "brand.text.light" : "brand.text.dark"}
                borderRadius="full"
              >
                Apply Filters
              </Button>
            </VStack>
          </DrawerBody>
        </Box>
      </DrawerContent>
    </Drawer>
  );

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (paginatedProviders.length === 0) {
      return (
        <Text 
          fontSize="xl" 
          textAlign="center" 
          marginY={8}
          color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
        >
          No exams found. Try adjusting your search or selected provider.
        </Text>
      );
    } else {
      return (
        <VStack spacing={6} width="100%">
          {paginatedProviders.map((provider, index) => (
            <ProviderCard
              key={index}
              providerName={provider.name}
              exams={provider.exams}
              view={view}
              isPopular={provider.isPopular}
              onExamSelect={onExamSelect}
            />
          ))}
        </VStack>
      );
    }
  };

  return (
    <Container 
      maxWidth="100%" 
      paddingX={{ base: 2, md: 4 }}
      marginBottom={{ base: "100px", md: 0 }}
    >
      <VStack 
        spacing={{ base: 4, md: 8 }} 
        align="stretch" 
        width="100%"
      >
        {/* Desktop Controls */}
        <Flex 
          display={{ base: "none", md: "flex" }}
          direction={{ base: "column", md: "row" }}
          alignItems={{ base: "stretch", md: "center" }} 
          justifyContent="space-between" 
          gap={{ base: 2, md: 4 }}
          flexWrap="wrap"
        >
          <Input
            placeholder="Search exams..."
            size="lg"
            width={{ base: "100%", md: "400px" }}
            onChange={handleSearch}
            bg={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
            borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
            _placeholder={{
              color: colorMode === 'light' ? "gray.500" : "gray.400"
            }}
          />
          <Flex 
            alignItems="center"
            gap={4}
          >
            <Box width="250px">
              <ProviderDropdown
                providers={allProviders}
                selectedProvider={selectedProvider}
                onSelect={handleProviderSelect}
              />
            </Box>
            <Flex gap={2}>
              <IconBox
                icon={LuGrid}
                size="48px"
                iconScale={0.4}
                borderThickness={3}
                backgroundColor={view === "grid" 
                  ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
                  : colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"
                }
                onClick={() => onViewChange("grid")}
                isActive={view === "grid"}
              />
              <IconBox
                icon={LuList}
                size="48px"
                iconScale={0.4}
                borderThickness={3}
                backgroundColor={view === "list" 
                  ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
                  : colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"
                }
                onClick={() => onViewChange("list")}
                isActive={view === "list"}
              />
            </Flex>
          </Flex>
        </Flex>

        {/* Mobile Controls */}
        <Flex
          display={{ base: "flex", md: "none" }}
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          marginBottom={4}
        >
          <IconBox
            icon={LuSearch}
            size="48px"
            iconScale={0.4}
            borderThickness={3}
            backgroundColor={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
            onClick={onOpen}
            aria-label="Search and filter"
          />
          <Flex gap={2}>
            <IconBox
              icon={LuGrid}
              size="48px"
              iconScale={0.4}
              borderThickness={3}
              backgroundColor={view === "grid" 
                ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
                : colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"
              }
              onClick={() => onViewChange("grid")}
              isActive={view === "grid"}
            />
            <IconBox
              icon={LuList}
              size="48px"
              iconScale={0.4}
              borderThickness={3}
              backgroundColor={view === "list" 
                ? colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"
                : colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"
              }
              onClick={() => onViewChange("list")}
              isActive={view === "list"}
            />
          </Flex>
        </Flex>

        <Box width="100%">
          {renderContent()}
        </Box>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </VStack>

      <SearchDrawer />
    </Container>
  );
};

export default ProviderExamsCard;