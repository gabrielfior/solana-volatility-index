import { Box, Flex, Heading, Text, Button, Center } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Header = () => {
    return (
        <>
            <Center>
                <Box style={{ margin: "10px"}} h='calc(5vh)'>
                    <Heading mb={4}>
                        Solindex
                        <Button style={{ marginLeft: "20px" }} colorScheme='blue'><a href="https://www.twitter.com/wiskDev" target={"_blank"} >
                            Twitter
                        </a>
                        </Button>
                    </Heading>
                    <Text fontSize='xl'>
                        Solana Volatility Index
                    </Text>
                </Box>
            </Center>
        </>
    );
}

export default Header;