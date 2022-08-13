import { Box, Flex,  Heading } from "@chakra-ui/react";

const Header = () => {
    return (
        <Box
            pos="fixed"
            as="header"
            top="0"
            bg='#242730'
            left="0"
            right="0"
            borderBottomWidth="1px"
            width="full"
            height="4rem"
        >
            <Box width="full" mx="auto" px={6} pr={[1, 6]} height="100%" >
                <Flex size="100%" p={[0, 3]} pl={[0, 4]} align="center" justify="space-between">
                    <Box as="a" d="block" href="/" aria-label="VisX Area Chart">
                        <Heading color="gray.100" as="h4" size="md">Volatility Index</Heading>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}

export default Header;