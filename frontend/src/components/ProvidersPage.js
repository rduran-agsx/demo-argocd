import React, { useState, useEffect, useMemo } from 'react';
import {
  VStack, 
  Flex,
  Input,
  Box,
  Container,
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
import CategoriesDropdown from "./CategoriesDropdown";
import Pagination from "./Pagination";
import CategoryCard from "./CategoryCard";
import { debounce } from "lodash";

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

const ProvidersPage = () => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const categoriesPerPage = 2;

  const categoryNames = useMemo(() => 
    ["All Categories", ...categories.map(category => category.name)],
    [categories]
  );

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/provider-statistics');
        if (!response.ok) {
          throw new Error('Failed to fetch provider statistics');
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const filteredCategories = useMemo(() => {
    let filtered = categories;
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(category => category.name === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.map(category => ({
        ...category,
        providers: category.providers.filter(provider =>
          provider.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.providers.length > 0);
    }
    return filtered;
  }, [categories, selectedCategory, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  const SearchDrawer = () => (
    <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent
        borderTopRadius="20px"
        borderTop="1px solid"
        borderLeft="1px solid"
        borderRight="1px solid"
        borderColor={colorMode === "light" ? "black" : "white"}
        boxShadow="none"
        overflow="hidden"
        bg="transparent"
      >
        <Box
          bg={colorMode === 'light' ? "brand.surface.light" : "brand.surface.dark"}
          boxShadow={colorMode === "light" 
            ? "0 -4px 0 0 black" 
            : "0 -4px 0 0 rgba(255, 255, 255, 0.2)"}
          height="100%"
        >
          <DrawerCloseButton />
          <DrawerHeader>Search Providers</DrawerHeader>
          <DrawerBody paddingBottom={8}>
            <VStack spacing={4}>
              <Input
                placeholder="Search providers..."
                size="lg"
                value={searchTerm}
                onChange={(e) => debouncedSearch(e.target.value)}
                backgroundColor={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
                color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
                borderColor={colorMode === 'light' ? "brand.border.light" : "brand.border.dark"}
                _placeholder={{
                  color: colorMode === 'light' ? "gray.500" : "gray.400"
                }}
              />
              <Box width="100%">
                <CategoriesDropdown
                  categories={categoryNames}
                  selectedCategory={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </Box>
              <Button
                width="100%"
                onClick={onClose}
                backgroundColor={colorMode === 'light' ? "brand.primary.light" : "brand.primary.dark"}
                color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
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

    if (error) {
      return (
        <Center>
          <Box 
            fontSize="xl" 
            color={colorMode === 'light' ? "red.500" : "red.300"}
          >
            Error: {error}
          </Box>
        </Center>
      );
    }

    if (paginatedCategories.length === 0) {
      return (
        <Center>
          <Box 
            fontSize="xl" 
            textAlign="center" 
            marginY={8}
            color={colorMode === 'light' ? "brand.text.light" : "brand.text.dark"}
          >
            No providers found. Try adjusting your search or selected category.
          </Box>
        </Center>
      );
    }

    return (
      <VStack spacing={6} width="100%">
        {paginatedCategories.map((category, index) => (
          <CategoryCard
            key={index}
            categoryName={category.name}
            providers={category.providers}
            view={view}
          />
        ))}
      </VStack>
    );
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
            placeholder="Search providers..."
            size="lg"
            width={{ md: "400px" }}
            onChange={(e) => debouncedSearch(e.target.value)}
            backgroundColor={colorMode === 'light' ? "brand.background.light" : "brand.surface.dark"}
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
              <CategoriesDropdown
                categories={categoryNames}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
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
                onClick={() => setView("grid")}
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
                onClick={() => setView("list")}
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
              onClick={() => setView("grid")}
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
              onClick={() => setView("list")}
              isActive={view === "list"}
            />
          </Flex>
        </Flex>
        
        {renderContent()}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </VStack>

      <SearchDrawer />
    </Container>
  );
};

export default ProvidersPage;