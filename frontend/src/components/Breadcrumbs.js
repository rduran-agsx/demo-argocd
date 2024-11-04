import React, { useRef, useEffect, useState } from 'react';
import { Flex, Text, Link, Tooltip, useColorModeValue } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

const BreadcrumbItem = React.memo(({ 
  item, 
  isTruncated, 
  innerRef,
  currentPageColor,
  linkColor,
  hoverColor,
  tooltipBg,
  tooltipColor,
  tooltipBorderColor,
  tooltipBoxShadow
}) => {
  const content = (
    <Text
      color={item.isCurrentPage ? currentPageColor : linkColor}
      fontFamily="body"
      fontWeight="500"
      fontSize="16px"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      maxWidth={isTruncated ? "50px" : "none"}
      ref={innerRef}
      as={item.isCurrentPage ? "span" : Link}
      href={item.isCurrentPage ? undefined : item.href}
      _hover={item.isCurrentPage ? undefined : {
        textDecoration: 'underline',
        color: hoverColor
      }}
      transition="color 0.2s"
    >
      {isTruncated ? item.label.slice(0, 3) + '...' : item.label}
    </Text>
  );

  if (isTruncated) {
    return (
      <Tooltip 
        label={item.label} 
        aria-label="Full breadcrumb text"
        bg={tooltipBg}
        color={tooltipColor}
        borderRadius="md"
        border="1px solid"
        borderColor={tooltipBorderColor}
        boxShadow={tooltipBoxShadow}
        padding="2"
        fontSize="sm"
      >
        {content}
      </Tooltip>
    );
  }

  return content;
});

const Breadcrumbs = ({ items }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [itemWidths, setItemWidths] = useState([]);

  const currentPageColor = useColorModeValue('gray.500', 'gray.400');
  const linkColor = useColorModeValue('brand.primary.light', 'brand.primary.dark');
  const hoverColor = useColorModeValue('brand.primary.dark', 'brand.primary.light');
  const separatorColor = useColorModeValue('brand.border.light', 'brand.border.dark');
  const tooltipBg = useColorModeValue('brand.surface.light', 'brand.surface.dark');
  const tooltipColor = useColorModeValue('brand.text.light', 'brand.text.dark');
  const tooltipBorderColor = useColorModeValue('brand.border.light', 'brand.border.dark');
  const tooltipBoxShadow = useColorModeValue(
    '0 4px 0 0 black',
    '0 4px 0 0 rgba(255, 255, 255, 0.2)'
  );

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const availableWidth = container.offsetWidth;
        const newItemWidths = itemRefs.current.map(ref => ref ? ref.offsetWidth : 0);
        
        let totalWidth = newItemWidths.reduce((sum, width, index) => sum + width + (index > 0 ? 16 : 0), 0);
        
        if (totalWidth > availableWidth) {
          const middleIndex = Math.floor(items.length / 2);
          let i = middleIndex;
          let j = middleIndex;
          
          while (totalWidth > availableWidth && (i > 0 || j < items.length - 1)) {
            if (i > 0) {
              totalWidth -= newItemWidths[i] - 50;
              newItemWidths[i] = 50;
              i--;
            }
            if (j < items.length - 1 && totalWidth > availableWidth) {
              totalWidth -= newItemWidths[j] - 50;
              newItemWidths[j] = 50;
              j++;
            }
          }
        } else {
          newItemWidths.fill(null);
        }
        
        setItemWidths(newItemWidths);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [items]);

  return (
    <Flex 
      align="center" 
      ref={containerRef} 
      overflow="hidden" 
      width="100%"
      transition="all 0.2s"
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRightIcon 
              mx={1} 
              color={separatorColor} 
              flexShrink={0} 
              boxSize={3}
              transition="color 0.2s"
            />
          )}
          <BreadcrumbItem
            item={item}
            isTruncated={itemWidths[index] === 50}
            innerRef={el => itemRefs.current[index] = el}
            currentPageColor={currentPageColor}
            linkColor={linkColor}
            hoverColor={hoverColor}
            tooltipBg={tooltipBg}
            tooltipColor={tooltipColor}
            tooltipBorderColor={tooltipBorderColor}
            tooltipBoxShadow={tooltipBoxShadow}
          />
        </React.Fragment>
      ))}
    </Flex>
  );
};

export default Breadcrumbs;